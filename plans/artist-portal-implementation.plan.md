<!-- 67844b83-c272-4590-8fb5-ed43616a1628 77d5a679-4af4-46ba-9c75-febe9f323973 -->
# План за Имплементация на Артист Портал (/artist)

## Обхват и цели

Създаваме пълноценен артист портал на път `/artist` с подстраници: `/dashboard`, `/artworks`, `/courses`, `/analytics`, `/settings`, `/messages`. Изисквания от вас:

- 1-a: Артистите създават и управляват собствени курсове (схема промяна)
- 2-a: Пълна аналитика (кликове/прегледи на картини и профил, продажби)
- 3-b: Пълно двупосочно съобщаване (нишки/разговори)

Придържаме се към правилата в `.cursorrules` (TypeScript строг, Zod валидиция, NextAuth, Upstash rate limit, Resend имейл, Tailwind v4 + CSS файлове, RLS, документиране).

## Архитектурни принципи

- Next.js App Router (Server Components за страници/layout, Client Components за интеракции)
- Auth: `getServerSession(authOptions)` на всички защитени маршрути + роля ARTIST
- Валидация: Zod за вход в API; без `any`
- Rate limiting: Upstash Redis (глобално + endpoint-специфично)
- RLS: пълен набор SQL политики за всички CRUD, в `@supabasePolicies/`
- CSS: отделни `.css` файлове за всеки компонент; без inline styles; прозрачни компоненти по подразбиране; унифицирани спинъри
- Документация: `.md` файлове в `docs/` + `components/*/README.md`

## Промени по БД (Prisma Schema)

Файл: `prisma/schema.prisma`

1) Курсове към артист

```prisma
model Course {
  id          String    @id @default(cuid())
  title       String
  description String?
  price       Float
  videoUrls   String[]
  artistId    String               // NEW
  artist      ArtistProfile @relation(fields: [artistId], references: [id], onDelete: Cascade) // NEW
  materials   Material[]
  enrollments Enrollment[]
  thumbnailUrl String?             // NEW
  createdAt   DateTime  @default(now()) // NEW
  updatedAt   DateTime  @updatedAt      // NEW
  @@index([artistId])
}

model ArtistProfile {
  // ... existing
  courses      Course[]            // NEW
}
```

2) Аналитика (прегледи и продажби)

```prisma
model PaintingView {
  id         String   @id @default(cuid())
  paintingId String
  painting   Painting @relation(fields: [paintingId], references: [id], onDelete: Cascade)
  userId     String?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())
  @@index([paintingId])
  @@index([createdAt])
  @@map("painting_views")
}

model ProfileView {
  id        String   @id @default(cuid())
  artistId  String
  artist    ArtistProfile @relation(fields: [artistId], references: [id], onDelete: Cascade)
  userId    String?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  @@index([artistId])
  @@index([createdAt])
  @@map("profile_views")
}

model Sale {
  id               String   @id @default(cuid())
  paintingId       String
  painting         Painting @relation(fields: [paintingId], references: [id])
  artistId         String
  artist           ArtistProfile @relation(fields: [artistId], references: [id])
  buyerId          String
  buyer            User @relation(fields: [buyerId], references: [id])
  salePrice        Float
  commissionRate   Float
  commissionAmount Float
  stripePaymentId  String?
  status           String   // pending|completed|refunded
  createdAt        DateTime @default(now())
  completedAt      DateTime?
  @@index([artistId])
  @@index([paintingId])
  @@index([createdAt])
  @@map("sales")
}

model Painting {
  // ... existing
  status String @default("published")  // NEW: draft|published
  views  PaintingView[]                 // NEW
  sales  Sale[]                         // NEW
}

model ArtistProfile {
  // ... existing
  profileViews          ProfileView[]   // NEW
  sales                 Sale[]          // NEW
  emailNotifications    Boolean @default(true)   // NEW
  messageNotifications  Boolean @default(true)   // NEW
  salesNotifications    Boolean @default(true)   // NEW
}

model User {
  // ... existing
  purchases Sale[]                       // NEW
}
```

3) Съобщения (двупосочно, нишки)

```prisma
model Conversation {
  id               String   @id @default(cuid())
  userId           String
  artistId         String
  user             User @relation(fields: [userId], references: [id], onDelete: Cascade)
  artist           ArtistProfile @relation(fields: [artistId], references: [id], onDelete: Cascade)
  lastMessageAt    DateTime @default(now())
  userUnreadCount  Int @default(0)
  artistUnreadCount Int @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  messages         Message[]
  @@unique([userId, artistId])
  @@index([userId])
  @@index([artistId])
  @@index([lastMessageAt])
  @@map("conversations")
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  senderType     String   // USER|ARTIST
  content        String   @db.Text
  isRead         Boolean  @default(false)
  createdAt      DateTime @default(now())
  @@index([conversationId])
  @@index([createdAt])
  @@map("messages")
}
```

Команди: спазваме правилата

- Никога: `npx prisma migrate reset --force`
- Да: `npx prisma migrate dev` (локално) или `npx prisma db push` при нужда

Преди писане на SQL политики: валидираме реални имена на таблици и полета (проверяваме `@@map`).

## RLS Политики (SQL)

Място: `@supabasePolicies/`

1) Курсове — `artist-courses-rls-policies.sql`

```sql
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists view own courses" ON "Course"
  FOR SELECT USING ("artistId" IN (SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text));

CREATE POLICY "Artists create courses" ON "Course"
  FOR INSERT WITH CHECK ("artistId" IN (SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text));

CREATE POLICY "Artists update own courses" ON "Course"
  FOR UPDATE USING ("artistId" IN (SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text));

CREATE POLICY "Artists delete own courses" ON "Course"
  FOR DELETE USING ("artistId" IN (SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text));

-- (по избор) Публичен SELECT само за публикувани курсове, ако добавим поле `published`
```

2) Аналитика — `artist-analytics-rls-policies.sql`

```sql
ALTER TABLE painting_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert painting views" ON painting_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert profile views" ON profile_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Artists select own painting views" ON painting_views
  FOR SELECT USING (
    painting_id IN (
      SELECT id FROM "Painting" WHERE "artistId" IN (
        SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text
      )
    )
  );

CREATE POLICY "Artists select own profile views" ON profile_views
  FOR SELECT USING (
    artist_id IN (
      SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Artists select own sales" ON sales
  FOR SELECT USING (
    artist_id IN (
      SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text
    )
  );

-- Вмъкване на продажби: от системен контекст (webhook/админ)
```

3) Съобщения — `artist-messaging-rls-policies.sql`

```sql
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users/Artists select own conversations" ON conversations
  FOR SELECT USING (
    user_id = auth.uid()::text OR artist_id IN (SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text)
  );

CREATE POLICY "Users/Artists insert conversations" ON conversations
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::text OR artist_id IN (SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text)
  );

CREATE POLICY "Users/Artists update conversations" ON conversations
  FOR UPDATE USING (
    user_id = auth.uid()::text OR artist_id IN (SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text)
  );

CREATE POLICY "Users/Artists select own messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        user_id = auth.uid()::text OR artist_id IN (SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text)
    )
  );

CREATE POLICY "Users/Artists insert messages" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        user_id = auth.uid()::text OR artist_id IN (SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text)
    )
  );

CREATE POLICY "Users/Artists update messages (read)" ON messages
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        user_id = auth.uid()::text OR artist_id IN (SELECT id FROM "ArtistProfile" WHERE "userId" = auth.uid()::text)
    )
  );
```

Бележка: Преди изпълнение — верифицирайте реалните имена на колони (snake/camel) спрямо `@@map`.

## API Маршрути (App Router)

Общи правила: Всяка функция връща `Promise<NextResponse>`, проверява сесията, роля/собственост, Zod валидация, rate limit, безопасни заглавки.

- `app/api/artist/dashboard/route.ts`
  - GET: обзор (бр.картини, продадени/активни, бр.курсове, активен план от `ArtistSubscription`, последни 5 продажби, прегледи месец)

- `app/api/artist/artworks/route.ts`
  - GET: списък + филтри
  - POST: създаване картина
  - PATCH `/reorder`: пренареждане (масив от id → index)

- `app/api/artist/artworks/[id]/route.ts`
  - PUT: редакция
  - DELETE: изтриване

- `app/api/artist/courses/route.ts`
  - GET/POST: списък/създаване курс

- `app/api/artist/courses/[id]/route.ts`
  - PUT/DELETE: редакция/изтриване

- `app/api/artist/analytics/route.ts`
  - GET: пълна аналитика (продажби, комисионни, прегледи на картини/профил, топ картини, периодични графики)

- `app/api/analytics/track-view/route.ts`
  - POST: `{ type: 'painting'|'profile', id: string }` — записва view + ip + user-agent

- `app/api/artist/settings/route.ts`
  - GET/PUT: профил настройки (bio, телефон, локация, FAQ, нотификации, 2FA toggle)

- `app/api/artist/messages/route.ts`
  - GET: разговори с непрочетени
  - POST: изпрати съобщение (създава разговор при нужда)

- `app/api/artist/messages/[conversationId]/route.ts`
  - GET: съобщения по разговор
  - PATCH: маркира като прочетени

Валидационни схеми (Zod): `@/lib/validators/artist/*` (courses, artworks, messages, settings, reorder, analytics range)

Rate limiting: използвайте `limiter10perMin`, `limiterPublic` или локални броячи според endpoint-а.

## Страници и Layout

- `app/artist/layout.tsx` (Server):
  - Проверка на сесия + роля/`ArtistProfile`
  - Сайдбар навигация (Dashboard, Artworks, Courses, Analytics, Settings, Messages)
  - Бейдж за непрочетени съобщения
  - Мобилно меню

- `app/artist/page.tsx` → Dashboard
- `app/artist/artworks/page.tsx`
- `app/artist/courses/page.tsx`
- `app/artist/analytics/page.tsx`
- `app/artist/settings/page.tsx`
- `app/artist/messages/page.tsx`

Всяка страница е Server, рендерира Client компонентите по-долу.

## Клиент компоненти + CSS (structure)

Всеки компонент:

```
components/artist/ComponentName/
  ComponentName.tsx
  styles/component-name.css
  README.md
```

- `components/artist/ArtistDashboard/ArtistDashboard.tsx`
  - Карти: картини (активни/продадени), курсове, план, последни продажби, прегледи този месец
  - Спинър: стандартен (цветове от админ)
  - CSS: `styles/artist-dashboard.css`

- `components/artist/ArtworkManagement/ArtworkManagement.tsx`
  - Търсене/филтри/сортиране; grid/list; drag-drop; модали за редакция; изтриване с потвърждение; странициране
  - CSS: `styles/artwork-management.css`

- `components/artist/CourseManagement/CourseManagement.tsx`
  - Списък + форма за нов курс (title, desc, price, videoUrls[], thumbnailUrl, materials)
  - CSS: `styles/course-management.css`

- `components/artist/ArtistAnalytics/ArtistAnalytics.tsx`
  - Карти метрики + графики (Chart.js, dynamic import)
  - Таблици с сортиране; export CSV
  - CSS: `styles/artist-analytics.css`

- `components/artist/ArtistSettings/ArtistSettings.tsx`
  - Tab-и: Профил, FAQ, Нотификации, Сигурност (2FA)
  - Zod + React Hook Form; Upload с fallback
  - CSS: `styles/artist-settings.css`

- `components/artist/ArtistMessages/ArtistMessages.tsx`
  - Двуколонен изглед (desktop) / стек (mobile); списък разговори + нишка
  - Автоскрол, индикатор непрочетени; polling ~30s
  - CSS: `styles/artist-messages.css`

Всички dropdown-и → `@/components/ui/CustomDropdown`; без inline styles; прозрачни контейнери.

## Имейл известия (Resend)

Файл: `lib/email.ts` — добавяме:

- `sendMessageNotification({ to, artistName, senderName, messagePreview, conversationUrl })`
- `sendMessageReplyNotification({ to, artistName, messagePreview, conversationUrl })`

Тригер: при POST на ново съобщение/отговор. Спазваме rate limiting, не издаваме данни.

ENV: `RESEND_API_KEY`, `RESEND_FROM`, `APP_BASE_URL`

## Сигурност

- Сесия + роля ARTIST, собственост на ресурсите (artistId ↔ session.user.id via `ArtistProfile`)
- Zod валидация; CSP, HSTS, XFO, nosniff, Referrer-Policy
- RLS политики за всеки CRUD (описани горе)
- Rate limit за API:
  - Dashboard 60/min, Artworks CRUD 30/min, Courses CRUD 20/min, Analytics 30/min, Messages 60/min, Track-view 120/min

## Производителност / UX

- SWR за fetch + кеш; пагинация; lazy charts; оптимистични UI update
- Next/Image; responsive; скелетни екрани; touch размери ≥44px

## Документация

- `docs/features/artist-portal.md` (преглед и UX)
- `docs/api/artist-*.md` (всички крайни точки)
- `docs/database/schema-changes.md` (схема + RLS)
- `components/artist/*/README.md` (използване и пропс интерфейси)

## Интеграция (Complete Integration Rule)

- Създаваме компоненти → монтираме ги в съответните страници в `app/artist/*`
- Примери за употреба с реални API повиквания; без неизползвани компоненти

## Порядък на изпълнение

1) Schema промени → `npx prisma migrate dev`

2) RLS SQL файлове → прилагаме към БД

3) API endpoints (dashboard, artworks, courses, analytics, settings, messages, track-view)

4) Layout + навигация `/artist`

5) Компоненти: Dashboard → Artworks → Courses → Analytics → Settings → Messages

6) Имейл известия (on message send/reply)

7) Тестове (валид., rate limit, роля, RLS проверки)

8) Документация `.md`

## ENV

```
DATABASE_URL=
SUPABASE_DB_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
RESEND_API_KEY=
RESEND_FROM=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
APP_BASE_URL=
```

## Кратки типове/интерфейси (пример)

```ts
export interface ArtistOverview {
  paintings: { total: number; active: number; sold: number };
  courses: number;
  subscription: { plan: string; status: string } | null;
  sales: Array<{ id: string; price: number; createdAt: string }>;
  viewsThisMonth: number;
}

export interface ConversationListItem {
  id: string;
  otherPartyName: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}
```

---

## Todos

- [ ] Update Prisma schema (courses artistId, analytics, messaging, fields)
- [ ] Create/apply RLS policies (courses, analytics, messages)
- [ ] Build API: dashboard
- [ ] Build API: artworks CRUD + reorder
- [ ] Build API: courses CRUD
- [ ] Build API: analytics + track-view
- [ ] Build API: settings
- [ ] Build API: messages (threads, read, list)
- [ ] Create `/artist/layout.tsx` + nav
- [ ] Build components + CSS + README (Dashboard, Artworks, Courses, Analytics, Settings, Messages)
- [ ] Email notifications on new/reply messages
- [ ] Write docs in `docs/` and component READMEs

### To-dos

- [ ] Update Prisma schema (courses artistId, analytics, messaging, new fields)
- [ ] Create and apply RLS policies for courses, analytics, messaging
- [ ] Implement /api/artist/dashboard GET
- [ ] Implement artworks CRUD + reorder endpoints
- [ ] Implement courses CRUD endpoints
- [ ] Implement analytics endpoint + /api/analytics/track-view
- [ ] Implement artist settings GET/PUT endpoints
- [ ] Implement messaging endpoints (list, thread, send, read)
- [ ] Create /artist layout with auth checks and sidebar
- [ ] Build client components + CSS + READMEs for all pages
- [ ] Add Resend notifications for new messages and replies
- [ ] Write docs for features, API, database, and components