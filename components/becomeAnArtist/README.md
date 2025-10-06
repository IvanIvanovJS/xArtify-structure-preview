# Subscription-Based Artist Onboarding System

## Overview

The subscription-based artist onboarding system provides a comprehensive solution for artists to join the xArtify platform with different subscription tiers. The system includes pricing plans, profile creation, payment processing, and subscription management.

## Components

### SubscriptionPlansClient
- **Purpose**: Displays subscription plans with pricing and features
- **Features**: Monthly/yearly toggle, feature comparison table, payment integration
- **Location**: `components/becomeAnArtist/SubscriptionPlansClient.tsx`

### ArtistProfileForm
- **Purpose**: Comprehensive artist profile creation form
- **Features**: Personal info, contact details, FAQ management, 2FA setup
- **Location**: `components/becomeAnArtist/ArtistProfileForm.tsx`

### PaymentPageClient
- **Purpose**: Payment processing with Stripe integration
- **Features**: Billing cycle selection, payment summary, secure processing
- **Location**: `components/becomeAnArtist/PaymentPageClient.tsx`

## Subscription Plans

### Free Plan
- **Price**: €0/month
- **Features**: 5 active paintings, 30% commission, minimal analytics

### Medium Plan (Recommended)
- **Price**: €20/month (€192/year with 20% discount)
- **Features**: 30 active paintings, 20% commission, extended analytics

### High Plan
- **Price**: €200/month (€1920/year with 20% discount)
- **Features**: Unlimited paintings, 3% commission, full analytics

## API Endpoints

### Artist Profile Creation
- **POST** `/api/become-an-artist/create-profile`
- **Purpose**: Creates artist profile with subscription
- **Validation**: Zod schema validation

### Subscription Completion
- **POST** `/api/become-an-artist/complete-subscription`
- **Purpose**: Activates subscription after payment
- **Integration**: Stripe payment verification

### Admin Functions
- **POST** `/api/admin/seed-subscription-plans`
- **Purpose**: Creates initial subscription plans

## Security Features

### Row Level Security (RLS)
- Subscription plans: Public read, admin write
- Artist subscriptions: User ownership, admin access
- Artist FAQs: User ownership, public read

### Authentication
- NextAuth.js session validation
- Role-based access control
- Stripe payment verification
- Phone number validation

## Future Enhancements

### Planned Features
- [ ] Subscription plan upgrades/downgrades
- [ ] Prorated billing for mid-cycle changes
- [ ] Advanced analytics dashboard
- [ ] Automated email campaigns
- [ ] Multi-language support
- [ ] Mobile app integration
- [ ] Advanced payment methods
- [ ] Subscription analytics and reporting
- [ ] Automated compliance checking
- [ ] Integration with external art platforms

### Technical Improvements
- [ ] Webhook reliability improvements
- [ ] Advanced caching strategies
- [ ] Database query optimization
- [ ] Real-time subscription status updates
- [ ] Advanced error recovery mechanisms
- [ ] Performance monitoring dashboard
- [ ] Automated testing coverage
- [ ] API rate limiting improvements
- [ ] Security audit and penetration testing
- [ ] Documentation automation

## Setup Instructions

### Database Migration
```bash
# Generate and apply migration
npx prisma migrate dev --name add-subscription-system

# Apply RLS policies
psql -d your_database -f supabasePolicies/subscription-plans-rls-policies.sql

# Seed subscription plans (admin only)
curl -X POST /api/admin/seed-subscription-plans
```

### Environment Variables
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
DATABASE_URL=postgresql://...
```

## Troubleshooting

### Common Issues
- Payment failures: Check Stripe configuration
- Subscription activation: Verify payment intent status
- Form validation: Check Zod schema definitions

### Debug Tools
- Stripe Dashboard for payment monitoring
- Database query logs for subscription tracking
- Browser developer tools for client-side debugging
- Server logs for API endpoint monitoring

