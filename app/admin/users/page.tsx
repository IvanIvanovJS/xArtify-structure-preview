import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import UserManagement from "@/components/admin/UserManagement";

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);

    // Проверка за автентификация
    if (!session?.user?.id) {
        redirect("/login?callbackUrl=/admin/users");
    }

    // Проверка за admin роля
    if (session.user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="admin-page">
            <UserManagement />
        </div>
    );
}
