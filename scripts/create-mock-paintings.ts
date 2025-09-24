import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stockImages: string[] = [
    'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92',
    'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1',
    'https://images.unsplash.com/photo-1549880338-65ddcdfd017b',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    'https://images.unsplash.com/photo-1526318472351-c75fcf070305',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c',
    'https://images.unsplash.com/photo-1519999482648-25049ddd37b1',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6',
    'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6',
];

const mockPaintings = [
    {
        title: "Слънчева поляна",
        urlTitle: "slancheva-polyana",
        description: "Живоописна поляна с ярки цветя и зеленина, изпълнена със слънчева светлина.",
        materials: "Маслени бои върху платно",
        price: 450,
        technique: "Маслени бои",
        subject: "Пейзаж",
        style: "Реализъм",
        tags: ["Природа", "Цвете", "Слънце", "Поляна"],
        widthCm: 60,
        heightCm: 40,
        isOnSale: false,
        salePercentage: null,
        finalPrice: null,
        originalPrice: null,
        isSold: false,
        imageCount: 3
    },
    {
        title: "Абстрактна композиция",
        urlTitle: "abstraktna-kompoziciya",
        description: "Модерна абстрактна творба с ярки цветове и динамични форми.",
        materials: "Акрилни бои върху платно",
        price: 320,
        technique: "Акрилни бои",
        subject: "Абстракция",
        style: "Абстракционизъм",
        tags: ["Абстракция", "Модерно", "Цвете", "Форма"],
        widthCm: 50,
        heightCm: 50,
        isOnSale: true,
        salePercentage: 15,
        finalPrice: 272,
        originalPrice: 320,
        isSold: false,
        imageCount: 4
    },
    {
        title: "Морски залез",
        urlTitle: "morski-zalez",
        description: "Спокойна морска сцена с залез, отразяваща спокойствие и умиротворение.",
        materials: "Акварел върху хартия",
        price: 280,
        technique: "Акварел",
        subject: "Морски пейзаж",
        style: "Импресионизъм",
        tags: ["Море", "Залез", "Спокойно", "Природа"],
        widthCm: 40,
        heightCm: 30,
        isOnSale: false,
        salePercentage: null,
        finalPrice: null,
        originalPrice: null,
        isSold: false,
        imageCount: 2
    },
    {
        title: "Портрет на жена",
        urlTitle: "portret-na-zhena",
        description: "Елегантен портрет на млада жена с изразителни очи и нежна усмивка.",
        materials: "Маслени бои върху платно",
        price: 650,
        technique: "Маслени бои",
        subject: "Портрет",
        style: "Реализъм",
        tags: ["Портрет", "Жена", "Елегантно", "Класическо"],
        widthCm: 50,
        heightCm: 70,
        isOnSale: false,
        salePercentage: null,
        finalPrice: null,
        originalPrice: null,
        isSold: true,
        imageCount: 5
    },
    {
        title: "Градска архитектура",
        urlTitle: "gradska-arhitektura",
        description: "Съвременна градска архитектура с геометрични форми и контрасти.",
        materials: "Акрилни бои върху платно",
        price: 380,
        technique: "Акрилни бои",
        subject: "Архитектура",
        style: "Контемпорарен",
        tags: ["Град", "Архитектура", "Модерно", "Геометрия"],
        widthCm: 70,
        heightCm: 50,
        isOnSale: true,
        salePercentage: 20,
        finalPrice: 304,
        originalPrice: 380,
        isSold: false,
        imageCount: 3
    },
    {
        title: "Натюрморт с плодове",
        urlTitle: "natyurmort-s-plodove",
        description: "Класически натюрморт с разнообразни плодове и цветя в елегантна композиция.",
        materials: "Маслени бои върху платно",
        price: 290,
        technique: "Маслени бои",
        subject: "Натюрморт",
        style: "Класицизъм",
        tags: ["Натюрморт", "Плодове", "Класическо", "Цвете"],
        widthCm: 45,
        heightCm: 35,
        isOnSale: false,
        salePercentage: null,
        finalPrice: null,
        originalPrice: null,
        isSold: false,
        imageCount: 4
    },
    {
        title: "Експресивна фигура",
        urlTitle: "ekspresivna-figura",
        description: "Динамична фигура с експресивни движения и ярки цветове.",
        materials: "Смесена техника",
        price: 520,
        technique: "Смесена техника",
        subject: "Фигура",
        style: "Експресионизъм",
        tags: ["Фигура", "Експресивно", "Движение", "Ярко"],
        widthCm: 60,
        heightCm: 80,
        isOnSale: false,
        salePercentage: null,
        finalPrice: null,
        originalPrice: null,
        isSold: true,
        imageCount: 2
    },
    {
        title: "Планински пейзаж",
        urlTitle: "planinski-peyzazh",
        description: "Величествени планини с заснежени върхове и дълбоки долини.",
        materials: "Маслени бои върху платно",
        price: 420,
        technique: "Маслени бои",
        subject: "Планински пейзаж",
        style: "Реализъм",
        tags: ["Планини", "Природа", "Сняг", "Величествено"],
        widthCm: 80,
        heightCm: 60,
        isOnSale: true,
        salePercentage: 10,
        finalPrice: 378,
        originalPrice: 420,
        isSold: false,
        imageCount: 5
    },
    {
        title: "Сюрреалистична визия",
        urlTitle: "syurealistichna-viziya",
        description: "Фантастична сюрреалистична композиция с неочаквани елементи.",
        materials: "Акрилни бои върху платно",
        price: 480,
        technique: "Акрилни бои",
        subject: "Абстракция",
        style: "Сюрреализъм",
        tags: ["Сюрреализъм", "Фантазия", "Неочаквано", "Творческо"],
        widthCm: 55,
        heightCm: 55,
        isOnSale: false,
        salePercentage: null,
        finalPrice: null,
        originalPrice: null,
        isSold: false,
        imageCount: 3
    },
    {
        title: "Цветна хармония",
        urlTitle: "tsvetna-harmoniya",
        description: "Хармонична композиция с нежни цветове и плавни преходи.",
        materials: "Пастел върху хартия",
        price: 250,
        technique: "Пастел",
        subject: "Абстракция",
        style: "Минимализъм",
        tags: ["Хармония", "Нежно", "Цвете", "Спокойно"],
        widthCm: 35,
        heightCm: 35,
        isOnSale: false,
        salePercentage: null,
        finalPrice: null,
        originalPrice: null,
        isSold: false,
        imageCount: 2
    }
];

async function createMockPaintings() {
    const artistId = 'cmfy5k4jh0004d2cg55f3ly66';

    try {
        // Check if artist exists
        const artist = await prisma.artistProfile.findUnique({
            where: { id: artistId }
        });

        if (!artist) {
            console.error(`Artist with ID ${artistId} not found`);
            return;
        }

        console.log(`Creating mock paintings for artist: ${artist.userId}`);

        for (const paintingData of mockPaintings) {
            // Generate random images for each painting (2-5 images)
            const imageCount = paintingData.imageCount;
            const selectedImages = [];

            for (let i = 0; i < imageCount; i++) {
                const randomIndex = Math.floor(Math.random() * stockImages.length);
                selectedImages.push(stockImages[randomIndex]);
            }

            // Create unique URL title
            const baseUrlTitle = paintingData.urlTitle;
            let urlTitle = baseUrlTitle;
            let counter = 1;

            while (await prisma.painting.findUnique({ where: { urlTitle } })) {
                urlTitle = `${baseUrlTitle}-${counter}`;
                counter++;
            }

            const painting = await prisma.painting.create({
                data: {
                    title: paintingData.title,
                    urlTitle: urlTitle,
                    description: paintingData.description,
                    materials: paintingData.materials,
                    price: paintingData.price,
                    images: selectedImages,
                    technique: paintingData.technique,
                    subject: paintingData.subject,
                    style: paintingData.style,
                    tags: paintingData.tags,
                    widthCm: paintingData.widthCm,
                    heightCm: paintingData.heightCm,
                    slug: urlTitle,
                    artistId: artistId,
                    isOnSale: paintingData.isOnSale,
                    salePercentage: paintingData.salePercentage,
                    finalPrice: paintingData.finalPrice,
                    originalPrice: paintingData.originalPrice,
                    isSold: paintingData.isSold,
                }
            });

            console.log(`Created painting: ${painting.title} (ID: ${painting.id})`);
        }

        console.log('Successfully created all mock paintings!');

    } catch (error) {
        console.error('Error creating mock paintings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createMockPaintings();
