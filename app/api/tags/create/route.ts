import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Validation schema
const CreateTagSchema = z.object({
    name: z.string()
        .min(1, 'Tag name is required')
        .max(50, 'Tag name too long')
        .regex(/^[a-zA-Zа-яА-Я0-9#\s]+$/, 'Разрешени са само букви, цифри и символ #')
        .transform(val => val.trim()), // Trim whitespace
});

// Rate limiting: 10 tags per 10 minutes per user
const tagLimiter = {
    async limit(userId: string): Promise<{ success: boolean; remaining: number; reset: number }> {
        const limit = 10;
        const window = 10 * 60 * 1000; // 10 minutes in milliseconds

        try {
            const now = Date.now();
            const windowStart = now - window;

            // Get recent tag creations for this user
            const recentTags = await prisma.tag.count({
                where: {
                    artist: {
                        user: {
                            id: userId
                        }
                    },
                    createdAt: {
                        gte: new Date(windowStart)
                    }
                }
            });

            if (recentTags >= limit) {
                return {
                    success: false,
                    remaining: 0,
                    reset: windowStart + window
                };
            }

            return {
                success: true,
                remaining: limit - recentTags - 1,
                reset: now + window
            };
        } catch (error) {
            console.error('Rate limiting error:', error);
            // Allow request if rate limiting fails
            return {
                success: true,
                remaining: limit - 1,
                reset: Date.now() + window
            };
        }
    }
};

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Authentication check
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Rate limiting check
        const rateLimitResult = await tagLimiter.limit(userId);
        if (!rateLimitResult.success) {
            return NextResponse.json({
                error: 'Too many tag creations. Please wait before creating more tags.',
                remaining: rateLimitResult.remaining,
                reset: rateLimitResult.reset
            }, { status: 429 });
        }

        // Parse and validate request body
        const body = await request.json();

        let validatedData;
        try {
            validatedData = CreateTagSchema.parse(body);
        } catch (error) {
            console.error('Validation error:', error);
            if (error instanceof z.ZodError) {
                return NextResponse.json({
                    error: 'Validation failed',
                    details: error.issues.map((err: z.ZodIssue) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                }, { status: 400 });
            }
            throw error;
        }

        const tagName = validatedData.name;

        // Check if user has artist profile or is admin
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { artistProfile: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isAuthorized = user.artistProfile || user.role === 'ADMIN';
        if (!isAuthorized) {
            return NextResponse.json({
                error: 'Only artists and admins can create tags'
            }, { status: 403 });
        }

        // For ADMIN users without artist profile, we need to create one or use a default
        let artistId = user.artistProfile?.id;
        if (!artistId && user.role === 'ADMIN') {
            // Create a temporary artist profile for admin
            const adminArtistProfile = await prisma.artistProfile.create({
                data: {
                    userId: user.id,
                    bio: 'Admin user',
                    phoneNumber: '+359000000000', // Default phone for admin
                },
            });
            artistId = adminArtistProfile.id;
        }

        if (!artistId) {
            return NextResponse.json({
                error: 'Artist profile is required to create tags'
            }, { status: 400 });
        }

        // Check if tag already exists for this artist
        const existingTag = await prisma.tag.findUnique({
            where: {
                name_artistId: {
                    name: tagName,
                    artistId: artistId
                }
            }
        });

        if (existingTag) {
            return NextResponse.json({
                error: 'Tag already exists for this artist'
            }, { status: 409 });
        }

        // Get current tag count for this artist
        const currentTagCount = await prisma.tag.count({
            where: { artistId }
        });

        // If we have 30 or more tags, delete the oldest one
        if (currentTagCount >= 30) {
            const oldestTag = await prisma.tag.findFirst({
                where: { artistId },
                orderBy: { createdAt: 'asc' }
            });

            if (oldestTag) {
                await prisma.tag.delete({
                    where: { id: oldestTag.id }
                });
            }
        }

        // Create the new tag
        const newTag = await prisma.tag.create({
            data: {
                name: tagName,
                artistId: artistId
            }
        });

        // Log successful tag creation
        console.log(`Tag created successfully: ${tagName} by user ${userId}`);

        return NextResponse.json({
            message: 'Tag created successfully',
            tag: {
                id: newTag.id,
                name: newTag.name,
                createdAt: newTag.createdAt
            },
            remaining: rateLimitResult.remaining
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating tag:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.issues,
            }, { status: 400 });
        }

        if (error instanceof Error) {
            return NextResponse.json({
                error: 'Failed to create tag',
                message: error.message,
            }, { status: 500 });
        }

        return NextResponse.json({
            error: 'Internal server error',
        }, { status: 500 });
    }
}
