// app/paintings/page.tsx
import PaintingCard from "@/components/PaintingCard";

type Painting = {
    id: string;
    title: string;
    dimensions: string;
    description: string;
    images: string[];
    price: number;
    artistId: string;
    artist: {
        user: {
            name: string;
        };
    };
}
// Функция за извличане на картините от API-то
async function getPaintings() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/paintings`, {
        cache: "no-store", // Деактивираме кеширането, за да виждаме винаги актуални данни
    });
    if (!res.ok) {
        throw new Error("Failed to fetch paintings");
    }
    return res.json();
}

export default async function PaintingsPage() {
    const paintings = await getPaintings();


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Галерия с Картини</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paintings.length > 0 ? (
                    paintings.map((painting: Painting) => (
                        <PaintingCard key={painting.id} painting={painting} />
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500">
                        Все още няма качени картини.
                    </p>
                )}
            </div>
        </div>
    );
}