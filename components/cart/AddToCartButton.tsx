"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import "@/components/ui/styles/example-btn.css";

interface AddToCartButtonProps {
    id: string;
    title: string;
    price: number;
    dimensions: string;
    artist: string;
    image: string;
    className?: string;
}

export default function AddToCartButton({
    id,
    title,
    price,
    dimensions,
    artist,
    image,
    className = "",
}: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState("");
    const [isError, setIsError] = useState(false);

    const handleAddToCart = () => {
        const added = addToCart({
            id,
            title,
            price,
            dimensions,
            artist,
            image,
        });

        if (!added) {
            setNotification(`${title} вече е добавена в количката!`);
            setIsError(true);
        } else {
            setNotification(`Успешно добавихте ${title} в количката!`);
            setIsError(false);
        }

        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
    };

    return (
        <>
            <button
                onClick={handleAddToCart}
                className={`example-btn ${className}`}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Купи
            </button>

            {showNotification && (
                <div
                    className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-500 z-50 backdrop-blur-sm ${isError
                            ? "bg-red-500/90 text-white border border-red-400"
                            : "bg-green-500/90 text-white border border-green-400"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {isError ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        )}
                        <span className="font-medium">{notification}</span>
                    </div>
                </div>
            )}
        </>
    );
}
