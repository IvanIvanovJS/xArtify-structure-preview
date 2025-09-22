"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import LogoutConfirmation from "../ui/LogoutConfirmation";

export default function HomeHero() {
    const { data: session } = useSession();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    return (
        <section className="x-hero">
            <div className="mx-auto max-w-7xl w-full px-4 md:px-6">
                {/* Цитат – отместен под бара */}
                <div className="pt-8 md:pt-10">
                    <p className="home-quote" aria-label="Всяко гениално изкуство е започнало на празно платно">
                        {`ВСЯКО ГЕНИАЛНО${`\n`}ИЗКУСТВО${`\n`}ЗАПОЧВА НА${`\n`}ПРАЗНО ПЛАТНО!`}
                    </p>
                </div>

                {/* Долни линкове */}
                <div className="footer-wrapper">
                    <div className="flex flex-col gap-1">
                        <Link href="/about" className="footer-link">За нас</Link>
                        <Link href="/contact" className="footer-link">Контакти</Link>
                    </div>
                    <div>
                        {session ? (
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="footer-link inline-flex items-center gap-2"
                            >
                                <LogOut size={18} /> Изход
                            </button>
                        ) : (
                            <Link href="/login" className="footer-link inline-flex items-center gap-2">
                                <LogIn size={18} /> Вход
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmation
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
            />
        </section>
    );
}
