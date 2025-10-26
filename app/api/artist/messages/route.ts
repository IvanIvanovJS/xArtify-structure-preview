// app/api/artist/messages/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { limiterAutoRefresh, limiterArtistWrite, rateKey } from "@/lib/rateLimit";
import { SendMessageSchema, MessageFiltersSchema } from "@/lib/validators/artist";

export async function GET(req: NextRequest): Promise<NextResponse> {
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

        // Get conversations for the artist
        const [conversations, totalCount] = await Promise.all([
            prisma.conversation.findMany({
                where: { artistId: artistProfile.id },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true }
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: {
                            id: true,
                            content: true,
                            senderType: true,
                            createdAt: true,
                            isRead: true
                        }
                    }
                },
                orderBy: { lastMessageAt: 'desc' },
                skip: (validatedQuery.page - 1) * validatedQuery.limit,
                take: validatedQuery.limit
            }),

            prisma.conversation.count({
                where: { artistId: artistProfile.id }
            })
        ]);

        // Transform conversations to include last message and unread count
        const conversationsWithLastMessage = conversations.map(conversation => ({
            id: conversation.id,
            user: conversation.user,
            lastMessage: conversation.messages[0] || null,
            artistUnreadCount: conversation.artistUnreadCount,
            userUnreadCount: conversation.userUnreadCount,
            lastMessageAt: conversation.lastMessageAt,
            createdAt: conversation.createdAt
        }));

        const response = {
            conversations: conversationsWithLastMessage,
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

export async function POST(req: NextRequest): Promise<NextResponse> {
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

        // Parse and validate request body
        const body = await req.json();
        const validatedData = SendMessageSchema.parse(body);

        // Verify the artist ID matches the authenticated artist
        if (validatedData.artistId !== artistProfile.id) {
            return NextResponse.json({ message: "Не можете да изпращате съобщения от името на друг артист." }, { status: 403 });
        }

        // Find or create conversation
        let conversation = await prisma.conversation.findUnique({
            where: {
                userId_artistId: {
                    userId: session.user.id,
                    artistId: validatedData.artistId
                }
            }
        });

        if (!conversation) {
            // Create new conversation
            conversation = await prisma.conversation.create({
                data: {
                    userId: session.user.id,
                    artistId: validatedData.artistId,
                    userUnreadCount: 0,
                    artistUnreadCount: 0
                }
            });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: artistProfile.id,
                senderType: 'ARTIST',
                content: validatedData.content
            }
        });

        // Update conversation last message time and unread count
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                lastMessageAt: new Date(),
                userUnreadCount: { increment: 1 }
            }
        });

        return NextResponse.json(message, { status: 201 });

    } catch (error) {
        console.error('Messages POST API Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ message: 'Невалидни данни.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Вътрешна грешка на сървъра.' }, { status: 500 });
    }
}

