"use client";

import Image from 'next/image';
import Link from 'next/link';
import "./styles/meet-the-artist.css";

interface MeetTheArtistProps {
    artist: {
        id: string;
        user: {
            name: string | null;
            image?: string | null;
            email?: string | null;
        };
        bio: string | null;
    };
    paintingTitle: string;
    className?: string;
}

export default function MeetTheArtist({
    artist,
    paintingTitle,
    className = ""
}: MeetTheArtistProps): React.JSX.Element {
    const artistName = artist.user.name || "Неизвестен артист";
    const artistImage = artist.user.image || "/default-avatar.png";

    return (
        <div className={`meet-the-artist ${className}`}>
            <div className="meet-the-artist-content">
                {/* Artist Image - Clickable */}
                <Link href={`/artist/${artist.id}`} className="meet-the-artist-image-link">
                    <div className="meet-the-artist-image-container">
                        <Image
                            src={artistImage}
                            alt={artistName}
                            width={120}
                            height={120}
                            className="meet-the-artist-image"
                            sizes="120px"
                        />
                    </div>
                </Link>

                {/* Artist Information */}
                <div className="meet-the-artist-info">
                    <div className="meet-the-artist-header">
                        <h3 className="meet-the-artist-subtitle"><strong>{artistName}</strong></h3>
                        <h3 className="meet-the-artist-title">
                            Запознай се с автора създал
                        </h3>
                        <h2 className="meet-the-painting-title"><strong> {paintingTitle}.</strong></h2>
                    </div>
                </div>

                {/* Profile Button */}
                <div className="meet-the-artist-button-section">
                    <Link href={`/artist/${artist.id}`} className="meet-the-artist-button">
                        <div className="meet-the-artist-button-content">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="meet-the-artist-brush-icon">
                                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                                <path d="M2 2l7.586 7.586" />
                                <circle cx="11" cy="11" r="2" />
                            </svg>
                            <span>Профил на артиста</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
