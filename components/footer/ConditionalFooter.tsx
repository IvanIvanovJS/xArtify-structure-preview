"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter(): React.JSX.Element {
    const pathname = usePathname();

    // Страници без футър
    const noFooterPages = ["/login", "/register", "/forgotten-password"];
    const shouldHideFooter = noFooterPages.includes(pathname);

    if (shouldHideFooter) {
        return <></>;
    }

    return <Footer />;
}
