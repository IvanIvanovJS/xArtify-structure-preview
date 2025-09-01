// app/api/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/verify";


function json<T>(payload: T, init?: ResponseInit): NextResponse<T> {
    return NextResponse.json<T>(payload, init);
}


export async function POST(req: Request): Promise<NextResponse> {
    const { token } = (await req.json()) as { token: string };
    if (!token) return json({ message: "Missing token" }, { status: 400 });


    const userId = await consumeVerificationToken(token);
    if (!userId) return json({ message: "Невалиден или изтекъл линк." }, { status: 400 });


    await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
    });


    return json({ message: "Имейлът е потвърден успешно." }, { status: 200 });
}