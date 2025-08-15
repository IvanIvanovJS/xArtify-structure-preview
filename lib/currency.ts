// utils/currency.ts

export const BGN_TO_EUR_RATE = 1.95583;

/**
 * Преобразува левове в евро (връща число)
 */
export function bgnToEur(bgn: number): number {
    return (bgn / BGN_TO_EUR_RATE);
}

/**
 * Форматира левове като евро (връща string)
 */
export function formatEurFromBgn(bgn: number): string {
    const eurFixed = (bgn / BGN_TO_EUR_RATE).toFixed(2); // връща "28.40"
    return new Intl.NumberFormat('bg-BG', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(eurFixed));
}
