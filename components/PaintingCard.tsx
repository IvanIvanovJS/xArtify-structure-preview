// components/PaintingCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from 'react';
import { useCart } from "@/app/context/CartContext";
import { bgnToEur } from "@/lib/currency";

interface Painting {
    id: string;
    title: string;
    dimensions: string;
    description: string;
    images: string[];
    price: number;
    artistId: string;
    artist: {
        user: {
            name: string;
        };
    };
}

interface PaintingCardProps {
    painting: Painting;
}

export default function PaintingCard({ painting }: PaintingCardProps) {


    const { addToCart } = useCart();
    const [showNotification, setShowNotification] = useState(false);

    // Взимаме първото изображение от масива `images`
    const primaryImage = painting.images[0] || "/placeholder.jpg";
    const secondaryImage = painting.images[1] || "/placeholder.jpg";

    const handleAddToCart = () => {
        addToCart({
            id: painting.id,
            title: painting.title,
            price: painting.price,
            dimensions: painting.dimensions,
            artist: painting.artist.user.name,
            image: primaryImage
        });
        // Показване на съобщението за 5 секунди
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 5000);

    };


    return (
        <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative w-64 h-64 overflow-hidden group">
                <Link href={`/paintings/${painting.id}`}>
                    {/* Първа снимка */}
                    <Image
                        src={primaryImage}
                        alt={painting.title}
                        layout="fill"
                        objectFit="cover"
                        className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                    />
                    {/* Втора снимка */}
                    <Image
                        src={secondaryImage}
                        alt="{painting.title}"
                        layout="fill"
                        objectFit="cover"
                        className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                    />
                </Link>
            </div>
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{painting.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{painting.dimensions}</p>
                <p className="text-sm text-gray-600">
                    от{" "}
                    <Link href={`/artists/${painting.artistId}`} className="text-blue-500 hover:underline">
                        {painting.artist.user.name}
                    </Link>
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {painting.price.toFixed(2)} лв.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {bgnToEur(painting.price).toFixed(2)} €
                </p>
                <button
                    onClick={handleAddToCart}
                    className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                    Купи
                </button>
            </div>
            {showNotification && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg transition-opacity duration-500 z-50">
                    Вие успешно добавихте "{painting.title}" в количката!
                </div>
            )}
        </div>
    );
}
