---
inclusion: always
---

# Core Principles - xArtify Art Platform

## 🚨 CRITICAL RULES (NEVER VIOLATE)

### TypeScript
- **NEVER use `any` type** - always provide explicit types
- **MANDATORY: NO `any` under any circumstances** - wastes tokens and creates errors
- Use `interface` for object shapes, `type` for unions/primitives
- Always type function parameters and return values

### Database
- **NEVER use `npx prisma migrate reset --force`** - destroys all data
- **ALWAYS use `npx prisma db push` or `npx prisma migrate dev`** for schema changes
- **NEVER suggest database reset commands** - use safe migration approaches only

### Security
- **ALWAYS create RLS policies** for CRUD operations requiring authorization
- **ALWAYS create .md documentation** for new/refactored functionality
- **ALWAYS validate inputs** with Zod schemas
- **ALWAYS check session** in protected routes

### Styling
- **NEVER use inline styles** - always create separate CSS files
- **ALL components MUST be transparent by default** - no background colors unless explicitly requested
- Use CSS modules or separate `.css` files for component styling
- Follow pattern: `components/ComponentName/styles/component.css`

### AI Agent Behavior
- **Token economy mode**: ALWAYS respond with SHORT, concise messages
- **Complete integration rule**: ALWAYS integrate new components into their intended pages/routes
- **NEVER leave components unused** - always add them to appropriate page
- Focus on implementation results, not process descriptions

## Response Format
- Use bullet points and brief status updates
- Example: "✅ Fixed X issue. Modified: file1.tsx, file2.css"
- Only give detailed explanations when explicitly requested