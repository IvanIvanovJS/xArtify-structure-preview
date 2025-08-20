// components/ImageGallery.tsx
'use client';

import Image from "next/image";
import { useState } from "react";

export default function ImageGallery({ images }: { images: string[] }) {
    const [current, setCurrent] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);

    return (
        <div>
            {/* Миниатюри */}
            <div className="flex gap-4 mt-4 overflow-x-auto">
                {images.map((img, i) => (
                    <div
                        key={i}
                        className="relative w-24 h-24 cursor-pointer"
                        onClick={() => { setCurrent(i); setFullscreen(true); }}
                    >
                        <Image src={img} alt={`thumb-${i}`} fill style={{ objectFit: "cover" }} />
                    </div>
                ))}
            </div>

            {/* Fullscreen modal */}
            {fullscreen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <button
                        onClick={() => setFullscreen(false)}
                        className="absolute top-4 right-4 text-white text-2xl"
                    >
                        ✕
                    </button>

                    <button
                        onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
                        className="absolute left-4 text-white text-3xl"
                    >
                        ‹
                    </button>

                    <div className="relative w-3/4 h-3/4">
                        <Image src={images[current]} alt={`img-${current}`} fill style={{ objectFit: "contain" }} />
                    </div>

                    <button
                        onClick={() => setCurrent((c) => (c + 1) % images.length)}
                        className="absolute right-4 text-white text-3xl"
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}
