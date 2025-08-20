"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

interface AddToCartButtonProps {
    id: string;
    title: string;
    price: number;
    dimensions: string;
    artist: string;
    image: string;
}

export default function AddToCartButton({
    id,
    title,
    price,
    dimensions,
    artist,
    image,
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
            setNotification(`"${title}" вече е добавена в количката!`);
            setIsError(true);
        } else {
            setNotification(`Успешно добавихте "${title}" в количката!`);
            setIsError(false);
        }

        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
    };

    return (
        <>
            <button
                onClick={handleAddToCart}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-green-600 transition-colors"
            >
                Купи
            </button>

            {showNotification && (
                <div
                    className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg transition-opacity duration-500 z-50 ${isError ? "bg-red-500" : "bg-green-500"
                        } text-white`}
                >
                    {notification}
                </div>
            )}
        </>
    );
}
