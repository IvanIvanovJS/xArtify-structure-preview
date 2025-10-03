"use client";

import { useEffect, useRef } from "react";
import { useInterSplash } from "@/app/context/InterSplashContext";

export default function NetworkActivityTracker(): React.JSX.Element {
    const { isVisible, hideInterSplash } = useInterSplash();
    const activeRequestsRef = useRef(0);
    const hasHiddenRef = useRef(false);
    const networkIdleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isVisible || hasHiddenRef.current) return;

        const hideSplash = (): void => {
            if (!hasHiddenRef.current) {
                console.log('NetworkActivityTracker: All network requests completed, hiding splash');
                hasHiddenRef.current = true;
                hideInterSplash();
            }
        };

        const checkNetworkIdle = (): void => {
            if (activeRequestsRef.current === 0) {
                // Clear existing timeout
                if (networkIdleTimeoutRef.current) {
                    clearTimeout(networkIdleTimeoutRef.current);
                }

                // Wait a bit more to ensure no new requests start
                networkIdleTimeoutRef.current = setTimeout(() => {
                    if (activeRequestsRef.current === 0) {
                        hideSplash();
                    }
                }, 500);
            }
        };

        // Track fetch requests
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            activeRequestsRef.current++;
            console.log(`NetworkActivityTracker: Request started (${activeRequestsRef.current} active)`);

            return originalFetch(...args)
                .then(response => {
                    activeRequestsRef.current--;
                    console.log(`NetworkActivityTracker: Request completed (${activeRequestsRef.current} active)`);
                    checkNetworkIdle();
                    return response;
                })
                .catch(error => {
                    activeRequestsRef.current--;
                    console.log(`NetworkActivityTracker: Request failed (${activeRequestsRef.current} active)`);
                    checkNetworkIdle();
                    throw error;
                });
        };

        // Track XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
            (this as XMLHttpRequest & { _isTracked?: boolean })._isTracked = true;
            return originalXHROpen.call(this, method, url, async ?? true, username, password);
        };

        XMLHttpRequest.prototype.send = function (...args) {
            if ((this as XMLHttpRequest & { _isTracked?: boolean })._isTracked) {
                activeRequestsRef.current++;
                console.log(`NetworkActivityTracker: XHR started (${activeRequestsRef.current} active)`);

                const handleComplete = () => {
                    activeRequestsRef.current--;
                    console.log(`NetworkActivityTracker: XHR completed (${activeRequestsRef.current} active)`);
                    checkNetworkIdle();
                };

                this.addEventListener('loadend', handleComplete, { once: true });
                this.addEventListener('error', handleComplete, { once: true });
                this.addEventListener('abort', handleComplete, { once: true });
            }

            return originalXHRSend.apply(this, args);
        };

        // Initial check
        checkNetworkIdle();

        // Fallback timeout - much longer for very slow local servers
        const fallbackTimeout = setTimeout(() => {
            if (!hasHiddenRef.current) {
                console.log('NetworkActivityTracker: Fallback timeout triggered (15s)');
                hasHiddenRef.current = true;
                hideInterSplash();
            }
        }, 15000); // 15 seconds for very slow local servers

        // Cleanup
        return () => {
            // Restore original functions
            window.fetch = originalFetch;
            XMLHttpRequest.prototype.open = originalXHROpen;
            XMLHttpRequest.prototype.send = originalXHRSend;

            if (networkIdleTimeoutRef.current) {
                clearTimeout(networkIdleTimeoutRef.current);
            }
            clearTimeout(fallbackTimeout);
        };
    }, [isVisible, hideInterSplash]);

    // Reset when splash becomes visible
    useEffect(() => {
        if (isVisible) {
            hasHiddenRef.current = false;
            activeRequestsRef.current = 0;
            console.log('NetworkActivityTracker: Splash became visible, resetting counters');
        }
    }, [isVisible]);

    return null as unknown as React.JSX.Element;
}
