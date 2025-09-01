// app/api/upload/route.ts
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { limiterPublic, rateKey } from "@/lib/rateLimit";

export const runtime = "nodejs"; // Cloudinary SDK изисква Node runtime

// Конфиг от env (server-only)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Политики за сигурност
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: ReadonlySet<string> = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
]);
const MAX_PIXELS = 20_000_000; // 20MP pixel-bomb guard

export async function POST(request: Request) {
    // Rate limit (IP/user)
    const key = rateKey(request);
    const { success, remaining, reset } = await limiterPublic.limit(key);
    if (!success) {
        return new NextResponse("Too Many Requests", {
            status: 429,
            headers: {
                "X-RateLimit-Remaining": String(remaining),
                "X-RateLimit-Reset": String(reset),
            },
        });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({ error: "Липсва файл под ключ 'file'." }, { status: 400 });
        }

        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json(
                { error: "Невалиден тип файл. Разрешени: JPG, PNG, WEBP, GIF." },
                { status: 415 }
            );
        }

        if (file.size > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { error: `Файлът е твърде голям. Максимум ${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB.` },
                { status: 413 }
            );
        }

        // File -> Buffer
        const arrayBuffer = await file.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        // Strip EXIF, auto-orient, optional resize cap
        let pipeline = sharp(inputBuffer).rotate(); // rotate() прилага EXIF ориентация и премахва метаданни, ако не извикаме withMetadata()
        const meta = await pipeline.metadata();

        const width = meta.width ?? 0;
        const height = meta.height ?? 0;
        const pixels = width * height;
        if (pixels > 0 && pixels > MAX_PIXELS) {
            return NextResponse.json({ error: "Снимката е прекалено голяма по размери (pixel guard)." }, { status: 413 });
        }

        const MAX_SIDE = 4000;
        if (width > MAX_SIDE || height > MAX_SIDE) {
            pipeline = pipeline.resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true });
        }

        const forceWebp = process.env.UPLOAD_FORCE_WEBP === "1";
        const outputBuffer = forceWebp || file.type === "image/jpeg" || file.type === "image/png"
            ? await pipeline.webp({ quality: 90 }).toBuffer()
            : await pipeline.toBuffer();

        // Cloudinary upload (typed)
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: process.env.CLOUDINARY_FOLDER || "uploads",
                    resource_type: "image",
                    unique_filename: true,
                    overwrite: false,
                },
                (error: UploadApiErrorResponse | undefined, res: UploadApiResponse | undefined) => {
                    if (error) return reject(error);
                    if (!res) return reject(new Error("Empty Cloudinary response"));
                    resolve(res);
                }
            );
            stream.end(outputBuffer);
        });

        const { secure_url, public_id, bytes, format, width: w, height: h } = result;

        return NextResponse.json(
            { imageUrl: secure_url, publicId: public_id, bytes, format, width: w, height: h },
            { status: 200 }
        );
    } catch (err: unknown) {
        // Без излишно разкриване на грешки към клиента
        console.error(err);
        return NextResponse.json({ error: "Възникна грешка при качването." }, { status: 500 });
    }
}
