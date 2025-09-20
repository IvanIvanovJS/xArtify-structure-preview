// =============================================
// ФАЗА 4: API SECURITY MIDDLEWARE
// =============================================
// Двойна защита: NextAuth JWT + Supabase RLS

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// =============================================
// 1. SECURITY MIDDLEWARE TYPES
// =============================================

export interface SecurityContext {
    user: {
        id: string;
        email: string;
        role: 'ADMIN' | 'ARTIST' | 'USER';
        artistProfile?: { id: string } | null;
    } | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isArtist: boolean;
    hasArtistProfile: boolean;
}

interface SecurityOptions {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    requireArtist?: boolean;
    requireArtistProfile?: boolean;
    allowPublic?: boolean;
}

// =============================================
// 2. SECURITY MIDDLEWARE FUNCTION
// =============================================

export async function withSecurity(
    handler: (req: NextRequest, context: SecurityContext) => Promise<NextResponse>,
    options: SecurityOptions = {}
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        try {
            // Get NextAuth session
            const session = await getServerSession(authOptions);

            // Build security context
            const securityContext: SecurityContext = {
                user: session?.user ? {
                    id: session.user.id,
                    email: session.user.email || '',
                    role: session.user.role as 'ADMIN' | 'ARTIST' | 'USER',
                    artistProfile: session.user.artistProfile
                } : null,
                isAuthenticated: !!session?.user,
                isAdmin: session?.user?.role === 'ADMIN',
                isArtist: session?.user?.role === 'ARTIST' || session?.user?.role === 'ADMIN',
                hasArtistProfile: !!session?.user?.artistProfile
            };

            // =============================================
            // 3. SECURITY VALIDATION
            // =============================================

            // Check authentication requirement
            if (options.requireAuth && !securityContext.isAuthenticated) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            // Check admin requirement
            if (options.requireAdmin && !securityContext.isAdmin) {
                return NextResponse.json(
                    { error: 'Admin access required' },
                    { status: 403 }
                );
            }

            // Check artist requirement
            if (options.requireArtist && !securityContext.isArtist) {
                return NextResponse.json(
                    { error: 'Artist access required' },
                    { status: 403 }
                );
            }

            // Check artist profile requirement
            if (options.requireArtistProfile && !securityContext.hasArtistProfile) {
                return NextResponse.json(
                    { error: 'Artist profile required' },
                    { status: 403 }
                );
            }

            // =============================================
            // 4. DOUBLE VALIDATION WITH DATABASE
            // =============================================

            if (securityContext.isAuthenticated && securityContext.user) {
                // Verify user still exists in database (RLS will handle this)
                const dbUser = await prisma.user.findUnique({
                    where: { id: securityContext.user.id },
                    select: { id: true, email: true, role: true }
                });

                if (!dbUser) {
                    return NextResponse.json(
                        { error: 'User not found in database' },
                        { status: 401 }
                    );
                }

                // Verify role consistency
                if (dbUser.role !== securityContext.user.role) {
                    return NextResponse.json(
                        { error: 'Role mismatch detected' },
                        { status: 403 }
                    );
                }
            }

            // =============================================
            // 5. EXECUTE HANDLER
            // =============================================

            return await handler(req, securityContext);

        } catch (error) {
            console.error('Security middleware error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

// =============================================
// 6. CONVENIENCE WRAPPERS
// =============================================

export const withAuth = (handler: (req: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
    withSecurity(handler, { requireAuth: true });

export const withAdmin = (handler: (req: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
    withSecurity(handler, { requireAuth: true, requireAdmin: true });

export const withArtist = (handler: (req: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
    withSecurity(handler, { requireAuth: true, requireArtist: true });

export const withArtistProfile = (handler: (req: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
    withSecurity(handler, { requireAuth: true, requireArtistProfile: true });

export const withPublic = (handler: (req: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
    withSecurity(handler, { allowPublic: true });

// =============================================
// 7. USAGE EXAMPLES
// =============================================

/*
// Example 1: Admin-only endpoint
export const GET = withAdmin(async (req, context) => {
  // context.user is guaranteed to be admin
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
});

// Example 2: Artist-only endpoint
export const POST = withArtist(async (req, context) => {
  // context.user is guaranteed to be artist or admin
  const body = await req.json();
  const painting = await prisma.painting.create({
    data: {
      ...body,
      artistId: context.user!.artistProfile!.id
    }
  });
  return NextResponse.json(painting);
});

// Example 3: Public endpoint with optional auth
export const GET = withPublic(async (req, context) => {
  if (context.isAuthenticated) {
    // Return personalized data
    return NextResponse.json({ personalized: true });
  } else {
    // Return public data
    return NextResponse.json({ personalized: false });
  }
});
*/
