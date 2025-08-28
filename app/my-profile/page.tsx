"use client";

import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
    id: string;
    name: string | null;
    image: string | null;
    isArtist: boolean;
    artistProfile: {
        bio: string | null;
        phoneNumber: string | null;
    } | null;
}

export default function MyProfilePage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    const router = useRouter();

    const fetchProfileData = useCallback(async () => {
        try {
            const response = await fetch("/api/profile");

            if (response.status === 401) {
                setErrorMessage("Сесията ви е изтекла. Ще бъдете пренасочени към страницата за влизане.");
                setTimeout(() => router.push("/login"), 5000);
                return;
            }

            if (!response.ok) {
                setErrorMessage("Неуспешно зареждане на данни.");
                return;
            }

            const data: UserData = await response.json();
            setUserData(data);

            if (data.name) setName(data.name);
            if (data.artistProfile) {
                if (data.artistProfile.bio) setBio(data.artistProfile.bio);
                if (data.artistProfile.phoneNumber) setPhoneNumber(data.artistProfile.phoneNumber);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("Възникна неочаквана грешка при зареждане на профила.");
        } finally {
            setLoading(false);
        }

    }, []);
    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);


    const handleUpdateName = async () => {
        try {
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) throw new Error("Неуспешно актуализиране на името.");
            alert("Името е успешно актуализирано!");
            fetchProfileData();
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("Възникна неизвестна грешка.");
            }
        }
    };



    const handleUpdateArtistProfile = async () => {
        try {
            const response = await fetch("/api/profile/artist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bio, phoneNumber }),
            });
            if (!response.ok) throw new Error("Неуспешно актуализиране на профила на артист.");
            alert("Профилът на артиста е успешно актуализиран!");
            fetchProfileData();
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("Възникна неизвестна грешка.");
            }
        }
    };

    const handleImageUpload = async () => {
        if (!imageFile) return;
        try {
            const formData = new FormData();
            formData.append("file", imageFile);

            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            if (!uploadResponse.ok) throw new Error("Неуспешно качване на снимка.");
            const uploadData = await uploadResponse.json();
            const newImageUrl = uploadData.imageUrl;

            const updateResponse = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: newImageUrl }),
            });
            if (!updateResponse.ok) throw new Error("Неуспешно актуализиране на снимка на потребител.");
            alert("Снимката на профила е успешно актуализирана!");
            fetchProfileData();
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("Възникна неизвестна грешка.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Зареждане на профила...</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">
                    {errorMessage || "Неуспешно зареждане на профила."}
                </p>
            </div>
        );
    }

    const profileImage =
        userData.image ||
        "https://placehold.co/150x150/E2E8F0/1A202C?text=No+Image";


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                {errorMessage && (
                    <div className="p-3 rounded bg-red-100 text-red-700 border border-red-300">
                        {errorMessage}
                    </div>
                )}

                <div className="flex flex-col items-center">
                    <Image
                        className="h-32 w-32 rounded-full"
                        src={profileImage}
                        alt="Profile Picture"
                        width={128}
                        height={128}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setImageFile(e.target.files ? e.target.files[0] : null)
                        }
                        className="mt-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                        onClick={handleImageUpload}
                        className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 focus:outline-none"
                    >
                        Запази снимка
                    </button>
                </div>

                <div className="mt-8 space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Име на потребителя
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Въведете вашето име"
                            />
                            <button
                                onClick={handleUpdateName}
                                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                            >
                                Запази
                            </button>
                        </div>
                    </div>

                    {!userData.artistProfile ? (
                        <div className="pt-6 border-t border-gray-200 text-center">
                            <Link href={"/create-artist-profile"}>
                                <button
                                    className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 focus:outline-none"
                                >
                                    Стани Артист
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-6 border-t border-gray-200">
                            <h3 className="text-xl font-bold text-center text-gray-800">
                                Профил на Артист
                            </h3>
                            <div>
                                <label
                                    htmlFor="bio"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Кратка биография
                                </label>
                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Разкажете нещо за себе си..."
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="phoneNumber"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Телефонен номер
                                </label>
                                <input
                                    id="phoneNumber"
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Въведете вашия телефонен номер"
                                />
                            </div>
                            <button
                                onClick={handleUpdateArtistProfile}
                                className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 focus:outline-none"
                            >
                                Запази промените
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
