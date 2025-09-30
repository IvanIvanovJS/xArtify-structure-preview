// Utility functions for creating SEO-friendly URLs from Bulgarian text

/**
 * Converts Bulgarian Cyrillic characters to Latin equivalents
 */
const cyrillicToLatin: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
    'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
    'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
    'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y',
    'Ю': 'Yu', 'Я': 'Ya'
};

/**
 * Converts a string to a URL-friendly slug
 */
export function createSlug(text: string): string {
    if (!text) return '';

    return text
        // Convert Cyrillic to Latin
        .split('')
        .map(char => cyrillicToLatin[char] || char)
        .join('')
        // Convert to lowercase
        .toLowerCase()
        // Replace spaces and special characters with hyphens
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '')
        // Limit length
        .substring(0, 100);
}

/**
 * Generates a unique URL title for a painting
 */
export function generateUrlTitle(title: string, id: string): string {
    const slug = createSlug(title);

    // If slug is empty or too short, use the ID
    if (!slug || slug.length < 3) {
        return id;
    }

    // Add ID suffix to ensure uniqueness
    return `${slug}-${id.substring(0, 8)}`;
}

/**
 * Generates URL title from existing urlTitle field
 */
export function generateUrlTitleFromUrlTitle(urlTitle: string, id: string): string {
    // If urlTitle is empty or invalid, use the ID
    if (!urlTitle || urlTitle.trim() === '') {
        return id;
    }

    // Convert existing urlTitle to slug format
    const slug = createSlug(urlTitle);

    // If slug is empty or too short, use the ID
    if (!slug || slug.length < 3) {
        return id;
    }

    // Add ID suffix to ensure uniqueness
    return `${slug}-${id.substring(0, 8)}`;
}

/**
 * Extracts the original ID from a URL title
 */
export function extractIdFromUrlTitle(urlTitle: string): string | null {
    // If it's just an ID (no hyphen), return as is
    if (!urlTitle.includes('-')) {
        return urlTitle;
    }

    // Extract ID from the end of the slug
    const parts = urlTitle.split('-');
    const lastPart = parts[parts.length - 1];

    // Check if last part looks like an ID (8+ characters)
    if (lastPart && lastPart.length >= 8) {
        return lastPart;
    }

    return null;
}

/**
 * Validates if a URL title is properly formatted
 */
export function isValidUrlTitle(urlTitle: string): boolean {
    if (!urlTitle) return false;

    // Should contain only lowercase letters, numbers, and hyphens
    return /^[a-z0-9-]+$/.test(urlTitle);
}
