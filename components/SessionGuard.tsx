"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    useEffect(() => {
        if (Date.parse(Date()) > Date.parse(session?.expires as string)) {
            signOut();
        }
    }, [session]);

    return <>{children}</>;
}