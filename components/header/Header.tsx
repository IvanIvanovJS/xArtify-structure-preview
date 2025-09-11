"use client";

import { usePathname } from "next/navigation";
import { JSX } from "react";
import NavigationHeader from "./NavigationHeader";
import HomeHero from "../home/HomeHero";



export default function Header(): JSX.Element {
    const pathname = usePathname();
    const isHome = pathname === "/" || pathname === "/home";

    return (
        <>
            <NavigationHeader />
            {isHome && <HomeHero />}
        </>
    );
}
