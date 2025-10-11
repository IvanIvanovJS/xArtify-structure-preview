import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link";
import { getClientIP, checkRateLimit } from "@/lib/adminAuth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // Проверка за автентификация
    if (!session?.user?.id) {
        redirect("/login?callbackUrl=/admin");
    }

    // Проверка за admin роля
    if (session.user.role !== "ADMIN") {
        redirect("/");
    }

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: "📊" },
        { href: "/admin/users", label: "Потребители", icon: "👥" },
        { href: "/admin/subscriptions", label: "Абонаменти", icon: "💳" },
        { href: "/admin/paintings", label: "Картини", icon: "🖼️" },
        { href: "/admin/courses", label: "Курсове", icon: "📚" },
        { href: "/admin/settings", label: "Настройки", icon: "⚙️" },
    ];

    return (
        <div className="admin-layout">
            {/* Admin Header */}
            <header className="admin-header">
                <div className="admin-header__content">
                    <div className="admin-header__brand">
                        <h1>Admin Panel</h1>
                        <p>Добре дошъл, {session.user.name || session.user.email}</p>
                    </div>

                    <div className="admin-header__actions">
                        <Link href="/" className="admin-btn admin-btn--secondary">
                            🏠 Към сайта
                        </Link>
                        <form action="/api/auth/signout" method="post">
                            <button type="submit" className="admin-btn admin-btn--secondary">
                                🚪 Изход
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="admin-layout__container">
                {/* Admin Sidebar */}
                <aside className="admin-sidebar">
                    <nav className="admin-nav">
                        <ul className="admin-nav__list">
                            {navItems.map((item) => (
                                <li key={item.href} className="admin-nav__item">
                                    <Link
                                        href={item.href}
                                        className="admin-nav__link"
                                    >
                                        <span className="admin-nav__icon">{item.icon}</span>
                                        <span className="admin-nav__label">{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Admin Info */}
                    <div className="admin-sidebar__info">
                        <div className="admin-info">
                            <div className="admin-info__avatar">
                                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "A"}
                            </div>
                            <div className="admin-info__details">
                                <div className="admin-info__name">
                                    {session.user.name || "Admin"}
                                </div>
                                <div className="admin-info__role">
                                    <span className="admin-role-badge admin-role-badge--admin">
                                        {session.user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="admin-main">
                    {children}
                </main>
            </div>
        </div>
    );
}
