// components/CartIcon.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";


export default function CartIcon() {
    const { getCartItemCount } = useCart();
    const itemCount = getCartItemCount();

    return (
        <Link href="/cart">
            <div className="relative p-2 cursor-pointer">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>


                <span className="absolute -top-2 -right-3 inline-flex items-center justify-center h-4 w-6 text-xs font-bold leading-none text-white bg-primary-light rounded-full">
                    {itemCount}
                </span>


            </div>
        </Link>
    );
}
