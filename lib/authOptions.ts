import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    // adapter: PrismaAdapter(prisma) as Adapter, // Disabled for JWT strategy
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                remember_me: { label: "Remember Me", type: "checkbox" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    remember_me: credentials?.remember_me === "true",
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            // If user is provided (during sign in), add user data to token
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.artistProfile = user.artistProfile;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.artistProfile = token.artistProfile as { id: string } | null;
            }
            return session;
        },
        async signIn({ user, account }) {
            // Handle OAuth sign-ins with account linking
            if (account?.provider === 'google' || account?.provider === 'facebook') {
                if (!user.email) {
                    return false; // Reject if no email
                }

                try {
                    // Check if user already exists with this email
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                        include: { accounts: true }
                    });

                    if (existingUser) {
                        // Check if this OAuth provider is already linked
                        const existingAccount = existingUser.accounts.find(
                            acc => acc.provider === account.provider
                        );

                        if (!existingAccount) {
                            // Link the OAuth account to existing user
                            await prisma.account.create({
                                data: {
                                    userId: existingUser.id,
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    access_token: account.access_token,
                                    refresh_token: account.refresh_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                    session_state: account.session_state,
                                }
                            });

                            // Update user data with OAuth info if needed
                            await prisma.user.update({
                                where: { id: existingUser.id },
                                data: {
                                    name: user.name || existingUser.name,
                                    image: user.image || existingUser.image,
                                }
                            });
                        }

                        // Always use existing user's data for the session
                        user.id = existingUser.id;
                        user.role = existingUser.role;
                        user.name = existingUser.name;
                        user.email = existingUser.email;
                        user.image = existingUser.image;
                    } else {
                        // Create new user for OAuth
                        const newUser = await prisma.user.create({
                            data: {
                                name: user.name,
                                email: user.email,
                                image: user.image,
                                emailVerified: new Date(),
                            }
                        });

                        // Create account record
                        await prisma.account.create({
                            data: {
                                userId: newUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                access_token: account.access_token,
                                refresh_token: account.refresh_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                                session_state: account.session_state,
                            }
                        });

                        user.id = newUser.id;
                        user.role = newUser.role;
                    }
                } catch (error) {
                    console.error('OAuth sign-in error:', error);
                    return false;
                }
            }

            return true;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7, // 7 дни
        updateAge: 60 * 60 * 24, // 1 ден
    },
    secret: process.env.NEXTAUTH_SECRET,
};