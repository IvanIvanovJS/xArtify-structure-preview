
"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

interface SessionProviderProps {
    children: React.ReactNode;
    session: Session | null;
}

export default function NextAuthSessionProvider({ children, session }: SessionProviderProps) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
}