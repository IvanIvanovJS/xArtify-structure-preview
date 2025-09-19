import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import sharp from 'sharp';
import { z } from 'zod';

import { authOptions } from '@/lib/authOptions';
import { limiterPublic, rateKey } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Security policies
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: ReadonlySet<string> = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
]);
const MAX_PIXELS = 20_000_000; // 20MP pixel-bomb guard
const MAX_SIDE = 4000;

// Validation schema
const UploadSchema = z.object({
    file: z.instanceof(File, { message: 'Invalid file' }),
});

interface UploadResult {
    imageUrl: string;
    publicId: string;
    bytes: number;
    format: string;
    width: number;
    height: number;
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries) throw error;

            const delay = baseDelay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Max retries exceeded');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Rate limiting
        const key = rateKey(request);
        const { success, remaining, reset } = await limiterPublic.limit(key);
        if (!success) {
            return new NextResponse('Too Many Requests', {
                status: 429,
                headers: {
                    'X-RateLimit-Remaining': String(remaining),
                    'X-RateLimit-Reset': String(reset),
                },
            });
        }

        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Authorization check - only artists and admins can upload
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { artistProfile: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isAuthorized = user.artistProfile || user.role === 'ADMIN';
        if (!isAuthorized) {
            return NextResponse.json({
                error: 'Only artists and admins can upload images'
            }, { status: 403 });
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({
                error: 'No file provided'
            }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF',
            }, { status: 415 });
        }

        // Validate file size
        if (file.size > MAX_SIZE_BYTES) {
            return NextResponse.json({
                error: `File too large. Maximum ${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB`,
            }, { status: 413 });
        }

        // Process image with Sharp
        const arrayBuffer = await file.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        let pipeline = sharp(inputBuffer).rotate();
        const meta = await pipeline.metadata();

        const width = meta.width ?? 0;
        const height = meta.height ?? 0;
        const pixels = width * height;

        // Pixel bomb protection
        if (pixels > 0 && pixels > MAX_PIXELS) {
            return NextResponse.json({
                error: 'Image dimensions too large',
            }, { status: 413 });
        }

        // Resize if necessary
        if (width > MAX_SIDE || height > MAX_SIDE) {
            pipeline = pipeline.resize({
                width: MAX_SIDE,
                height: MAX_SIDE,
                fit: 'inside',
                withoutEnlargement: true,
            });
        }

        // Convert to WebP for better compression
        const forceWebp = process.env.UPLOAD_FORCE_WEBP === '1';
        const outputBuffer = forceWebp || file.type === 'image/jpeg' || file.type === 'image/png'
            ? await pipeline.webp({ quality: 90 }).toBuffer()
            : await pipeline.toBuffer();

        // Upload to Cloudinary with retry logic
        const result = await retryWithBackoff((): Promise<UploadApiResponse> => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: process.env.CLOUDINARY_FOLDER || 'art-platform/uploads',
                        resource_type: 'image',
                        unique_filename: true,
                        overwrite: false,
                        transformation: [
                            { quality: 'auto' },
                            { fetch_format: 'auto' },
                        ],
                    },
                    (error: UploadApiErrorResponse | undefined, res: UploadApiResponse | undefined) => {
                        if (error) return reject(error);
                        if (!res) return reject(new Error('Empty Cloudinary response'));
                        resolve(res);
                    }
                );
                stream.end(outputBuffer);
            });
        });

        const uploadResult: UploadResult = {
            imageUrl: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height,
        };

        // Log successful upload
        console.log(`Image uploaded successfully: ${uploadResult.publicId} by user ${session.user.id}`);

        return NextResponse.json(uploadResult, { status: 200 });

    } catch (error) {
        console.error('Upload error:', error);

        if (error instanceof Error) {
            // Don't expose internal errors to client
            return NextResponse.json({
                error: 'Upload failed. Please try again.',
            }, { status: 500 });
        }

        return NextResponse.json({
            error: 'Internal server error',
        }, { status: 500 });
    }
}
