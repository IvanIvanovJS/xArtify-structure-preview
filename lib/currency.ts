// utils/currency.ts

export const BGN_TO_EUR_RATE = 1.95583;

/**
 * Преобразува левове в евро (връща число)
 */
export function bgnToEur(bgn: number): number {
    return (bgn / BGN_TO_EUR_RATE);
}

