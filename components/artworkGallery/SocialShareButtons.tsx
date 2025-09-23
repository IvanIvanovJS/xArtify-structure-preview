"use client";

import { useState } from 'react';
import "./styles/social-share.css";

interface SocialShareButtonsProps {
    title: string;
    description: string;
    url: string;
    className?: string;
}

export default function SocialShareButtons({
    title,
    description,
    url,
    className = ""
}: SocialShareButtonsProps): React.JSX.Element {
    const [copied, setCopied] = useState(false);

    const handleNativeShare = async () => {
        // Check if native sharing is supported
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: description,
                    url: url,
                });
            } catch (error) {
                // User cancelled sharing or error occurred
                console.log('Sharing cancelled or failed:', error);
            }
        } else {
            // Fallback: copy to clipboard
            await handleCopyLink();
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    return (
        <div className={`social-share-buttons ${className}`}>
            <div className="social-share-simple">
                <button
                    className="social-share-button social-share-button--primary"
                    onClick={handleNativeShare}
                    aria-label="Сподели страницата"
                    title="Сподели страницата"
                >
                    <div className="social-share-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                    </div>
                    <span className="social-share-label">Сподели</span>
                </button>

                <button
                    className="social-share-button social-share-button--secondary"
                    onClick={handleCopyLink}
                    aria-label="Копирай линк"
                    title="Копирай линк"
                >
                    <div className="social-share-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    </div>
                    <span className="social-share-label">Копирай</span>
                </button>
            </div>

            {copied && (
                <div className="social-share-copied">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Линкът е копиран!
                </div>
            )}
        </div>
    );
}

