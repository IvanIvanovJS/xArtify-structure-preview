import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                remember_me: { label: "Remember Me", type: "checkbox" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                // 🔑 връщаме remember_me към user-а
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
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;

                // ✅ унифицираме remember_me:
                // - идва от credentials (user.remember_me)
                // - или от query параметър при Google/Facebook
                const rememberParam = account?.remember_me;
                const rememberMe =
                    user.remember_me === true || rememberParam === "true";

                token.remember_me = rememberMe;

                const artistProfile = await prisma.artistProfile.findUnique({
                    where: { userId: user.id },
                    select: { id: true },
                });
                token.artistProfile = artistProfile ? { id: artistProfile.id } : null;

                token.maxAge = rememberMe
                    ? 60 * 60 * 24 * 30 // 30 дни
                    : 60 * 60; // 1 час

                token.expires = new Date(Date.now() + (token.maxAge as number) * 1000);
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.artistProfile = token.artistProfile as { id: string } | null;
            }
            if (token.maxAge) {
                session.expires = token.expires as string;
            }

            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
