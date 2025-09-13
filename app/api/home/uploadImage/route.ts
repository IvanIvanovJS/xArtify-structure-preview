import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Конфигурация на Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        // Проверка за автентификация и admin права
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Необходима е автентификация" },
                { status: 401 }
            );
        }

        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Нямате права за тази операция" },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("image") as File;
        const folder = formData.get("folder") as string || "courses-adv";

        if (!file) {
            return NextResponse.json(
                { error: "Няма избрано изображение" },
                { status: 400 }
            );
        }

        // Проверка за тип файл
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "Файлът трябва да бъде изображение" },
                { status: 400 }
            );
        }

        // Проверка за размер (максимум 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "Изображението е твърде голямо (максимум 10MB)" },
                { status: 400 }
            );
        }

        // Конвертиране на файла в buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload към Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: "auto",
                    quality: "auto",
                    fetch_format: "auto",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: (result as UploadApiResponse).secure_url,
            public_id: (result as UploadApiResponse).public_id,
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Грешка при качване на изображението" },
            { status: 500 }
        );
    }
}
