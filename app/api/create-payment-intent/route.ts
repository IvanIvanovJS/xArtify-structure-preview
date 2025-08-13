// app/api/create-payment-intent/route.ts
import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-07-30.basil",
});

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { isArtist } = await req.json();

        if (!isArtist) {
            return NextResponse.json({ message: "No payment required" });
        }

        // Създаваме PaymentIntent с автоматични методи (Apple Pay / Google Pay)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 10000, // 100.00 лв. в стотинки
            currency: "bgn",
            metadata: {
                userId: session.user.id,
                email: session.user.email,
            },
            automatic_payment_methods: {
                enabled: true, // активира всички автоматично поддържани методи
            },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        return NextResponse.json({ message: "Error creating payment intent" }, { status: 500 });
    }
}
