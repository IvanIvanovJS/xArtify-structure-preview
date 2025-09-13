import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // Проверка за автентификация
    if (!session?.user?.id) {
        redirect("/login?callbackUrl=/admin");
    }

    // Проверка за admin роля
    if (session.user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="admin-page">
            <AdminDashboard />
        </div>
    );
}
