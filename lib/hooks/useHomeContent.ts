import useSWR from 'swr';
import { useSession } from 'next-auth/react';

interface HomeContentData {
    title: string;
    subtitle: string;
    image1Url: string;
    image2Url: string;
}

interface HomeContentResponse {
    success: boolean;
    data?: HomeContentData;
    error?: string;
}

const fetcher = async (url: string): Promise<HomeContentData | null> => {
    try {
        const response = await fetch(url);
        const result: HomeContentResponse = await response.json();

        if (result.success && result.data) {
            return result.data;
        }

        return null;
    } catch (error) {
        console.error('Error fetching home content:', error);
        return null;
    }
};

export const useHomeContent = () => {
    const { data: session } = useSession();

    const { data, error, isLoading, mutate } = useSWR<HomeContentData | null>(
        '/api/home/updateContent',
        fetcher,
        {
            // Кеширане за 5 минути
            dedupingInterval: 5 * 60 * 1000,
            // Revalidate при фокус на прозореца
            revalidateOnFocus: true,
            // Revalidate при връзка с интернет
            revalidateOnReconnect: true,
            // Не revalidate при mount ако има кеширани данни
            revalidateOnMount: true,
            // Retry при грешка
            errorRetryCount: 3,
            errorRetryInterval: 1000,
            // Fallback данни
            fallbackData: null,
        }
    );

    const updateContent = async (newData: Partial<HomeContentData>) => {
        try {
            const response = await fetch('/api/home/updateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newData),
            });

            const result = await response.json();

            if (result.success) {
                // Revalidate за да се синхронизира с базата данни
                mutate();
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error updating content:', error);
            return { success: false, error: 'Грешка при запазване' };
        }
    };

    return {
        data,
        error,
        isLoading,
        isAdmin: session?.user?.role === 'ADMIN',
        updateContent,
        mutate
    };
};
