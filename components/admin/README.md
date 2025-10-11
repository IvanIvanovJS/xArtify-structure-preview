# Admin Subscription Management

## Overview

The Admin Subscription Management feature provides comprehensive tools for administrators to monitor, manage, and analyze artist subscriptions on the xArtify platform.

## Features

### 1. Subscription Overview
- **Basic Information Display**: Shows essential subscription details
- **Expandable Details**: "Show More" button reveals comprehensive information
- **Real-time Status Updates**: Live status indicators

### 2. Advanced Analytics
- **Revenue Tracking**: Monthly and yearly revenue calculations
- **Subscription Metrics**: Total subscriptions, active count, churn rate
- **Plan Distribution**: Visual breakdown of subscription plans
- **Monthly Trends**: Historical data over time

### 3. Administrative Controls
- **Subscription Actions**: Cancel, reactivate, or expire subscriptions
- **Reason Tracking**: Mandatory reason logging for all actions
- **Search and Filtering**: By user, status, and plan type

## API Endpoints

### GET `/api/admin/subscriptions`
Retrieves subscription data with optional analytics.

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `status` (string): Filter by subscription status
- `search` (string): Search by user name or email
- `analytics` (boolean): Include analytics data

### PUT `/api/admin/subscriptions`
Updates subscription status with administrative actions.

**Request Body:**
```typescript
{
  subscriptionId: string;
  action: "cancel" | "reactivate" | "expire";
  reason: string;
}
```

## Security

### Row Level Security (RLS) Policies
All operations are protected by RLS policies ensuring only administrators can access subscription data.

### Authentication & Authorization
- Session validation for all endpoints
- Role-based access (ADMIN only)
- Action logging with timestamps and reasons

## Component Usage

```typescript
import SubscriptionManagement from "@/components/admin/SubscriptionManagement";

// Basic usage
<SubscriptionManagement />

// With callback
<SubscriptionManagement onSubscriptionUpdated={() => {
  // Handle subscription update
}} />
```

## Future Enhancements

- [ ] Bulk operations for multiple subscriptions
- [ ] Advanced filtering with date ranges
- [ ] Export functionality (CSV/Excel)
- [ ] Automated reports
- [ ] Integration webhooks
- [ ] Audit trail
- [ ] Predictive analytics
- [ ] Multi-currency support
