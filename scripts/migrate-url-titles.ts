// Migration script to update existing paintings with SEO-friendly URL titles
import { PrismaClient } from '@prisma/client';
import { generateUrlTitleFromUrlTitle } from '../lib/slug';

const prisma = new PrismaClient();

async function migrateUrlTitles() {
    console.log('Starting URL titles migration...');

    try {
        // Get all paintings
        const paintings = await prisma.painting.findMany({
            select: {
                id: true,
                title: true,
                urlTitle: true,
            }
        });

        console.log(`Found ${paintings.length} paintings to migrate`);

        let updated = 0;
        let errors = 0;

        for (const painting of paintings) {
            try {
                // Check if URL title needs updating
                const hasCyrillic = /[а-яА-Я]/.test(painting.urlTitle || '');
                const hasIdSuffix = painting.urlTitle?.includes(painting.id.substring(0, 8)) || false;
                const needsUpdate = !painting.urlTitle ||
                    painting.urlTitle === '' ||
                    hasCyrillic ||
                    !hasIdSuffix;

                if (!needsUpdate) {
                    console.log(`Skipping: "${painting.title}" (already has valid URL title with ID suffix)`);
                    continue;
                }

                // Generate new URL title from existing urlTitle field
                const newUrlTitle = generateUrlTitleFromUrlTitle(painting.urlTitle || painting.title, painting.id);

                // Check if this URL title already exists
                const existing = await prisma.painting.findFirst({
                    where: {
                        urlTitle: newUrlTitle,
                        id: { not: painting.id }
                    }
                });

                let finalUrlTitle = newUrlTitle;
                if (existing) {
                    // Make it unique by adding a counter
                    let counter = 1;
                    do {
                        finalUrlTitle = `${newUrlTitle.split('-').slice(0, -1).join('-')}-${counter}`;
                        counter++;
                    } while (await prisma.painting.findFirst({
                        where: {
                            urlTitle: finalUrlTitle,
                            id: { not: painting.id }
                        }
                    }));
                }

                // Update the painting
                await prisma.painting.update({
                    where: { id: painting.id },
                    data: { urlTitle: finalUrlTitle }
                });

                console.log(`Updated: "${painting.title}" -> "${finalUrlTitle}"`);
                updated++;

            } catch (error) {
                console.error(`Error updating painting ${painting.id}:`, error);
                errors++;
            }
        }

        console.log(`\nMigration completed:`);
        console.log(`- Updated: ${updated} paintings`);
        console.log(`- Errors: ${errors} paintings`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
migrateUrlTitles();
