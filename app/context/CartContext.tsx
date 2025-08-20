// app/context/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Дефинираме типа на артикулите в количката
interface CartItem {
    id: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    dimensions: string;
    artist: string;
}

// Дефинираме типа на CartContext
interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => boolean;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    getCartItemCount: () => number;
}

// Създаваме контекста
const CartContext = createContext<CartContextType | undefined>(undefined);

// Създаваме доставчика (Provider) на контекста
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (item: Omit<CartItem, 'quantity'>): boolean => {
        const exists = cartItems.some(i => i.id === item.id);

        if (exists) {
            return false; // вече е добавен
        }

        setCartItems(prevItems => [...prevItems, { ...item, quantity: 1 }]);
        return true;
    };

    const removeFromCart = (itemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartItemCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartItemCount }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom Hook за лесен достъп до контекста
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
