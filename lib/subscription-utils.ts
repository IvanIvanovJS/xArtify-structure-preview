import { ArtistSubscription, SubscriptionPlan } from "@prisma/client";

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'pending';

export interface SubscriptionLimits {
    maxActivePaintings: number;
    canUploadImages: boolean;
    canAccessAnalytics: boolean;
    canUseDirectCommunication: boolean;
    canReceiveEmailPromotions: boolean;
    canReceiveNotifications: boolean;
    hasUnlimitedUploads: boolean;
}

export function getSubscriptionLimits(subscription: ArtistSubscription & { plan: SubscriptionPlan }): SubscriptionLimits {
    const { plan, status } = subscription;

    // If subscription is not active, apply free plan limits
    if (status !== 'active') {
        return {
            maxActivePaintings: 5,
            canUploadImages: false,
            canAccessAnalytics: false,
            canUseDirectCommunication: false,
            canReceiveEmailPromotions: false,
            canReceiveNotifications: false,
            hasUnlimitedUploads: false,
        };
    }

    return {
        maxActivePaintings: plan.maxActivePaintings === -1 ? Infinity : plan.maxActivePaintings,
        canUploadImages: true,
        canAccessAnalytics: plan.analyticsAccess !== 'minimal',
        canUseDirectCommunication: plan.directCommunication,
        canReceiveEmailPromotions: plan.emailPromotions,
        canReceiveNotifications: plan.notifications,
        hasUnlimitedUploads: plan.unlimitedUploads,
    };
}

export function canCreatePainting(subscription: ArtistSubscription & { plan: SubscriptionPlan }, currentPaintingsCount: number): boolean {
    const limits = getSubscriptionLimits(subscription);
    return currentPaintingsCount < limits.maxActivePaintings;
}

export function canAccessFeature(subscription: ArtistSubscription & { plan: SubscriptionPlan }, feature: keyof SubscriptionLimits): boolean {
    const limits = getSubscriptionLimits(subscription);
    return limits[feature] === true;
}

export function getSubscriptionStatusMessage(subscription: ArtistSubscription): string {
    switch (subscription.status) {
        case 'active':
            if (subscription.cancelAtPeriodEnd) {
                return 'Абонаментът ще бъде спрян в края на текущия период.';
            }
            return 'Абонаментът е активен.';
        case 'past_due':
            return 'Плащането е просрочено. Моля, обновете метода си за плащане.';
        case 'cancelled':
            return 'Абонаментът е спрян.';
        case 'expired':
            return 'Абонаментът е изтекъл.';
        case 'pending':
            return 'Абонаментът се обработва.';
        default:
            return 'Неизвестен статус на абонамента.';
    }
}

export function isSubscriptionActive(subscription: ArtistSubscription): boolean {
    return subscription.status === 'active' && !subscription.cancelAtPeriodEnd;
}

export function isSubscriptionExpired(subscription: ArtistSubscription): boolean {
    if (!subscription.currentPeriodEnd) return false;
    return new Date() > subscription.currentPeriodEnd;
}

export function getDaysUntilExpiration(subscription: ArtistSubscription): number | null {
    if (!subscription.currentPeriodEnd) return null;

    const now = new Date();
    const expiration = subscription.currentPeriodEnd;
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
}

export function shouldRestrictFeatures(subscription: ArtistSubscription): boolean {
    return subscription.status === 'past_due' ||
        subscription.status === 'cancelled' ||
        subscription.status === 'expired' ||
        isSubscriptionExpired(subscription);
}

export function getUpgradeMessage(subscription: ArtistSubscription & { plan: SubscriptionPlan }, feature: string): string {
    const planName = subscription.plan.displayName;

    if (subscription.plan.name === 'Hobby') {
        return `За да използвате ${feature}, моля надградете към Професионален или Бизнес план.`;
    } else if (subscription.plan.name === 'Pro') {
        return `За да използвате ${feature}, моля надградете към Бизнес план.`;
    }

    return `Функцията ${feature} не е достъпна за вашия план.`;
}

