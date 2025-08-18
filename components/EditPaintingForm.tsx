// components/EditPaintingForm.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Painting } from '@prisma/client';
import Image from 'next/image';

interface EditPaintingFormProps {
    painting: Painting;
}

export default function EditPaintingForm({ painting }: EditPaintingFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: painting.title,
        dimensions: painting.dimensions || '',
        materials: painting.materials || '',
        description: painting.description || '',
        price: painting.price,
    });
    const [images, setImages] = useState<string[]>(painting.images);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value,
        }));
    };

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewImages(Array.from(e.target.files));
        }
    };

    const handleRemoveImage = (imageUrl: string) => {
        setImages(images.filter(img => img !== imageUrl));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsLoading(true);

        const uploadData = new FormData();
        uploadData.append('paintingData', JSON.stringify({ ...formData, images }));
        newImages.forEach(file => {
            uploadData.append('newImages', file);
        });

        try {
            const response = await fetch(`/api/paintings/${painting.id}`, {
                method: 'PUT',
                body: uploadData, // Използваме FormData за изпращане на файлове
            });

            if (response.ok) {
                const updatedPainting = await response.json();
                alert('Картината беше успешно обновена!');
                router.push(`/gallery/${updatedPainting.id}`);
            } else {
                const errorData = await response.json();
                alert(`Грешка при обновяване: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error updating painting:', error);
            alert('Възникна грешка при свързване със сървъра.');
        } finally {
            setIsSubmitting(false);
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Сигурни ли сте, че искате да изтриете тази картина?')) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/paintings/${painting.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Картината беше успешно изтрита!');
                router.push('/');
            } else {
                const errorData = await response.json();
                alert(`Грешка при изтриване: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error deleting painting:', error);
            alert('Възникна грешка при свързване със сървъра.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... Полетата за заглавие, размери, материали и т.н. остават същите ... */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Заглавие</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
            </div>
            <div>
                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Размери</label>
                <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
            </div>
            <div>
                <label htmlFor="materials" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Материали</label>
                <input
                    type="text"
                    id="materials"
                    name="materials"
                    value={formData.materials}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Описание</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Цена</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
            </div>

            {/* Секция за снимки */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Текущи снимки</label>
                <div className="flex flex-wrap gap-4">
                    {images.map(imageUrl => (
                        <div key={imageUrl} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                            <Image src={imageUrl} alt="Painting Image" layout="fill" objectFit="cover" />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(imageUrl)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full text-xs"
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="newImages" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Добави нови снимки</label>
                <input
                    type="file"
                    id="newImages"
                    name="newImages"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>
            {isLoading && <p className="text-blue-500 text-center">Качвам снимките...</p>}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full sm:flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {isSubmitting ? 'Запазване...' : 'Запази промените'}
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || isSubmitting || isLoading}
                    className="w-full sm:flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                >
                    {isDeleting ? 'Изтриване...' : 'Изтрий картината'}
                </button>
            </div>
        </form>
    );
}
