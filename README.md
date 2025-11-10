# 🎨 xArtify - Where Art Knows You

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://xartify.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 🚧 **Development Status**: This platform is currently in active development and testing phase in Bulgaria before worldwide expansion.

**Live Platform**: [https://xartify.com](https://xartify.com)

## 📋 Overview

xArtify is a comprehensive art marketplace and learning platform designed to connect artists with art enthusiasts worldwide. Built with modern web technologies, it provides a seamless experience for discovering, purchasing, and learning about art while empowering artists with professional tools to showcase and monetize their work.

### 🎯 Mission

To democratize art commerce and education by creating a global platform where artists can thrive professionally and art lovers can discover, purchase, and learn from talented creators worldwide.

### 🌍 Market Strategy

- **Phase 1 (Current)**: Beta testing and refinement in the Bulgarian market
- **Phase 2**: Expansion to European markets
- **Phase 3**: Global rollout with multi-language support and regional customization

---

## ✨ Core Features

### 🖼️ Art Gallery & Marketplace

- **Advanced Search & Filtering**: Search by technique, style, subject, dimensions, price range, and custom tags
- **Smart Pagination**: Optimized browsing with 24 items per page
- **SEO-Optimized URLs**: Unique, crawlable URLs for every artwork
- **Promotional System**: Built-in sale pricing with percentage-based discounts
- **High-Quality Images**: Support for up to 5 images per artwork with Cloudinary integration
- **Favorites System**: Users can save and track their favorite artworks
- **Real-time Availability**: Live updates on artwork availability and sales status

### 👨‍🎨 Artist Portal

- **Professional Profiles**: Customizable artist pages with bio, portfolio, and social media links
- **Artwork Management**: Upload, edit, and manage paintings with detailed metadata
- **Analytics Dashboard**: Track views, engagement, and sales performance
- **Subscription Tiers**: Three-tier system (Free, Medium, High) with varying features
- **Direct Communication**: Built-in messaging system for artist-buyer interactions
- **FAQ Management**: Custom FAQ sections for each artist profile

### 📚 Online Courses

- **Video-Based Learning**: High-quality video courses from professional artists
- **Course Materials**: Downloadable resources and supplementary materials
- **Progress Tracking**: Monitor learning progress and completed courses
- **Enrollment System**: Secure course access and management

### 💳 E-Commerce & Payments

- **Stripe Integration**: Secure payment processing for artworks and subscriptions
- **Shopping Cart**: Persistent cart with session management
- **Order Management**: Complete order history and tracking
- **Commission System**: Automated commission calculation based on subscription tier
- **Subscription Billing**: Monthly and yearly billing cycles with automatic renewal

### 🔐 Authentication & Security

- **Multi-Provider Auth**: Email/password, Google, and Facebook authentication
- **Role-Based Access Control**: USER, ARTIST, and ADMIN roles
- **Session Management**: Secure JWT-based sessions with NextAuth.js
- **Email Verification**: Automated email verification workflow
- **Password Reset**: Secure password recovery system
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **CSP Headers**: Content Security Policy with nonce-based script execution

### 📊 Admin Dashboard

- **User Management**: View, edit, and manage user accounts
- **Subscription Oversight**: Monitor and manage artist subscriptions
- **Analytics**: Platform-wide statistics and insights
- **Content Moderation**: Review and approve artist applications

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.0 (strict mode)
- **Styling**: Tailwind CSS 4.1.12 with custom design system
- **UI Components**: Headless UI, Lucide React icons
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API, SWR for server state

### Backend

- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM 6.13.0
- **Authentication**: NextAuth.js v4.24.11
- **File Storage**: Cloudinary
- **Email**: Resend
- **Rate Limiting**: Upstash Redis

### Payments & Subscriptions

- **Payment Gateway**: Stripe
- **Subscription Management**: Stripe Subscriptions API
- **Webhooks**: Automated subscription lifecycle handling

### DevOps & Deployment

- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CDN**: Cloudinary for image optimization
- **Monitoring**: Vercel Analytics

---

## 🎨 Design System

### Color Palette

```css
--background: #0b0b0f      /* Deep dark gray */
--foreground: #e5e7eb      /* Readable neutral */
--primary: #16ffe4         /* Neon cyan accent */
--muted: #1a1a20           /* Subtle gray */
--muted-foreground: #9ca3af /* Secondary text */
--promotion: #ff7016       /* Orange for sales */
```

### Typography

- **Font Family**: Inter (Google Fonts)
- **Base Size**: 16px
- **Line Height**: 1.5
- **Font Smoothing**: Antialiased

### Design Principles

- **Mobile-First**: Responsive design optimized for all devices
- **Dark Theme**: Elegant grayscale with neon accents
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized loading and rendering

---

## 📁 Project Structure

```
art-platform/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgotten-password/
│   ├── admin/               # Admin dashboard
│   │   ├── users/
│   │   └── subscriptions/
│   ├── api/                 # API routes
│   │   ├── paintings/       # Artwork CRUD
│   │   ├── artists/         # Artist profiles
│   │   ├── courses/         # Course management
│   │   ├── auth/            # Authentication
│   │   └── webhooks/        # Stripe webhooks
│   ├── artist/              # Artist portal
│   │   ├── analytics/
│   │   ├── artworks/
│   │   └── settings/
│   ├── gallery/             # Public gallery
│   ├── my-profile/          # User dashboard
│   └── become-an-artist/    # Artist onboarding
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── forms/               # Form components
│   ├── gallery/             # Gallery components
│   └── admin/               # Admin components
├── lib/                     # Utility functions
│   ├── authOptions.ts       # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   ├── rateLimit.ts         # Rate limiting
│   └── validators/          # Zod schemas
├── prisma/                  # Database schema
│   └── schema.prisma
├── public/                  # Static assets
├── docs/                    # Documentation
└── supabasePolicies/        # RLS policies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Stripe account
- Cloudinary account
- Google OAuth credentials (optional)
- Facebook OAuth credentials (optional)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/IvanIvanovJS/xArtify-art-platform.git
cd xartify
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://..."
SUPABASE_DB_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

# Rate Limiting
KV_REST_API_URL="your-upstash-url"
KV_REST_API_TOKEN="your-upstash-token"

# Email
RESEND_API_KEY="your-resend-api-key"
```

4. **Set up the database**

```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📊 Database Schema

### Core Models

- **User**: Authentication and user profiles
- **ArtistProfile**: Extended artist information
- **Painting**: Artwork listings with metadata
- **Course**: Educational content
- **Subscription**: Artist subscription management
- **Sale**: Transaction records
- **Conversation/Message**: Direct messaging system

### Key Features

- **Row Level Security (RLS)**: Database-level authorization
- **Optimized Indexes**: Fast queries on frequently accessed fields
- **Cascading Deletes**: Automatic cleanup of related records
- **Audit Trails**: Created/updated timestamps on all models

---

## 🔒 Security Features

### Authentication

- Secure password hashing with bcrypt (12 rounds)
- JWT-based session management
- OAuth 2.0 integration (Google, Facebook)
- Email verification workflow
- Password reset with time-limited tokens

### Authorization

- Role-based access control (RBAC)
- Row Level Security (RLS) policies
- Session validation on all protected routes
- CSRF protection

### Infrastructure

- Content Security Policy (CSP) with nonces
- Rate limiting on all API endpoints
- HTTPS enforcement in production
- Secure headers (HSTS, X-Frame-Options, etc.)
- Input validation with Zod schemas

---

## 📈 Performance Optimizations

- **Image Optimization**: Next.js Image component with Cloudinary CDN
- **Code Splitting**: Automatic route-based code splitting
- **Server Components**: React Server Components for faster initial loads
- **Database Indexing**: Strategic indexes on frequently queried fields
- **Caching**: SWR for client-side data caching
- **Lazy Loading**: Dynamic imports for heavy components

---

## 🌐 API Documentation

### Public Endpoints

- `GET /api/paintings` - List artworks with filtering and pagination
- `GET /api/artists` - List artist profiles
- `GET /api/courses` - List available courses

### Protected Endpoints

- `POST /api/paintings` - Create new artwork (Artist/Admin)
- `PUT /api/paintings/[id]` - Update artwork (Artist/Admin)
- `DELETE /api/paintings/[id]` - Delete artwork (Artist/Admin)
- `POST /api/become-an-artist` - Submit artist application
- `POST /api/create-subscription` - Create artist subscription

### Admin Endpoints

- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[id]` - Update user
- `GET /api/admin/subscriptions` - Manage subscriptions

---

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Database migrations
npx prisma migrate dev
```

---

## 📦 Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository to Vercel**
2. **Configure environment variables** in Vercel dashboard
3. **Deploy**

```bash
vercel --prod
```

### Manual Deployment

1. **Build the application**

```bash
npm run build
```

2. **Start production server**

```bash
npm start
```

---

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built by the webmorphism team with love and dedication. We're passionate about creating innovative solutions and making a positive impact in the digital world.

- **Founder & Artist**: [Sara Georgieva](https://www.facebook.com/XMarkstheArts)
- **Lead Developer**: [Ivan Ivanov](https://webmorphism.com)

We're a small team with a shared passion for creating exceptional digital experiences. Join us on this journey as we shape the future of webmorphisms and make a difference in the digital landscape.

---

## 📞 Contact & Support

- **Website**: [https://xartify.com](https://xartify.com)
- **Email**: xartquote@gmail.com
- **Issues**: [GitHub Issues](https://github.com/IvanIvanovJS/xArtify-art-platform/issues)

---

## 🗺️ Roadmap

### Current Phase (Q3 2025 - Q4 2025)

- ✅ Core marketplace functionality
- ✅ Artist portal and subscription system
- ✅ Payment integration with Stripe
- ✅ Admin dashboard
- 🔄 Courses and online learning system
- 🔄 User dashboard with messaging system
- 🔄 Beta testing in Bulgarian market

### Phase 2 (Q1 2026 - Q4 2026)

- 🔜 Multi-language support (EN, BG, DE, FR)
- 🔜 Advanced analytics for artists
- 🔜 Artist collaboration tools
- 🔜 Auction system for artworks
- 🔜 Mobile app (iOS/Android)

### Phase 3 (2027 - 2030)

- 🔜 AI-powered art recommendations
- 🔜 Virtual gallery tours (VR/AR)
- 🔜 NFT integration
- 🔜 Worldwide expansion

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Stripe for payment processing
- All contributing artists and beta testers

---

**Made with ❤️ for artists and art lovers worldwide**
