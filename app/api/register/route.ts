import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Моля, попълнете всички полета" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Този имейл вече съществува" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({ data: { email, password: hashedPassword } });

        return NextResponse.json({ message: "Регистрацията е успешна" });
    } catch (error) {
        console.error("Грешка при регистрация:", error);
        return NextResponse.json({ error: "Вътрешна грешка на сървъра" }, { status: 500 });
    }
}
