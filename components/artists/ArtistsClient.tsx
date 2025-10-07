'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import "./styles/artists.css";

interface Artist {
    id: string;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface ArtistsClientProps {
    artists: Artist[];
}

export default function ArtistsClient({ artists }: ArtistsClientProps): React.JSX.Element {
    return (
        <div className="artists-page">
            <div className="artists-container">
                <h1 className="artists-title">Артисти</h1>

                {artists.length > 0 ? (
                    <div className="artists-grid">
                        {artists.map((artist) => (
                            <Link key={artist.id} href={`/artists/${artist.id}`} className="artist-card">
                                <div className="artist-image-container">
                                    <Image
                                        src={artist.user.image || "/placeholder-avatar.jpg"}
                                        alt={artist.user.name || "Профилна снимка"}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        className="artist-image"
                                    />
                                </div>
                                <p className="artist-name">
                                    {artist.user.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="artists-empty">
                        Все още няма регистрирани артисти.
                    </div>
                )}
            </div>
        </div>
    );
}
