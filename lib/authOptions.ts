import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    // adapter: PrismaAdapter(prisma) as Adapter, // Disabled for JWT strategy
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
        async signIn() {
            // Allow all sign-ins - validation happens in authorize function for credentials
            // and NextAuth handles OAuth providers automatically
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