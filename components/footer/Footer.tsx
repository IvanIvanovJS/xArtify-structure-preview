"use client";

import Link from "next/link";
import Image from "next/image";
import { JSX } from "react";
import "./styles/footer.css";

export default function Footer(): JSX.Element {
    return (
        <footer className="x-footer" role="contentinfo">
            {/* Background logo */}
            <div className="x-footer__background-logo">
                <Image
                    src="/web-logo.svg"
                    alt="xArtify Logo"
                    width={400}
                    height={400}
                    className="x-footer__background-logo-image"
                />
            </div>

            <div className="x-footer__container">
                {/* Column 1: Company Information */}
                <div className="x-footer__column">
                    <h3 className="x-footer__heading">КОМПАНИЯ</h3>
                    <ul className="x-footer__list">
                        <li>
                            <Link href="/about" className="x-footer__link">
                                За нас
                            </Link>
                        </li>
                        <li>
                            <Link href="/sponsorships" className="x-footer__link">
                                Спонсорства и дарения
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="x-footer__link">
                                Контакти
                            </Link>
                        </li>
                        <li>
                            <Link href="/privacy" className="x-footer__link">
                                Поверителност
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Column 2: Platform Features */}
                <div className="x-footer__column">
                    <h3 className="x-footer__heading">ПЛАТФОРМА</h3>
                    <ul className="x-footer__list">
                        <li>
                            <Link href="/gallery" className="x-footer__link">
                                Галерия
                            </Link>
                        </li>
                        <li>
                            <Link href="/courses" className="x-footer__link">
                                Курсове
                            </Link>
                        </li>
                        <li>
                            <Link href="/artists" className="x-footer__link">
                                Артисти
                            </Link>
                        </li>
                        <li>
                            <Link href="/upload-artwork" className="x-footer__link">
                                Качи картина
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Column 3: Resources */}
                <div className="x-footer__column">
                    <h3 className="x-footer__heading">РЕСУРСИ</h3>
                    <ul className="x-footer__list">
                        <li>
                            <Link href="/help" className="x-footer__link">
                                Помощ
                            </Link>
                        </li>
                        <li>
                            <Link href="/faq" className="x-footer__link">
                                Често задавани въпроси
                            </Link>
                        </li>
                        <li>
                            <Link href="/terms" className="x-footer__link">
                                Условия за ползване
                            </Link>
                        </li>
                        <li>
                            <Link href="/blog" className="x-footer__link">
                                Блог
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Column 4: Contact Info */}
                <div className="x-footer__column">
                    <h3 className="x-footer__heading">КОНТАКТИ</h3>
                    <div className="x-footer__contact">
                        <div className="x-footer__contact-item">
                            <svg
                                className="x-footer__contact-icon"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span className="x-footer__contact-text">
                                София, България
                            </span>
                        </div>
                        <div className="x-footer__contact-item">
                            <svg
                                className="x-footer__contact-icon"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span className="x-footer__contact-text">
                                +359 888 123 456
                            </span>
                        </div>
                        <div className="x-footer__contact-item">
                            <svg
                                className="x-footer__contact-icon"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span className="x-footer__contact-text">
                                info@xartify.com
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom section with copyright */}
            <div className="x-footer__bottom">
                <div className="x-footer__copyright">
                    <p className="x-footer__copyright-text">
                        © 2025 xArtify. Всички права запазени.
                    </p>
                </div>
            </div>
        </footer>
    );
}
