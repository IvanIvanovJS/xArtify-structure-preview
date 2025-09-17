"use client"

import { SessionProvider } from "next-auth/react"
import { SWRConfig } from "swr"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SWRConfig
                value={{
                    // Global SWR configuration
                    revalidateOnFocus: false,
                    revalidateOnReconnect: true,
                    dedupingInterval: 60 * 60 * 1000, // 60 minutes
                    errorRetryCount: 3,
                    errorRetryInterval: 1000,
                    // Global error handler
                    onError: (error) => {
                        console.error('SWR Error:', error);
                    },
                    // Global loading state
                    loadingTimeout: 3000,
                }}
            >
                {children}
            </SWRConfig>
        </SessionProvider>
    )
}
