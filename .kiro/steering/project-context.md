---
inclusion: always
---

# Project Context - xArtify Art Platform

## Project Overview
xArtify is a Bulgarian art platform built with Next.js 15, featuring:
- Art gallery with paintings from artists
- Online courses and materials
- Artist profiles and artwork management
- E-commerce with Stripe payments
- Admin dashboard for platform management
- Mobile-first responsive design with grayscale + neon theme

## Core Technologies & Stack
- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v4 with multiple providers
- **Styling**: Tailwind CSS v4 with custom CSS modules
- **Payments**: Stripe integration
- **Image Storage**: Cloudinary
- **Rate Limiting**: Upstash Redis
- **Email**: Resend
- **Deployment**: Vercel

## Visual Design System

### Color Palette
- **Background**: `#0b0b0f` (deep dark gray)
- **Foreground**: `#e5e7eb` (readable neutral)
- **Primary**: `#16ffe4` (neon cyan accent)
- **Muted**: `#1a1a20` (subtle gray)
- **Muted Foreground**: `#9ca3af` (secondary text)
- **Promotion/Discount**: `#ff7016` (orange for sales and discounts)

### Typography
- **Font**: Inter (Google Fonts)
- **Base size**: 16px
- **Line height**: 1.5 for readability
- **Font smoothing**: antialiased

### Loading Spinner Standards
- **Large spinners**: `border: 4px solid var(--color-primary-20); border-left: 4px solid var(--color-primary);`
- **Small spinners**: `border: 2px solid var(--color-primary-20); border-left: 2px solid var(--color-primary);`
- **Animation**: Always use `animation: spin 1s linear infinite;`

## File Organization
```
app/
├── api/           # API routes
├── (auth)/        # Auth pages
├── admin/         # Admin pages
├── gallery/       # Gallery pages
└── components/    # Reusable components

components/
├── ui/            # Base UI components
├── forms/         # Form components
└── layout/        # Layout components

docs/              # Documentation files
├── api/           # API documentation
├── components/    # Component documentation
└── features/      # Feature documentation
```

## Environment Variables
```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
CLOUDINARY_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```