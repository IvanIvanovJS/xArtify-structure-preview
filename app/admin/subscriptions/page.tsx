import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SubscriptionManagement from "@/components/admin/SubscriptionManagement";

export default async function AdminSubscriptionsPage() {
    const session = await getServerSession(authOptions);

    // Проверка за автентификация
    if (!session?.user?.id) {
        redirect("/login?callbackUrl=/admin/subscriptions");
    }

    // Проверка за admin роля
    if (session.user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="admin-page">
            <SubscriptionManagement />
        </div>
    );
}
