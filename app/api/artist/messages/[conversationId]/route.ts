// app/api/artist/messages/[conversationId]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiterAutoRefresh, limiterArtistWrite, rateKey } from "@/lib/rateLimit";
import { MessageFiltersSchema, MarkMessagesReadSchema } from "@/lib/validators/artist";

export async function GET(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }): Promise<NextResponse> {
    try {
        // Rate limiting
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiterAutoRefresh.limit(key);

        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки." }, { status: 429 });
        }

        // Authentication
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Не сте влезли в системата." }, { status: 401 });
        }

        // Get artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const query = Object.fromEntries(searchParams.entries());
        const validatedQuery = MessageFiltersSchema.parse(query);

        // Get params
        const { conversationId } = await params;

        // Verify conversation belongs to artist
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                artistId: artistProfile.id
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, image: true }
                }
            }
        });

        if (!conversation) {
            return NextResponse.json({ message: "Разговорът не е намерен." }, { status: 404 });
        }

        // Get messages for the conversation
        const [messages, totalCount] = await Promise.all([
            prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'desc' },
                skip: (validatedQuery.page - 1) * validatedQuery.limit,
                take: validatedQuery.limit
            }),

            prisma.message.count({
                where: { conversationId }
            })
        ]);

        const response = {
            conversation: {
                id: conversation.id,
                user: conversation.user,
                artistUnreadCount: conversation.artistUnreadCount,
                userUnreadCount: conversation.userUnreadCount,
                lastMessageAt: conversation.lastMessageAt,
                createdAt: conversation.createdAt
            },
            messages: messages.reverse(), // Reverse to show oldest first
            pagination: {
                page: validatedQuery.page,
                limit: validatedQuery.limit,
                total: totalCount,
                pages: Math.ceil(totalCount / validatedQuery.limit)
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Messages GET API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни параметри.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }): Promise<NextResponse> {
    try {
        // Rate limiting
        const session = await getServerSession(authOptions);
        const key = rateKey(req, session?.user?.id);
        const { success } = await limiterArtistWrite.limit(key);

        if (!success) {
            return NextResponse.json({ message: "Твърде много заявки." }, { status: 429 });
        }

        // Authentication
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Не сте влезли в системата." }, { status: 401 });
        }

        // Get artist profile
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!artistProfile) {
            return NextResponse.json({ message: "Не сте артист." }, { status: 403 });
        }

        // Get params
        const { conversationId } = await params;

        // Parse and validate request body
        const body = await req.json();
        const validatedData = MarkMessagesReadSchema.parse({
            ...body,
            conversationId
        });

        // Verify conversation belongs to artist
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                artistId: artistProfile.id
            }
        });

        if (!conversation) {
            return NextResponse.json({ message: "Разговорът не е намерен." }, { status: 404 });
        }

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderType: 'USER',
                isRead: false
            },
            data: { isRead: true }
        });

        // Reset artist unread count
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { artistUnreadCount: 0 }
        });

        return NextResponse.json({ message: "Съобщенията са маркирани като прочетени." });

    } catch (error) {
        console.error('Messages PATCH API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни данни.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

