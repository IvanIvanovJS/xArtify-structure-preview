// app/api/upload/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { limiterPublic, rateKey } from "@/lib/rateLimit";

// Cloudinary Node SDK requires Node.js runtime
export const runtime = "nodejs";

// Secure Cloudinary config from env (server-only)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Optional: basic validation helpers
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export async function POST(request: Request) {
    try {
        // Rate limit per IP/user
        const { success, remaining, reset } = await limiterPublic.limit(
            rateKey(request)
        );
        if (!success) {
            return new NextResponse("Too Many Requests", {
                status: 429,
                headers: {
                    "X-RateLimit-Remaining": String(remaining),
                    "X-RateLimit-Reset": String(reset),
                },
            });
        }

        // Parse multipart form-data
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json(
                { error: "Липсва файл под ключ 'file'." },
                { status: 400 }
            );
        }

        // Validate type and size
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

        // Convert File -> Buffer for Cloudinary Node SDK
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload buffer using Cloudinary's upload_stream
        const result: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: process.env.CLOUDINARY_FOLDER || "uploads",
                    resource_type: "image",
                    // Optional transformations (resize, format)
                    // transformation: [{ width: 1600, crop: "limit" }],
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            stream.end(buffer);
        });

        if (!result || typeof result !== "object" || !("secure_url" in result)) {
            return NextResponse.json(
                { error: "Неуспешно качване на файл в Cloudinary." },
                { status: 500 }
            );
        }

        const { secure_url, public_id, bytes, format, width, height } = result as {
            secure_url: string;
            public_id: string;
            bytes: number;
            format: string;
            width: number;
            height: number;
        };

        return NextResponse.json(
            { imageUrl: secure_url, publicId: public_id, bytes, format, width, height },
            { status: 200 }
        );
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: "Възникна грешка при качването." },
            { status: 500 }
        );
    }
}
