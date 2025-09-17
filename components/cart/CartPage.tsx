"use client";

import { useCart } from "@/app/context/CartContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bgnToEur } from "@/lib/currency";

// CDN за конвертиране на валута


export default function CartPage() {
    const router = useRouter();
    const { cartItems, removeFromCart } = useCart();
    const [cartIsEmpty, setCartIsEmpty] = useState(true);

    useEffect(() => {
        setCartIsEmpty(cartItems.length === 0);
    }, [cartItems]);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const subtotalEuro = bgnToEur(subtotal);


    // Функцията за симулиране на завършване на поръчката
    const handleCheckout = () => {
        // В реално приложение тук бихте направили POST заявка към Stripe API
        // Засега, просто ще изведем съобщение в конзолата
        console.log("Поръчката е завършена. Пренасочване към Stripe...");
        // router.push('/checkout/stripe');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Твоята количка</h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    &larr; Назад
                </button>
            </div>

            {cartIsEmpty ? (
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Количката е празна. Разгледайте <Link href="/gallery" className="text-blue-500 hover:underline">нашите картини</Link>!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        {cartItems.map((item) => (

                            <div key={item.id} className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                <div className="relative w-24 h-24 mr-4 flex-shrink-0">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill // replaces layout="fill"
                                        style={{ objectFit: "cover" }}
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{item.title}</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Автор: <span className="font-medium text-blue-500">{item.artist}</span>
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Размер: <span className="font-medium">{item.dimensions}</span>
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Дата на поръчка: <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {item.price.toFixed(2)} лв.
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {bgnToEur(item.price).toFixed(2)} €
                                    </p>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="mt-2 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Премахни
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Обща сума</h2>
                            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300 mb-2">
                                <span>Подсума (лв.)</span>
                                <span className="font-semibold">{subtotal.toFixed(2)} лв.</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                <span>Подсума (€)</span>
                                <span className="font-semibold">{subtotalEuro.toFixed(2)} €</span>
                            </div>
                            <hr className="my-4 border-gray-200 dark:border-gray-700" />
                            <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                <span>Общо</span>
                                <span>{subtotal.toFixed(2)} лв.</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                <span>Общо</span>
                                <span>{subtotalEuro.toFixed(2)} €</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors"
                            >
                                Завърши поръчката
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
