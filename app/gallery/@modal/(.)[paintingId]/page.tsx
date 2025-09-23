// Desktop intercept route for painting popup modal
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Image from 'next/image';
import Link from 'next/link';
import { formatPriceBGN, formatPriceEUR, calculatePromotionPrice, calculateDiscountPercentage } from '@/lib/currency';
import ImageGallery from '@/components/ImageGallery';
import AddToCartButton from "@/components/cart/AddToCartButton";
import { prisma } from "@/lib/prisma";
import { PaintingWithArtist } from "@/components/uploadArtwork/types";

export const runtime = "nodejs";

interface PaintingModalPageProps {
    params: Promise<{ paintingId: string }>;
}

export default async function PaintingModalPage({ params }: PaintingModalPageProps): Promise<React.JSX.Element> {
    const { paintingId } = await params;
    const session = await getServerSession(authOptions);

    const painting = await prisma.painting.findUnique({
        where: { id: paintingId },
        include: {
            artist: {
                select: {
                    id: true,
                    userId: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    if (!painting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">Картината не е намерена</h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                    Върнете се в <Link href="/gallery" className="text-blue-500 hover:underline">галерията</Link>.
                </p>
            </div>
        );
    }

    // Transform to PaintingWithArtist type
    // const paintingData: PaintingWithArtist = {
    //     id: painting.id,
    //     title: painting.title,
    //     urlTitle: painting.urlTitle,
    //     description: painting.description,
    //     dimensions: painting.dimensions,
    //     materials: painting.materials,
    //     images: painting.images,
    //     price: painting.price,
    //     isSold: painting.isSold,
    //     artistId: painting.artist.id,
    //     widthCm: painting.widthCm,
    //     heightCm: painting.heightCm,
    //     slug: painting.slug,
    //     technique: painting.technique,
    //     subject: painting.subject,
    //     tags: painting.tags,
    //     style: painting.style,
    //     isOnSale: painting.isOnSale,
    //     salePercentage: painting.salePercentage,
    //     finalPrice: painting.finalPrice,
    //     originalPrice: painting.originalPrice,
    //     createdAt: painting.createdAt,
    //     updatedAt: painting.updatedAt,
    //     artist: {
    //         id: painting.artist.id,
    //         bio: null,
    //         user: {
    //             name: painting.artist.user.name,
    //             email: painting.artist.user.email,
    //         },
    //     },
    // };

    const isOwner = session && session.user.id === painting.artist.userId;

    // Check if painting is on promotion
    const isOnPromotion = painting.price > 500;
    const promotionPrice = isOnPromotion ? calculatePromotionPrice(painting.price, 20) : null;
    const discountPercentage = promotionPrice ? calculateDiscountPercentage(painting.price, promotionPrice) : null;
    const finalPrice = promotionPrice || painting.price;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                {/* Close Button */}
                <Link
                    href="/gallery"
                    className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Link>

                <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
                    {/* Images Section */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="relative w-full h-96 rounded-lg overflow-hidden mb-4">
                            <Image
                                src={painting.images[0] || "/placeholder.jpg"}
                                alt={painting.title}
                                fill
                                style={{ objectFit: "contain" }}
                                className="bg-gray-100"
                            />
                        </div>
                        <ImageGallery images={painting.images} />
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 p-6 overflow-y-auto border-l border-gray-200 dark:border-gray-700">
                        <div className="space-y-6">
                            {/* Title and Artist */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                    {painting.title}
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    от{" "}
                                    <Link
                                        href={`/artists/${painting.artist.id}`}
                                        className="text-blue-500 hover:underline"
                                    >
                                        {painting.artist.user.name}
                                    </Link>
                                </p>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {promotionPrice ? (
                                        <>
                                            <p className="text-lg text-gray-500 line-through">
                                                {formatPriceBGN(painting.price)}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {formatPriceBGN(promotionPrice)}
                                            </p>
                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded">
                                                -{discountPercentage}%
                                            </span>
                                        </>
                                    ) : (
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {formatPriceBGN(painting.price)}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatPriceEUR(finalPrice)}
                                </p>
                            </div>

                            {/* Description */}
                            {painting.description && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        Описание
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {painting.description}
                                    </p>
                                </div>
                            )}

                            {/* Technical Details */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                    Технически детайли
                                </h3>
                                <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                                    {painting.dimensions && (
                                        <li><strong>Размери:</strong> {painting.dimensions}</li>
                                    )}
                                    {painting.materials && (
                                        <li><strong>Материали:</strong> {painting.materials}</li>
                                    )}
                                    {painting.technique && (
                                        <li><strong>Техника:</strong> {painting.technique}</li>
                                    )}
                                    {painting.style && (
                                        <li><strong>Стил:</strong> {painting.style}</li>
                                    )}
                                </ul>
                            </div>

                            {/* Tags */}
                            {painting.tags && painting.tags.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        Тагове
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {painting.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="pt-4">
                                {isOwner ? (
                                    <Link href={`/gallery/edit/${painting.id}`}>
                                        <button className="w-full bg-blue-500 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-600 transition-colors">
                                            Редактирай картина
                                        </button>
                                    </Link>
                                ) : (
                                    <AddToCartButton
                                        id={painting.id}
                                        title={painting.title}
                                        price={finalPrice}
                                        dimensions={painting.dimensions || ""}
                                        artist={painting.artist.user.name || ""}
                                        image={painting.images[0] || "/placeholder.jpg"}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
