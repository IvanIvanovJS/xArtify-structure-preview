"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.expires && new Date() > new Date(session.expires)) {
            signOut();
        }
    }, [session]);

    return <>{children}</>;
}