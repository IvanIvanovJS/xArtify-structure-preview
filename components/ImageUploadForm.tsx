"use client";

import { useState } from 'react';

export default function ImageUploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Моля, изберете файл.");
            return;
        }

        setLoading(true);
        setError(null);
        setImageUrl(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Неуспешно качване.');
            }

            const data = await response.json();
            setImageUrl(data.imageUrl);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center p-8 bg-white shadow-xl rounded-lg max-w-lg mx-auto mt-10 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Качване на изображение</h2>
            <form onSubmit={handleUpload} className="flex flex-col space-y-4 w-full">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                />
                <button
                    type="submit"
                    disabled={loading || !file}
                    className={`px-4 py-2 text-white font-semibold rounded-md shadow transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                >
                    {loading ? 'Качване...' : 'Качи изображение'}
                </button>
            </form>

            {error && <p className="text-red-500">{error}</p>}
            {imageUrl && (
                <div className="flex flex-col items-center space-y-4">
                    <p className="text-green-600">Изображението е успешно качено!</p>
                    <img src={imageUrl} alt="Uploaded" className="max-w-xs max-h-xs rounded-lg shadow-md" />
                    <p className="break-all text-sm text-gray-500">URL: {imageUrl}</p>
                </div>
            )}
        </div>
    );
}
