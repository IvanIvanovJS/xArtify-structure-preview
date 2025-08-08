// next-auth.d.ts
import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
    /**
     * Разширява обекта `session` на NextAuth
     */
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }

    /**
     * Разширява обекта `JWT` на NextAuth
     */
    interface JWT extends DefaultJWT {
        id: string;
        role: string;
    }
}