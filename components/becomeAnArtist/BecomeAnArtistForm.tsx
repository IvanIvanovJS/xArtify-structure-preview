// components/CreateArtistProfileForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const CheckoutForm = ({ bio, phoneNumber, userId }: { bio: string; phoneNumber: string; userId: string }) => {
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
                const response = await fetch("/api/become-an-artist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bio, phoneNumber, userId, paymentIntentId: paymentIntent.id }),
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
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>("");
    const [isValidPhone, setIsValidPhone] = useState(true);
    const [agreed, setAgreed] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStartPayment = async () => {
        if (!agreed || !phoneNumber || !isValidPhone) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isArtist: true }),
            });
            const data = await res.json();
            setClientSecret(data.clientSecret);
        } catch (err) {
            console.error(err);
            alert("Възникна грешка при стартиране на плащането.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (clientSecret) {
        const options = {
            clientSecret,
            appearance: { theme: "stripe" } as const,
        };

        return (
            <Elements stripe={stripePromise} options={options}>
                <CheckoutForm bio={bio} phoneNumber={phoneNumber || ""} userId={userId} />
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

            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Телефонен номер <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                    international
                    defaultCountry="BG"
                    value={phoneNumber}
                    onChange={(value) => {
                        setPhoneNumber(value || "");
                        setIsValidPhone(value ? isValidPhoneNumber(value) : false);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                {!isValidPhone && phoneNumber && (
                    <p className="mt-2 text-sm text-red-600">Моля, въведете валиден телефонен номер.</p>
                )}
            </div>

            <div className="flex items-center">
                <input
                    id="agreed"
                    name="agreed"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreed" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                    Съгласявам се с{" "}
                    <Link href="/artist-terms" className="text-blue-600 underline hover:text-blue-800">
                        условията
                    </Link>{" "}
                    за ставане на артист
                </label>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    disabled={!agreed || isSubmitting || !phoneNumber || !isValidPhone}
                    onClick={handleStartPayment}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {isSubmitting ? "Изчакване..." : "Продължи към плащане"}
                </button>
            </div>
        </form>
    );
}
