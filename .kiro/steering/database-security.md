---
inclusion: fileMatch
fileMatchPattern: ['**/prisma/**', '**/supabasePolicies/**']
---

# Database Security

## Critical Rules
- **ALWAYS create RLS policies** for CRUD operations requiring authorization
- **ALWAYS check `prisma/schema.prisma`** before creating SQL policies
- **ALWAYS store RLS policies** in `@supabasePolicies/` directory
- **ALWAYS validate schema** before writing SQL policies
- **NEVER use `npx prisma migrate reset --force`** - destroys all data

## RLS Policy Requirement
**MANDATORY**: When creating or refactoring CRUD functionality requiring authorization, ALWAYS provide corresponding SQL RLS policies for double-layer security.

## Schema Validation Steps
Before writing ANY SQL policy, ALWAYS:
1. Read `prisma/schema.prisma` to verify table and column names
2. Check for `@@map` directives that change table names
3. Verify column naming conventions (camelCase in Prisma = camelCase in DB)
4. Confirm foreign key relationships and field types
5. Test the policy syntax matches the actual database schema

## RLS Policy Storage
- **Location**: ALL RLS policies MUST be stored in `@supabasePolicies/` directory
- **Discovery**: When checking existing RLS policies, ALWAYS look in `@supabasePolicies/` folder first
- **Creation**: When creating new RLS policies, save them in `@supabasePolicies/` directory with descriptive filename

## RLS Policy Pattern
```sql
-- Enable RLS on table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies for each operation
CREATE POLICY "policy_name_select" ON table_name
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "policy_name_insert" ON table_name
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "policy_name_update" ON table_name
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "policy_name_delete" ON table_name
  FOR DELETE USING (auth.uid()::text = user_id);
```

## Prisma Schema Patterns
```prisma
// ✅ REQUIRED: Proper model relationships with RLS
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  role          String    @default("USER")
  artistProfile ArtistProfile?
  paintings     Painting[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("users")
}

model Painting {
  id        String    @id @default(cuid())
  title     String
  price     Float
  artistId  String
  artist    ArtistProfile @relation(fields: [artistId], references: [id])
  createdAt DateTime  @default(now())
  
  @@map("paintings")
}
```

## Data Access Patterns
- Use Prisma's `include` for related data
- Implement proper error handling
- Use transactions for complex operations
- Validate data before database operations

## Database Migration Safety
```bash
# ✅ SAFE: Use these commands
npx prisma db push
npx prisma migrate dev

# ❌ DANGEROUS: Never use these
npx prisma migrate reset --force
npx prisma db reset
```

## Documentation Requirement
**MANDATORY**: Every time you create or refactor new functionality, you MUST create comprehensive `.md` documentation files explaining:
- Purpose and overview
- API endpoints and their parameters
- Database schema changes
- Security considerations and RLS policies
- Usage examples and integration patterns
- Error handling and edge cases

## Reference
For detailed RLS policy examples and workflows, see: `docs/cursor-agent/rls-policy-templates.md`