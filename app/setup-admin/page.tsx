import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import CreateAdminForm from "@/components/admin/CreateAdminForm";

export default async function SetupAdminPage() {
    // Проверка дали вече има admin потребители
    const adminCount = await prisma.user.count({
        where: { role: "ADMIN" }
    });

    // Ако вече има admin потребители, пренасочваме към admin панела
    if (adminCount > 0) {
        redirect("/admin");
    }

    // Проверка за автентификация
    const session = await getServerSession(authOptions);

    // Ако потребителят е логнат И е admin, пренасочваме към admin панела
    if (session?.user?.id && session.user.role === "ADMIN") {
        redirect("/admin");
    }

    // В противен случай показваме формата за създаване на admin
    // независимо дали потребителят е логнат или не
    return (
        <div className="admin-setup-layout">
            <CreateAdminForm />
        </div>
    );
}
