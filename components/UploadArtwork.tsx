// app/create-painting/CreatePaintingForm.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react"; // Ще използваме useSession за клиентска проверка

// Дефинираме props-овете за компонента
type CreatePaintingFormProps = {
    artistId: string;
};

export default function CreatePaintingForm({ artistId }: CreatePaintingFormProps) {
    const [title, setTitle] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [materials, setMaterials] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (selectedFiles.length < 2 || selectedFiles.length > 3) {
                setError('Моля, изберете между 2 и 3 файла.');
                setFiles([]);
            } else {
                setFiles(selectedFiles);
                setError(null);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files || files.length < 2 || files.length > 3) {
            setError('Моля, изберете между 2 и 3 файла.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Качване на изображенията в Cloudinary
            const imageUrls: string[] = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Неуспешно качване на файл: ${file.name}`);
                }

                const data = await response.json();
                imageUrls.push(data.imageUrl);
            }

            // 2. Създаване на нов запис за картината в базата данни
            const paintingData = {
                title,
                dimensions,
                materials,
                description,
                price: parseFloat(price),
                images: imageUrls,
                artistId: artistId, // Използваме подадения artistId
            };

            const paintingResponse = await fetch('/api/paintings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paintingData),
            });

            if (!paintingResponse.ok) {
                const errorData = await paintingResponse.json();
                throw new Error(errorData.error || 'Неуспешно добавяне на картина в базата данни.');
            }

            const newPainting = await paintingResponse.json();
            router.push(`/gallery/${newPainting.id}`); // Пренасочване към детайли на картината

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Възникна неизвестна грешка.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Име на картината</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">Размери (напр. "80x60 cm")</label>
                <input
                    id="dimensions"
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label htmlFor="materials" className="block text-sm font-medium text-gray-700">Използвани материали</label>
                <input
                    id="materials"
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Цена</label>
                <input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label htmlFor="files" className="block text-sm font-medium text-gray-700">Качване на изображения (2-3 файла)</label>
                <input
                    id="files"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    required
                    className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 text-white font-semibold rounded-md shadow transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-500 h-12'}`}
            >
                {loading ? 'Добавяне...' : 'Добави картина'}
            </button>
        </form>
    );
}
