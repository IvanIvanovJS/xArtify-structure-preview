// lib/auth.ts

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    // Настройваме доставчиците за автентикация
    providers: [
        CredentialsProvider({
            // Името, което се показва на бутона за вход
            name: "Credentials",
            credentials: {
                email: { label: "Имейл", type: "email" },
                password: { label: "Парола", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }

                const { email, password } = credentials;

                // Намираме потребителя в базата данни по имейл
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                // Ако потребителят не съществува или паролата е грешна
                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                // Връщаме потребителя, ако всичко е наред
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],

    // Настройка на сесията
    session: {
        strategy: "jwt",
    },

    // Дефиниране на страници за вход, изход и грешки
    pages: {
        signIn: "/auth/signin", // Примерна страница за вход
    },

    // Callbacks
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.image;
            }
            return session;
        },
    },
};
