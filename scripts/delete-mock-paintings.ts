import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mockPaintingTitles = [
    "Слънчева поляна",
    "Абстрактна композиция",
    "Морски залез",
    "Портрет на жена",
    "Градска архитектура",
    "Натюрморт с плодове",
    "Експресивна фигура",
    "Планински пейзаж",
    "Сюрреалистична визия",
    "Цветна хармония"
];

async function deleteMockPaintings() {
    try {
        console.log('Deleting mock paintings...');

        for (const title of mockPaintingTitles) {
            const deleted = await prisma.painting.deleteMany({
                where: {
                    title: title
                }
            });

            if (deleted.count > 0) {
                console.log(`Deleted ${deleted.count} painting(s) with title: ${title}`);
            } else {
                console.log(`No paintings found with title: ${title}`);
            }
        }

        console.log('Mock paintings deletion completed!');

    } catch (error) {
        console.error('Error deleting mock paintings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
deleteMockPaintings();
