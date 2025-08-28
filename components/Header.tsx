"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import CartIcon from "@/components/CartIcon";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session } = useSession();

    // Проверяваме дали потребителят е артист, като търсим artistProfile в сесията
    const isArtist = session?.user?.artistProfile !== undefined && session?.user?.artistProfile !== null;

    return (
        <header className="sticky top-2 h-12 z-50 bg-white/80 backdrop-blur-md shadow-md dark:bg-gray-900/80">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                {/* Лого / Име на сайта */}
                <Link href="/" className="relative left-20">
                    <span className="text-2xl font-bold text-rose-400 dark:text-gray-100">
                        Art Platform
                    </span>
                </Link>

                {/* Бургер меню бутон (само за мобилни устройства) */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden text-gray-800 dark:text-gray-100 focus:outline-none"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                        />
                    </svg>
                </button>

                {/* Навигационни връзки (десктоп) */}
                <div className="hidden md:flex items-center space-x-6 gap-x-4">
                    <Link href="/gallery">
                        <button className="px-4 py-2 h-10 w-30 text-white bg-rose-400 rounded-[6px] hover:bg-rose-500 transition-colors">
                            Галерия
                        </button>
                    </Link>
                    <Link href="/courses">
                        <button className="px-4 py-2 text-white h-10 w-30 bg-rose-400 rounded-[6px] hover:bg-rose-500 transition-colors">
                            Курсове
                        </button>
                    </Link>
                    {isArtist && (
                        <Link href="/upload-artwork">
                            <button className="px-4 py-2 text-white h-10 w-30 bg-rose-400 rounded-[6px] hover:bg-rose-500 transition-colors">
                                Качи картина
                            </button>
                        </Link>
                    )}
                    {session ? (
                        <>
                            <Link href="/my-profile">
                                <button className="px-4 py-2 text-white h-10 w-30 bg-rose-400 rounded-[6px] hover:bg-rose-500 transition-colors">
                                    Моят профил
                                </button>
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="px-4 py-2 text-white bg-red-600 h-10 w-24 rounded-[6px] hover:bg-red-700 transition-colors"
                            >
                                Изход
                            </button>
                            <CartIcon />
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <button className="px-4 py-2 text-white h-10 w-24 bg-rose-400 rounded-[6px] hover:bg-rose-500 transition-colors">
                                    Вход
                                </button>
                            </Link>
                            <Link href="/register">
                                <button className="px-4 py-2 text-white h-10 w-24 bg-rose-400 rounded-[6px] hover:bg-rose-500 transition-colors">
                                    Регистрация
                                </button>
                            </Link>
                            <CartIcon />
                        </>
                    )}
                </div>

                {/* Мобилно меню */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-md md:hidden transition-all duration-300 ease-in-out">
                        <div className="flex flex-col p-4 space-y-2">
                            <Link href="/gallery">
                                <button className="block text-gray-800 dark:text-gray-200 hover:text-blue-600 py-2">
                                    Галерия
                                </button>
                            </Link>
                            <Link href="/courses">
                                <button className="block text-gray-800 dark:text-gray-200 hover:text-blue-600 py-2">
                                    Курсове
                                </button>
                            </Link>
                            {isArtist && (
                                <Link href="/upload-artwork">
                                    <button className="block text-gray-800 dark:text-gray-200 hover:text-blue-600 py-2">
                                        Качи картина
                                    </button>
                                </Link>
                            )}
                            {session ? (
                                <>
                                    <Link href="/my-profile">
                                        <button className="block text-gray-800 dark:text-gray-200 hover:text-blue-600 py-2">
                                            Моят профил
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                        className="w-full text-left text-red-600 hover:text-red-700 py-2"
                                    >
                                        Изход
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <button className="block text-gray-800 dark:text-gray-200 hover:text-blue-600 py-2">
                                            Вход
                                        </button>
                                    </Link>
                                    <Link href="/register">
                                        <button className="block text-gray-800 dark:text-gray-200 hover:text-blue-600 py-2">
                                            Регистрация
                                        </button>
                                    </Link>
                                </>
                            )}
                            <div className="w-full flex justify-center mt-4">
                                <CartIcon />
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
