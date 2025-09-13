// components/CartIcon.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function CartIcon() {
    const { getCartItemCount } = useCart();
    const itemCount = getCartItemCount();

    return (
        <Link href="/cart"
            aria-label="Количка"
            className="cart-icon"
            title="Количка"
        >
            <div className="x-icon-btn cart-icon__container">

                <ShoppingCart size={24} aria-hidden />
                <span className="cart-icon__badge">
                    {itemCount}
                </span>
            </div>
        </Link>
    );
}
