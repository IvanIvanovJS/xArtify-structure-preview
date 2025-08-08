// components/PaintingCard.tsx
import Link from "next/link";
import Image from "next/image";

interface Painting {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    artist: {
        user: {
            name: string;
        };
    };
}

interface PaintingCardProps {
    painting: Painting;
}

export default function PaintingCard({ painting }: PaintingCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative w-full h-64">
                <Image
                    src={painting.imageUrl || "/placeholder.jpg"}
                    alt={painting.title}
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{painting.title}</h3>
                <p className="text-sm text-gray-600">
                    от{" "}
                    <Link href={`/artists/${painting.artist.user.name}`} className="text-blue-500 hover:underline">
                        {painting.artist.user.name}
                    </Link>
                </p>
                <p className="mt-2 text-lg font-bold text-gray-900">{painting.price.toFixed(2)} лв.</p>
                <button className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                    Купи
                </button>
            </div>
        </div>
    );
}