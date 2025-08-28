// next-auth.d.ts
import { DefaultSession, DefaultJWT } from "next-auth";

// Дефинираме типа за ArtistProfile, който ще се добави към сесията
interface ArtistProfile {
    id: string;
    // Може да добавите и други полета, ако ви трябват
}

declare module "next-auth" {
    /**
     * Разширява обекта `session` на NextAuth
     */
    interface Session {
        user: {
            id: string;
            role: string;
            artistProfile?: ArtistProfile | null;
        } & DefaultSession["user"];
    }

    /**
     * Разширява обекта `JWT` на NextAuth
     */
    interface JWT extends DefaultJWT {
        id: string;
        role: string;
        artistProfile?: ArtistProfile | null;
    }

    /**
     * Разширява обекта `User` от Prisma
     */
    interface User {
        id: string;
        role: string;
        artistProfile?: ArtistProfile | null;
        remember_me?: boolean;
    }
}
