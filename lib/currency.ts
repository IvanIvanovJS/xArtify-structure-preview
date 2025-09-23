// utils/currency.ts

export const BGN_TO_EUR_RATE = 1.95583;

/**
 * Преобразува левове в евро (връща число)
 */
export function bgnToEur(bgn: number): number {
    return (bgn / BGN_TO_EUR_RATE);
}

/**
 * Изчислява промоционална цена
 */
export function calculatePromotionPrice(originalPrice: number, discountPercentage: number): number {
    return originalPrice * (1 - discountPercentage / 100);
}

/**
 * Изчислява процент на отстъпка
 */
export function calculateDiscountPercentage(originalPrice: number, promotionPrice: number): number {
    return Math.round(((originalPrice - promotionPrice) / originalPrice) * 100);
}

/**
 * Форматира цена в левове
 */
export function formatPriceBGN(price: number): string {
    return `${price.toFixed(2)} лв.`;
}

/**
 * Форматира цена в евро
 */
export function formatPriceEUR(price: number): string {
    return `${bgnToEur(price).toFixed(2)} €`;
}

