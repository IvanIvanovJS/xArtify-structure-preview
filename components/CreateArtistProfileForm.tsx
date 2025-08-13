// components/CreateArtistProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const CheckoutForm = ({ bio, userId }: { bio: string; userId: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const { data: session, update } = useSession();
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "Възникна грешка при плащането.");
            setIsLoading(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
            try {
                const response = await fetch("/api/create-artist-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bio, userId, paymentIntentId: paymentIntent.id }),
                });

                if (response.ok) {
                    const newProfile = await response.json();
                    alert("Профилът на артист беше успешно създаден!");
                    await update({ ...session, user: { ...session?.user, isArtist: true } });
                    router.push(`/artists/${newProfile.id}`);
                } else {
                    const errorData = await response.json();
                    setMessage(`Грешка при създаване на профил: ${errorData.message}`);
                }
            } catch (error) {
                console.error(error);
                setMessage("Възникна грешка при свързване със сървъра.");
            }
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <div className="flex justify-end mt-6">
                <button
                    type="submit"
                    disabled={!stripe || !elements || isLoading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {isLoading ? "Плащане..." : "Плати и създай профил"}
                </button>
            </div>
            {message && <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">{message}</div>}
        </form>
    );
};

export default function CreateArtistProfileForm({ userId }: { userId: string }) {
    const [bio, setBio] = useState("");
    const [isArtist, setIsArtist] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isArtist) return setClientSecret("");

        setIsSubmitting(true);
        fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isArtist }),
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret))
            .catch((err) => {
                console.error(err);
                alert("Възникна грешка при стартиране на плащането.");
                setIsArtist(false);
            })
            .finally(() => setIsSubmitting(false));
    }, [isArtist]);

    if (isArtist && clientSecret) {
        const options = {
            clientSecret,
            appearance: { theme: "stripe" } as const,
            // Wallets автоматично се поддържат от PaymentElement
        };

        return (
            <Elements stripe={stripePromise} options={options}>
                <CheckoutForm bio={bio} userId={userId} />
            </Elements>
        );
    }

    return (
        <form className="space-y-6">
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Биография (по желание)
                </label>
                <textarea
                    id="bio"
                    name="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
            </div>
            <div className="flex items-center">
                <input
                    id="isArtist"
                    name="isArtist"
                    type="checkbox"
                    checked={isArtist}
                    onChange={(e) => setIsArtist(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isArtist" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                    Абонирай се, за да станеш артист (100 лв./неограничено)
                </label>
            </div>
            <div className="flex justify-end">
                <button
                    type="button"
                    disabled={isSubmitting || !isArtist}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    onClick={() => {
                        if (!isArtist || !clientSecret) alert("Моля, маркирайте чекбокса за абонамент.");
                    }}
                >
                    {isSubmitting ? "Изчакване..." : "Продължи"}
                </button>
            </div>
        </form>
    );
}
