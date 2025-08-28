// =============================================
// File: /lib/prisma.ts  (НОВ ФАЙЛ)
// =============================================
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        errorFormat: "pretty",
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// =============================================
// ПРИЛОЖЕНИ ДИФОВЕ — заместват местата с new PrismaClient()
// Копирай промените 1:1
// =============================================

// --- 1) NextAuth handler -----------------------------------------------
// File: /app/api/auth/[...nextauth]/route.ts
// (добави runtime=nodejs и замени adapter-а да ползва prisma от lib)
/*
@@
-import { PrismaClient } from "@prisma/client";
-import { PrismaAdapter } from "@next-auth/prisma-adapter";
-const prisma = new PrismaClient();
+import { PrismaAdapter } from "@next-auth/prisma-adapter";
+import { prisma } from "@/lib/prisma";
+export const runtime = "nodejs";
@@
-  adapter: PrismaAdapter(prisma),
+  adapter: PrismaAdapter(prisma) as any,
*/

// --- 2) Register API -----------------------------------------------------
// File: /app/api/register/route.ts
/*
@@
-import { PrismaClient } from "@prisma/client";
-const prisma = new PrismaClient();
+import { prisma } from "@/lib/prisma";
+export const runtime = "nodejs";
*/

// --- 3) Paintings CRUD API ----------------------------------------------
// File: /app/api/paintings/route.ts  (ако е разделен по [id]/route.ts, приложи същото)
/*
@@
-import { PrismaClient } from "@prisma/client";
-const prisma = new PrismaClient();
+import { prisma } from "@/lib/prisma";
+export const runtime = "nodejs";
*/

// --- 4) Други API/Server Actions ----------------------------------------
// За всеки файл в /app/api/**/route.ts и /app/**/actions.ts/ts
// ако има new PrismaClient() → замени с импорта + export const runtime = "nodejs";

// --- 5) Скриптове (seed/reset) ------------------------------------------
// File: /scripts/seed.ts (или /prisma/seed.ts)
/*
@@
-import { PrismaClient } from "@prisma/client";
-const prisma = new PrismaClient();
+import { prisma } from "@/lib/prisma";
@@
-  await prisma.$disconnect();
+  await prisma.$disconnect(); // ОК е само в standalone скриптове (НЕ в API routes)
*/

// =============================================
// ESLint защитa (по желание) — да забраните директен new PrismaClient()
// File: /.eslintrc.cjs  (добавете правилото)
/*
module.exports = {
  // ...
  rules: {
    // Забранява директен импорт/инстанциране извън lib/prisma
    "no-restricted-syntax": [
      "error",
      {
        selector: "NewExpression[callee.name='PrismaClient']",
        message: "Използвайте prisma от '@/lib/prisma' (singleton).",
      },
    ],
  },
};
*/

// =============================================
// Бележки за продъкшън:
// - НЕ извиквайте prisma.$disconnect() вътре в API роутове — в serverless това чупи следващи заявки.
// - Ако сте на edge runtime някъде → прехвърлете роута на node runtime (export const runtime = 'nodejs').
// - Ако БД е serverless (Neon/PlanetScale), използвайте препоръчания пул (pgBouncer/driver pooling).
