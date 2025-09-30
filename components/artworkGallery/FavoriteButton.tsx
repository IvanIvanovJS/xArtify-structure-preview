"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import "./styles/favorite-button.css";

interface FavoriteButtonProps {
    paintingId: string;
    className?: string;
}

export default function FavoriteButton({
    paintingId,
    className = ""
}: FavoriteButtonProps): React.JSX.Element {
    const { data: session } = useSession();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            checkFavoriteStatus();
        }
    }, [session, paintingId]);

    const checkFavoriteStatus = async () => {
        try {
            const response = await fetch(`/api/favorites/${paintingId}`);
            if (response.ok) {
                const data = await response.json();
                setIsFavorite(data.isFavorite);
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const handleToggleFavorite = async () => {
        if (!session?.user?.id) {
            // Redirect to login or show login modal
            window.location.href = '/login';
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/favorites/${paintingId}`, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setIsFavorite(!isFavorite);
            } else {
                console.error('Failed to toggle favorite');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!session?.user?.id) {
        return (
            <button
                className={`favorite-button ${className}`}
                onClick={handleToggleFavorite}
                aria-label="Добави в любими (изисква вход)"
                title="Влезте, за да добавите в любими"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            </button>
        );
    }

    return (
        <button
            className={`favorite-button ${isFavorite ? 'active' : ''} ${isLoading ? 'loading' : ''} ${className}`}
            onClick={handleToggleFavorite}
            disabled={isLoading}
            aria-label={isFavorite ? "Премахни от любими" : "Добави в любими"}
            title={isFavorite ? "Премахни от любими" : "Добави в любими"}
        >
            {isLoading ? (
                <div className="favorite-button-spinner">
                    <div className="favorite-button-spinner-inner"></div>
                </div>
            ) : (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            )}
        </button>
    );
}
