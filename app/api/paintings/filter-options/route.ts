import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface FilterOptions {
    techniques: Array<{ name: string; count: number }>;
    subjects: Array<{ name: string; count: number }>;
    styles: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    authors: Array<{ id: string; name: string; count: number }>;
    priceRange: {
        min: number;
        max: number;
    };
    sizeRange: {
        widthMin: number;
        widthMax: number;
        heightMin: number;
        heightMax: number;
    };
}

export async function GET(): Promise<NextResponse> {
    try {
        // Default options that are always available
        const defaultTechniques = [
            'Маслени бои', 'Акрилни бои', 'Акварел', 'Темпера', 'Гуаш', 'Пастел',
            'Молив', 'Въглен', 'Туш', 'Смесена техника', 'Цифрово изкуство', 'Колаж',
            'Скулптура', 'Графика', 'Монопринт', 'Линогравюра', 'Друго'
        ];

        const defaultSubjects = [
            'Пейзаж', 'Портрет', 'Натюрморт', 'Абстракция', 'Фигура', 'Градски пейзаж',
            'Морски пейзаж', 'Планински пейзаж', 'Животни', 'Цветя', 'Архитектура',
            'Исторически', 'Религиозен', 'Митичен', 'Фантастичен', 'Еротичен', 'Социален', 'Друго'
        ];

        const defaultStyles = [
            'Реализъм', 'Импресионизъм', 'Експресионизъм', 'Абстракционизъм', 'Сюрреализъм',
            'Кубизъм', 'Поп арт', 'Минимализъм', 'Концептуализъм', 'Барок', 'Ренесанс',
            'Романтизъм', 'Класицизъм', 'Модернизъм', 'Постмодернизъм', 'Контемпорарен',
            'Наивно изкуство', 'Друго'
        ];

        const defaultTags = [
            'Цвете', 'Природа', 'Портрет', 'Абстракция', 'Модерно', 'Класическо',
            'Ярко', 'Тъмно', 'Голям размер', 'Малък размер', 'Експресивно', 'Спокойно',
            'Град', 'Море', 'Планини', 'Животни', 'Цветя', 'Архитектура', 'История',
            'Романтично', 'Драматично', 'Елегантно', 'Смело', 'Нежно', 'Сила',
            'Свобода', 'Любов', 'Мечти', 'Реалност', 'Фантазия', 'Емоции'
        ];

        // Get counts for each filter option
        const [techniqueCounts, subjectCounts, styleCounts, tagCounts, authorCounts, priceRange, sizeRange] = await Promise.all([
            // Get technique counts
            prisma.painting.groupBy({
                by: ['technique'],
                _count: { technique: true },
                where: {
                    technique: { not: null },
                    // Exclude temporary tag paintings
                    title: { not: { startsWith: 'TEMP_TAG_' } }
                },
            }),
            // Get subject counts
            prisma.painting.groupBy({
                by: ['subject'],
                _count: { subject: true },
                where: {
                    subject: { not: null },
                    // Exclude temporary tag paintings
                    title: { not: { startsWith: 'TEMP_TAG_' } }
                },
            }),
            // Get style counts
            prisma.painting.groupBy({
                by: ['style'],
                _count: { style: true },
                where: {
                    style: { not: null },
                    // Exclude temporary tag paintings
                    title: { not: { startsWith: 'TEMP_TAG_' } }
                },
            }),
            // Get all paintings with tags for counting
            prisma.painting.findMany({
                select: { tags: true },
                where: {
                    tags: {
                        isEmpty: false
                    },
                    // Exclude temporary tag paintings
                    title: { not: { startsWith: 'TEMP_TAG_' } }
                },
            }),
            // Get author counts
            prisma.artistProfile.findMany({
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true
                        }
                    },
                    paintings: {
                        select: { id: true },
                        where: {
                            // Exclude temporary tag paintings
                            title: { not: { startsWith: 'TEMP_TAG_' } }
                        }
                    }
                },
                where: {
                    user: {
                        name: { not: null }
                    }
                },
                distinct: ['userId']
            }),
            // Get price range
            prisma.painting.aggregate({
                _min: { price: true },
                _max: { price: true },
                where: {
                    // Exclude temporary tag paintings
                    title: { not: { startsWith: 'TEMP_TAG_' } }
                }
            }),
            // Get size range
            prisma.painting.aggregate({
                _min: { widthCm: true, heightCm: true },
                _max: { widthCm: true, heightCm: true },
                where: {
                    // Exclude temporary tag paintings
                    title: { not: { startsWith: 'TEMP_TAG_' } }
                }
            }),
        ]);

        // Count tags from all paintings
        const tagCountMap = new Map<string, number>();
        tagCounts.forEach(painting => {
            painting.tags.forEach(tag => {
                if (tag && tag.trim().length > 0) {
                    tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
                }
            });
        });

        // Process authors with counts
        const allAuthors = authorCounts
            .filter(author => author.user.name)
            .map(author => ({
                id: author.id,
                name: author.user.name!,
                count: author.paintings.length
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Create technique options with counts
        const techniqueCountMap = new Map<string, number>();
        techniqueCounts.forEach(item => {
            if (item.technique) {
                techniqueCountMap.set(item.technique, item._count.technique);
            }
        });

        const allTechniques = defaultTechniques.map(technique => ({
            name: technique,
            count: techniqueCountMap.get(technique) || 0
        })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

        // Create subject options with counts
        const subjectCountMap = new Map<string, number>();
        subjectCounts.forEach(item => {
            if (item.subject) {
                subjectCountMap.set(item.subject, item._count.subject);
            }
        });

        const allSubjects = defaultSubjects.map(subject => ({
            name: subject,
            count: subjectCountMap.get(subject) || 0
        })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

        // Create style options with counts
        const styleCountMap = new Map<string, number>();
        styleCounts.forEach(item => {
            if (item.style) {
                styleCountMap.set(item.style, item._count.style);
            }
        });

        const allStyles = defaultStyles.map(style => ({
            name: style,
            count: styleCountMap.get(style) || 0
        })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

        // Create tag options with counts
        const allTagsCombined = defaultTags.map(tag => ({
            name: tag,
            count: tagCountMap.get(tag) || 0
        })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

        const filterOptions: FilterOptions = {
            techniques: allTechniques,
            subjects: allSubjects,
            styles: allStyles,
            tags: allTagsCombined,
            authors: allAuthors,
            priceRange: {
                min: priceRange._min.price || 0,
                max: priceRange._max.price || 10000,
            },
            sizeRange: {
                widthMin: sizeRange._min.widthCm || 0,
                widthMax: sizeRange._max.widthCm || 1000,
                heightMin: sizeRange._min.heightCm || 0,
                heightMax: sizeRange._max.heightCm || 1000,
            },
        };

        return NextResponse.json(filterOptions);

    } catch (error) {
        console.error('Error fetching filter options:', error);

        // Return default options if database query fails
        const defaultOptions: FilterOptions = {
            techniques: [
                'Маслени бои', 'Акрилни бои', 'Акварел', 'Темпера', 'Гуаш', 'Пастел',
                'Молив', 'Въглен', 'Туш', 'Смесена техника', 'Цифрово изкуство', 'Колаж',
                'Скулптура', 'Графика', 'Монопринт', 'Линогравюра', 'Друго'
            ].map(name => ({ name, count: 0 })),
            subjects: [
                'Пейзаж', 'Портрет', 'Натюрморт', 'Абстракция', 'Фигура', 'Градски пейзаж',
                'Морски пейзаж', 'Планински пейзаж', 'Животни', 'Цветя', 'Архитектура',
                'Исторически', 'Религиозен', 'Митичен', 'Фантастичен', 'Еротичен', 'Социален', 'Друго'
            ].map(name => ({ name, count: 0 })),
            styles: [
                'Реализъм', 'Импресионизъм', 'Експресионизъм', 'Абстракционизъм', 'Сюрреализъм',
                'Кубизъм', 'Поп арт', 'Минимализъм', 'Концептуализъм', 'Барок', 'Ренесанс',
                'Романтизъм', 'Класицизъм', 'Модернизъм', 'Постмодернизъм', 'Контемпорарен',
                'Наивно изкуство', 'Друго'
            ].map(name => ({ name, count: 0 })),
            tags: [
                'Цвете', 'Природа', 'Портрет', 'Абстракция', 'Модерно', 'Класическо',
                'Ярко', 'Тъмно', 'Голям размер', 'Малък размер', 'Експресивно', 'Спокойно',
                'Град', 'Море', 'Планини', 'Животни', 'Цветя', 'Архитектура', 'История',
                'Романтично', 'Драматично', 'Елегантно', 'Смело', 'Нежно', 'Сила',
                'Свобода', 'Любов', 'Мечти', 'Реалност', 'Фантазия', 'Емоции'
            ].map(name => ({ name, count: 0 })),
            authors: [],
            priceRange: {
                min: 0,
                max: 10000,
            },
            sizeRange: {
                widthMin: 0,
                widthMax: 1000,
                heightMin: 0,
                heightMax: 1000,
            },
        };

        return NextResponse.json(defaultOptions);
    }
}