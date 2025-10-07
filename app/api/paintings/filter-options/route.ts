import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface FilterOptions {
    techniques: string[];
    subjects: string[];
    styles: string[];
    tags: string[];
    authors: Array<{ id: string; name: string }>;
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

        // Get unique values from existing paintings
        const [techniques, subjects, styles, dbTags, authors, priceRange, sizeRange] = await Promise.all([
            prisma.painting.findMany({
                select: { technique: true },
                where: {
                    technique: { not: null },
                    // Exclude temporary tag paintings
                    title: { not: { startsWith: 'TEMP_TAG_' } }
                },
                distinct: ['technique'],
            }),
            prisma.painting.findMany({
                select: { subject: true },
                where: {
                    subject: { not: null },
                    // Exclude temporary tag paintings
                    title: { not: { startsWith: 'TEMP_TAG_' } }
                },
                distinct: ['subject'],
            }),
            prisma.painting.findMany({
                select: { style: true },
                where: {
                    style: { not: null },
                    // Exclude temporary tag paintings
                    title: { not: { startsWith: 'TEMP_TAG_' } }
                },
                distinct: ['style'],
            }),
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
            // Get all unique authors
            prisma.artistProfile.findMany({
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true
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

        // Extract unique tags from all paintings
        const uniqueTags = Array.from(
            new Set(
                dbTags
                    .flatMap(painting => painting.tags)
                    .filter(tag => tag && tag.trim().length > 0)
            )
        ).sort();

        // Process authors
        const allAuthors = authors
            .filter(author => author.user.name)
            .map(author => ({
                id: author.id,
                name: author.user.name!
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Combine default options with database options, removing duplicates
        const allTechniques = Array.from(new Set([
            ...defaultTechniques,
            ...techniques.map(t => t.technique).filter((technique): technique is string => technique !== null)
        ]));
        const allSubjects = Array.from(new Set([
            ...defaultSubjects,
            ...subjects.map(s => s.subject).filter((subject): subject is string => subject !== null)
        ]));
        const allStyles = Array.from(new Set([
            ...defaultStyles,
            ...styles.map(s => s.style).filter((style): style is string => style !== null)
        ]));
        const allTagsCombined = Array.from(new Set([...defaultTags, ...uniqueTags]));

        const filterOptions: FilterOptions = {
            techniques: allTechniques.sort(),
            subjects: allSubjects.sort(),
            styles: allStyles.sort(),
            tags: allTagsCombined.sort(),
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
            ],
            subjects: [
                'Пейзаж', 'Портрет', 'Натюрморт', 'Абстракция', 'Фигура', 'Градски пейзаж',
                'Морски пейзаж', 'Планински пейзаж', 'Животни', 'Цветя', 'Архитектура',
                'Исторически', 'Религиозен', 'Митичен', 'Фантастичен', 'Еротичен', 'Социален', 'Друго'
            ],
            styles: [
                'Реализъм', 'Импресионизъм', 'Експресионизъм', 'Абстракционизъм', 'Сюрреализъм',
                'Кубизъм', 'Поп арт', 'Минимализъм', 'Концептуализъм', 'Барок', 'Ренесанс',
                'Романтизъм', 'Класицизъм', 'Модернизъм', 'Постмодернизъм', 'Контемпорарен',
                'Наивно изкуство', 'Друго'
            ],
            tags: [
                'Цвете', 'Природа', 'Портрет', 'Абстракция', 'Модерно', 'Класическо',
                'Ярко', 'Тъмно', 'Голям размер', 'Малък размер', 'Експресивно', 'Спокойно',
                'Град', 'Море', 'Планини', 'Животни', 'Цветя', 'Архитектура', 'История',
                'Романтично', 'Драматично', 'Елегантно', 'Смело', 'Нежно', 'Сила',
                'Свобода', 'Любов', 'Мечти', 'Реалност', 'Фантазия', 'Емоции'
            ],
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