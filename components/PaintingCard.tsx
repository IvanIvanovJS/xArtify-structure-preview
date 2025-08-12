// components/PaintingCard.tsx
import Link from "next/link";
import Image from "next/image";

interface Painting {
    id: string;
    title: string;
    description: string;
    dimensions: string;
    images: string[]; // Променено от imageUrl на images (масив от стрингове)
    price: number;
    artistId: string;
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
    // Взимаме първото изображение от масива `images`
    const primaryImage = painting.images[0] || "/placeholder.jpg";


    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Link href={`/paintings/${painting.id}`}>
                <div className="relative w-full h-64 group">

                    <Image

                        src={primaryImage} // Използваме първата снимка от масива
                        alt={painting.title}
                        layout="fill"
                        objectFit="cover"
                        className={`object-cover transition-opacity duration-500 group-hover:opacity-0`}
                    />
                    {/* Втора снимка */}
                    <Image
                        src={painting.images[1]}
                        alt="Artwork 2"
                        fill
                        className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                    />
                </div>
            </Link>
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{painting.title}</h3>
                <p className="text-sm text-gray-600">{painting.dimensions}</p>
                <p className="text-sm text-gray-600">
                    от{" "}
                    <Link href={`/artists/${painting.artistId}`} className="text-blue-500 hover:underline">
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
