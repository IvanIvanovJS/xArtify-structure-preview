# 📖 Guide: Creating Public Portfolio Branch

## 🎯 Цел

Създаване на публичен branch, който показва:

- ✅ Структура на проекта
- ✅ Брой commits
- ✅ Технологичен stack
- ✅ Организация на кода
- ❌ БЕЗ чувствителна бизнес логика

---

## 🚀 Стъпка по стъпка

### 1. Backup на текущия код

```bash
# Създай backup branch
git checkout -b backup-main
git push origin backup-main

# Върни се на main
git checkout main
```

### 2. Създай нов public branch

```bash
# Създай нов branch от main
git checkout -b public-portfolio

# Или създай orphan branch (без история)
git checkout --orphan public-portfolio
```

### 3. Изпълни sanitization скриптовете

```bash
# Направи скриптовете executable
chmod +x scripts/sanitize-for-public.sh

# Изпълни sanitization
node scripts/sanitize-code.js
```

### 4. Ръчно провери и редактирай

#### Файлове за пълно изтриване:

```bash
rm -rf .env*
rm -rf supabasePolicies/
rm -rf node_modules/
rm -rf .next/
```

#### Файлове за sanitization (запази структурата):

**API Routes** (`app/api/**/*.ts`):

```typescript
// app/api/paintings/route.ts
import { NextRequest, NextResponse } from "next/server";

// ============================================
// 🔒 API IMPLEMENTATION HIDDEN
// ============================================
// Full CRUD implementation with:
// - Advanced filtering and pagination
// - Zod validation
// - Rate limiting
// - Session authentication
// - Database transactions
//
// Available for review during interviews
// ============================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Implementation hidden
  return NextResponse.json({ message: "Implementation hidden for portfolio" });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Implementation hidden
  return NextResponse.json({ message: "Implementation hidden for portfolio" });
}
```

**Components** (`components/**/*.tsx`):

```typescript
// components/gallery/GalleryGrid.tsx
import { useState } from "react";

interface GalleryGridProps {
  paintings: Painting[];
  onSelect: (id: string) => void;
}

// ============================================
// 🔒 COMPONENT IMPLEMENTATION HIDDEN
// ============================================
// Features:
// - Responsive grid layout
// - Lazy loading
// - Hover effects
// - Favorite functionality
// ============================================

export default function GalleryGrid({ paintings, onSelect }: GalleryGridProps) {
  // Implementation hidden for portfolio
  return <div>Component structure preserved</div>;
}
```

**Lib files** (`lib/*.ts`):

```typescript
// lib/authOptions.ts
import { type NextAuthOptions } from "next-auth";

// ============================================
// 🔒 AUTHENTICATION CONFIG HIDDEN
// ============================================
// Implements:
// - Multi-provider auth (Credentials, Google, Facebook)
// - JWT strategy with role-based access
// - Session management
// - Account linking
// ============================================

export const authOptions: NextAuthOptions = {
  // Configuration hidden
} as NextAuthOptions;
```

**Middleware** (`middleware.ts`):

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// ============================================
// 🔒 SECURITY MIDDLEWARE HIDDEN
// ============================================
// Implements:
// - Content Security Policy (CSP)
// - Security headers (HSTS, X-Frame-Options, etc.)
// - Route protection
// - Session validation
// ============================================

export async function middleware(request: NextRequest) {
  // Implementation hidden
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### 5. Запази важни файлове ПЪЛНИ:

#### ✅ Остави непроменени:

- `package.json` - показва dependencies
- `tsconfig.json` - TypeScript конфигурация
- `next.config.ts` - Next.js setup
- `tailwind.config.ts` - Styling setup
- `prisma/schema.prisma` - Database schema (БЕЗ credentials)
- `.gitignore` - Git конфигурация
- `README.md` - Документация
- `PORTFOLIO.md` - Case study

### 6. Създай специален README за public branch

```bash
# Вече е създаден от скрипта
cat README.md
```

### 7. Commit и push

```bash
# Add всички промени
git add .

# Commit
git commit -m "feat: Create sanitized public portfolio branch

- Preserve project structure and file organization
- Hide proprietary business logic
- Maintain commit history
- Keep technology stack visible
- Remove sensitive credentials and implementations"

# Push to new public branch
git push origin public-portfolio
```

### 8. Създай GitHub repo и push

```bash
# Създай ново празно repo в GitHub: xartify-portfolio

# Add remote
git remote add public https://github.com/yourusername/xartify-portfolio.git

# Push public branch
git push public public-portfolio:main

# Или push само public branch към същото repo
git push origin public-portfolio
```

---

## 📊 Какво ще видят хората

### ✅ Видимо:

```
xartify/
├── 📁 app/
│   ├── 📁 api/              # API structure (logic hidden)
│   ├── 📁 admin/            # Admin pages (logic hidden)
│   ├── 📁 gallery/          # Gallery pages (logic hidden)
│   └── ...
├── 📁 components/           # Component structure (logic hidden)
├── 📁 lib/                  # Utilities (logic hidden)
├── 📁 prisma/
│   └── schema.prisma        # Full database schema ✅
├── package.json             # Full dependencies ✅
├── tsconfig.json            # TypeScript config ✅
├── README.md                # Documentation ✅
└── PORTFOLIO.md             # Case study ✅

Commits: 150+ ✅
File structure: Complete ✅
Tech stack: Visible ✅
Business logic: Hidden 🔒
```

### ❌ Скрито:

- API implementations
- Authentication logic
- Payment processing
- Database queries
- Security middleware
- Webhook handlers
- Business algorithms
- .env files

---

## 🎨 Алтернативен подход: Dummy Content

Ако искаш да покажеш повече структура:

```typescript
// app/api/paintings/route.ts
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Step 1: Rate limiting check
  // [Implementation hidden]

  // Step 2: Parse and validate query parameters
  // [Implementation hidden]

  // Step 3: Build Prisma where clause with filters
  // [Implementation hidden]

  // Step 4: Execute optimized database query
  // [Implementation hidden]

  // Step 5: Return paginated results
  return NextResponse.json({
    items: [],
    total: 0,
    page: 1,
    pageSize: 24,
  });
}
```

---

## 🔄 Maintenance

### Когато добавяш нови features:

```bash
# На main branch
git checkout main
# ... develop new features ...
git commit -m "feat: New feature"

# Update public branch
git checkout public-portfolio
git merge main --no-commit
node scripts/sanitize-code.js
git add .
git commit -m "feat: Update public portfolio with new structure"
git push origin public-portfolio
```

---

## 📝 GitHub Repository Settings

### За public repo:

1. **Settings → General**

   - Description: "Portfolio showcase - Structure only, implementation hidden"
   - Website: https://xartify.com
   - Topics: `nextjs`, `typescript`, `portfolio`, `react`, `prisma`

2. **Settings → Security**

   - Enable Dependabot alerts
   - Disable GitHub Actions (no CI/CD needed)

3. **Add README badge**
   ```markdown
   [![Portfolio](https://img.shields.io/badge/Type-Portfolio%20Showcase-blue)]()
   [![Code](https://img.shields.io/badge/Full%20Code-Available%20on%20Request-green)]()
   ```

---

## ✅ Checklist преди публикуване

- [ ] Backup на main branch създаден
- [ ] Всички .env файлове изтрити
- [ ] API logic заменена с placeholders
- [ ] Component logic заменена с placeholders
- [ ] Sensitive lib files sanitized
- [ ] Middleware sanitized
- [ ] supabasePolicies/ изтрита
- [ ] README.md обновен за public branch
- [ ] PORTFOLIO.md добавен
- [ ] package.json проверен (no secrets)
- [ ] Git history прегледан
- [ ] Test push към public repo

---

## 🎯 Резултат

Recruiters и employers ще видят:

- ✅ Професионална организация на кода
- ✅ Голям брой commits (твоята работа)
- ✅ Модерен tech stack
- ✅ Добра документация
- ✅ Enterprise-level структура
- 🔒 БЕЗ достъп до proprietary code

**Perfect for portfolio!** 🎨
