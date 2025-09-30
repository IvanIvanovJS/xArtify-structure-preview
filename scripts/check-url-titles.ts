// Script to check current URL titles in the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUrlTitles() {
    console.log('Checking current URL titles...');

    try {
        const paintings = await prisma.painting.findMany({
            select: {
                id: true,
                title: true,
                urlTitle: true,
            }
        });

        console.log(`Found ${paintings.length} paintings:\n`);

        paintings.forEach((painting, index) => {
            console.log(`${index + 1}. "${painting.title}"`);
            console.log(`   ID: ${painting.id}`);
            console.log(`   URL Title: ${painting.urlTitle}`);
            console.log(`   Has Cyrillic: ${/[а-яА-Я]/.test(painting.urlTitle || '')}`);
            console.log(`   Has ID suffix: ${painting.urlTitle?.includes(painting.id.substring(0, 8)) || false}`);
            console.log('');
        });

    } catch (error) {
        console.error('Error checking URL titles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUrlTitles();
