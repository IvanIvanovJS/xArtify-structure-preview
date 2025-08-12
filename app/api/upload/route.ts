// app/api/upload/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Настройваме Cloudinary с вашите данни от .env.local
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        // Използваме 'request.formData()' за обработка на файла в App Router
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Няма качен файл.' }, { status: 400 });
        }

        // Преобразуваме файла в буфер
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Качваме файла в Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'art-gallery' },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        if (!result || typeof result !== 'object' || !('secure_url' in result)) {
            return NextResponse.json({ error: 'Неуспешно качване на файл в Cloudinary.' }, { status: 500 });
        }

        const { secure_url } = result as { secure_url: string };

        return NextResponse.json({ imageUrl: secure_url }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Възникна грешка при качването.' }, { status: 500 });
    }
}
