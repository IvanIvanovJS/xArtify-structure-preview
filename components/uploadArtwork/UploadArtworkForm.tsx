"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, AlertCircle, CheckCircle, ChevronDown, Plus } from 'lucide-react';
import Image from 'next/image';

import CustomDropdown from '@/components/ui/CustomDropdown';
import type { UploadedFile } from './types';
import './styles/upload-form.css';

// Validation schema
const UploadArtworkSchema = z.object({
    title: z.string().min(1, 'Заглавието е задължително').max(140, 'Заглавието не може да бъде повече от 140 символа'),
    urlTitle: z.string()
        .min(1, 'URL-заглавието е задължително')
        .max(100, 'URL-заглавието не може да бъде повече от 100 символа')
        .regex(/^[a-zA-Zа-яА-Я0-9\s-]+$/, 'URL-заглавието може да съдържа само букви, цифри, интервали и тирета')
        .refine((val) => {
            const words = val.trim().split(/\s+/).filter(word => word.length > 0);
            return words.length >= 1 && words.length <= 10;
        }, 'URL-заглавието трябва да съдържа между 1 и 10 думи'),
    description: z.string().max(1000, 'Описанието не може да бъде повече от 1000 символа').optional(),
    materials: z.string().max(200, 'Материалите не могат да бъдат повече от 200 символа').optional(),
    price: z.number().positive('Цената трябва да бъде положително число').max(100000, 'Цената не може да бъде повече от 100,000 лв'),
    isOnSale: z.boolean().optional(),
    salePercentage: z.number().min(1, 'Процентът трябва да бъде поне 1%').max(100, 'Процентът не може да бъде повече от 100%').optional(),
    technique: z.string().min(1, 'Техниката е задължителна'),
    subject: z.string().min(1, 'Темата е задължителна'),
    style: z.string().min(1, 'Стилът е задължителен'),
    tags: z.array(z.string().regex(/^[a-zA-Zа-яА-Я0-9#\s]+$/, 'Разрешени са само букви, цифри и символ #')).min(1, 'Поне един таг е задължителен').max(10, 'Максимум 10 тага'),
    widthCm: z.number().positive('Ширината трябва да бъде положително число').max(500, 'Ширината не може да бъде повече от 500 см'),
    heightCm: z.number().positive('Височината трябва да бъде положително число').max(500, 'Височината не може да бъде повече от 500 см'),
});

type UploadArtworkFormData = z.infer<typeof UploadArtworkSchema>;

// Dropdown options
const techniqueOptions = [
    { value: '', label: 'Изберете техника' },
    { value: 'Маслени бои', label: 'Маслени бои' },
    { value: 'Акрилни бои', label: 'Акрилни бои' },
    { value: 'Акварел', label: 'Акварел' },
    { value: 'Темпера', label: 'Темпера' },
    { value: 'Гуаш', label: 'Гуаш' },
    { value: 'Пастел', label: 'Пастел' },
    { value: 'Молив', label: 'Молив' },
    { value: 'Въглен', label: 'Въглен' },
    { value: 'Туш', label: 'Туш' },
    { value: 'Смесена техника', label: 'Смесена техника' },
    { value: 'Цифрово изкуство', label: 'Цифрово изкуство' },
    { value: 'Колаж', label: 'Колаж' },
    { value: 'Скулптура', label: 'Скулптура' },
    { value: 'Графика', label: 'Графика' },
    { value: 'Монопринт', label: 'Монопринт' },
    { value: 'Линогравюра', label: 'Линогравюра' },
    { value: 'Друго', label: 'Друго' },
];

const subjectOptions = [
    { value: '', label: 'Изберете тема' },
    { value: 'Пейзаж', label: 'Пейзаж' },
    { value: 'Портрет', label: 'Портрет' },
    { value: 'Натюрморт', label: 'Натюрморт' },
    { value: 'Абстракция', label: 'Абстракция' },
    { value: 'Фигура', label: 'Фигура' },
    { value: 'Градски пейзаж', label: 'Градски пейзаж' },
    { value: 'Морски пейзаж', label: 'Морски пейзаж' },
    { value: 'Планински пейзаж', label: 'Планински пейзаж' },
    { value: 'Животни', label: 'Животни' },
    { value: 'Цветя', label: 'Цветя' },
    { value: 'Архитектура', label: 'Архитектура' },
    { value: 'Исторически', label: 'Исторически' },
    { value: 'Религиозен', label: 'Религиозен' },
    { value: 'Митичен', label: 'Митичен' },
    { value: 'Фантастичен', label: 'Фантастичен' },
    { value: 'Еротичен', label: 'Еротичен' },
    { value: 'Социален', label: 'Социален' },
    { value: 'Друго', label: 'Друго' },
];

const styleOptions = [
    { value: '', label: 'Изберете стил' },
    { value: 'Реализъм', label: 'Реализъм' },
    { value: 'Импресионизъм', label: 'Импресионизъм' },
    { value: 'Експресионизъм', label: 'Експресионизъм' },
    { value: 'Абстракционизъм', label: 'Абстракционизъм' },
    { value: 'Сюрреализъм', label: 'Сюрреализъм' },
    { value: 'Кубизъм', label: 'Кубизъм' },
    { value: 'Поп арт', label: 'Поп арт' },
    { value: 'Минимализъм', label: 'Минимализъм' },
    { value: 'Концептуализъм', label: 'Концептуализъм' },
    { value: 'Барок', label: 'Барок' },
    { value: 'Ренесанс', label: 'Ренесанс' },
    { value: 'Романтизъм', label: 'Романтизъм' },
    { value: 'Класицизъм', label: 'Класицизъм' },
    { value: 'Модернизъм', label: 'Модернизъм' },
    { value: 'Постмодернизъм', label: 'Постмодернизъм' },
    { value: 'Контемпорарен', label: 'Контемпорарен' },
    { value: 'Наивно изкуство', label: 'Наивно изкуство' },
    { value: 'Друго', label: 'Друго' },
];

// Default tags - will be replaced by API data
const defaultTags = [
    'Цвете', 'Природа', 'Портрет', 'Абстракция', 'Модерно', 'Класическо',
    'Ярко', 'Тъмно', 'Голям размер', 'Малък размер', 'Експресивно', 'Спокойно',
    'Град', 'Море', 'Планини', 'Животни', 'Цветя', 'Архитектура', 'История',
    'Романтично', 'Драматично', 'Елегантно', 'Смело', 'Нежно', 'Сила',
    'Свобода', 'Любов', 'Мечти', 'Реалност', 'Фантазия', 'Емоции'
];

export default function UploadArtworkForm({ artistId }: { artistId: string }): React.JSX.Element {
    const router = useRouter();
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showMoreTags, setShowMoreTags] = useState(false);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    const [customTagInput, setCustomTagInput] = useState('');
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [tagError, setTagError] = useState<string | null>(null);
    const [isOnSale, setIsOnSale] = useState(false);
    const [salePercentage, setSalePercentage] = useState<number>(0);

    // Validate tag input in real-time
    const isValidTagInput = (input: string): boolean => {
        if (!input.trim()) return false;
        const validTagRegex = /^[a-zA-Zа-яА-Я0-9#\s]+$/;
        return validTagRegex.test(input.trim());
    };

    // Calculate original price from sale price and percentage
    const calculateOriginalPrice = (salePrice: number, percentage: number): number => {
        // If sale price is 500 and discount is 15%, original price = 500 / (1 - 0.15) = 500 / 0.85 = 588.24
        return salePrice / (1 - percentage / 100);
    };

    // Convert URL title to URL-friendly format (replace spaces with hyphens)
    const convertToUrlFormat = (title: string): string => {
        return title.trim().toLowerCase().replace(/\s+/g, '-');
    };

    // Check if all required fields are filled
    const areRequiredFieldsFilled = (): boolean => {
        const formData = watch();
        return !!(
            formData.title &&
            formData.urlTitle &&
            formData.technique &&
            formData.subject &&
            formData.style &&
            formData.tags &&
            formData.tags.length > 0 &&
            formData.widthCm &&
            formData.heightCm &&
            formData.price &&
            uploadedFiles.length >= 2
        );
    };

    // Handle button click when disabled
    const handleButtonClick = (): void => {
        if (!areRequiredFieldsFilled()) {
            setError('Моля, попълнете всички задължителни * полета');
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
        reset
    } = useForm<UploadArtworkFormData>({
        resolver: zodResolver(UploadArtworkSchema),
        defaultValues: {
            tags: [],
        }
    });

    const watchedTags = watch('tags');

    // Auto-generate urlTitle from title
    useEffect(() => {
        const title = watch('title');
        const urlTitle = watch('urlTitle');
        if (title && !urlTitle) {
            setValue('urlTitle', convertToUrlFormat(title));
        }
    }, [watch, setValue]);

    // Load tags from database on component mount
    useEffect(() => {
        const loadTagsFromDatabase = async (): Promise<void> => {
            try {
                setIsLoadingTags(true);
                const response = await fetch('/api/tags');
                if (response.ok) {
                    const data = await response.json();
                    if (data.tags && data.tags.length > 0) {
                        const tagNames = data.tags.map((tag: { name: string }) => tag.name);
                        setAvailableTags(tagNames);
                    } else {
                        // If no tags exist, use default tags
                        setAvailableTags(defaultTags);
                    }
                } else {
                    console.error('Failed to load tags:', response.statusText);
                    // Fallback to default tags if API fails
                    setAvailableTags(defaultTags);
                }
            } catch (error) {
                console.error('Error loading tags from database:', error);
                // Fallback to default tags if API fails
                setAvailableTags(defaultTags);
            } finally {
                setIsLoadingTags(false);
            }
        };

        loadTagsFromDatabase();
    }, []);

    const addCustomTag = async (): Promise<void> => {
        if (!customTagInput.trim()) {
            setTagError('Моля, въведете таг');
            return;
        }

        const tagName = customTagInput.trim();

        // Check for valid characters (letters, numbers, #, and spaces)
        const validTagRegex = /^[a-zA-Zа-яА-Я0-9#\s]+$/;
        if (!validTagRegex.test(tagName)) {
            setTagError('Разрешени са само букви, цифри и символ #');
            return;
        }

        // Check if tag already exists
        if (availableTags.includes(tagName) || watchedTags?.includes(tagName)) {
            setTagError('Този таг вече съществува');
            return;
        }

        // Check if user already has 10 tags selected
        if (watchedTags && watchedTags.length >= 10) {
            setTagError('Максимум 10 тага са разрешени');
            return;
        }

        setIsAddingTag(true);
        setTagError(null);

        try {
            const response = await fetch('/api/tags/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: tagName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Tag creation error:', errorData);
                throw new Error(errorData.error || 'Неуспешно създаване на таг');
            }

            // Reload all tags from API to get proper sorting
            const reloadResponse = await fetch('/api/tags');
            if (reloadResponse.ok) {
                const reloadData = await reloadResponse.json();
                if (reloadData.tags && reloadData.tags.length > 0) {
                    const tagNames = reloadData.tags.map((tag: { name: string }) => tag.name);
                    setAvailableTags(tagNames);
                }
            }

            // Add tag to selected tags
            const currentTags = watchedTags || [];
            setValue('tags', [...currentTags, tagName]);

            // Clear input
            setCustomTagInput('');

        } catch (err) {
            console.error('Error adding custom tag:', err);
            setTagError(err instanceof Error ? err.message : 'Възникна грешка при добавяне на таг');
        } finally {
            setIsAddingTag(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const files = e.target.files;
        if (!files) return;

        const newFiles: UploadedFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError(`Файлът ${file.name} не е валидно изображение`);
                continue;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError(`Файлът ${file.name} е твърде голям (максимум 5MB)`);
                continue;
            }

            const preview = URL.createObjectURL(file);
            newFiles.push({
                file,
                preview,
                id: Math.random().toString(36).substr(2, 9)
            });
        }

        // Check total number of files (existing + new)
        const totalFiles = uploadedFiles.length + newFiles.length;

        if (totalFiles > 5) {
            setError('Максимум 5 изображения са разрешени общо');
            return;
        }

        setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
        setError(null);
    };

    const removeFile = (id: string): void => {
        setUploadedFiles(prev => {
            const fileToRemove = prev.find(f => f.id === id);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter(f => f.id !== id);
        });
    };

    const toggleTag = (tag: string): void => {
        const currentTags = watchedTags || [];
        if (currentTags.includes(tag)) {
            setValue('tags', currentTags.filter(t => t !== tag));
        } else {
            if (currentTags.length < 10) {
                setValue('tags', [...currentTags, tag]);
            }
        }
    };

    const onSubmit = async (data: UploadArtworkFormData): Promise<void> => {
        if (uploadedFiles.length < 2) {
            setError('Моля, изберете поне 2 изображения');
            return;
        }

        if (uploadedFiles.length > 5) {
            setError('Максимум 5 изображения са разрешени');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            // Upload images to Cloudinary
            const imageUrls: string[] = [];
            const totalFiles = uploadedFiles.length;

            for (let i = 0; i < uploadedFiles.length; i++) {
                const formData = new FormData();
                formData.append('file', uploadedFiles[i].file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Неуспешно качване на файл: ${uploadedFiles[i].file.name}`);
                }

                const result = await response.json();
                imageUrls.push(result.imageUrl);

                setUploadProgress(((i + 1) / totalFiles) * 50); // 50% for image uploads
            }

            // Create painting record
            const paintingData = {
                ...data,
                urlTitle: convertToUrlFormat(data.urlTitle), // Convert to URL-friendly format
                images: imageUrls,
                artistId,
                isOnSale: isOnSale,
                salePercentage: isOnSale ? salePercentage : 0,
                finalPrice: isOnSale && salePercentage > 0 ? data.price : data.price, // Final price is the price user entered
                originalPrice: isOnSale && salePercentage > 0 ? calculateOriginalPrice(data.price, salePercentage) : data.price,
            };

            setUploadProgress(75);

            const paintingResponse = await fetch('/api/paintings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paintingData),
            });

            if (!paintingResponse.ok) {
                const errorData = await paintingResponse.json();
                throw new Error(errorData.error || 'Неуспешно създаване на картина');
            }

            setUploadProgress(100);
            setSuccess(true);

            // Clean up preview URLs
            uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));

            // Reset form and redirect after delay
            setTimeout(() => {
                reset();
                setUploadedFiles([]);
                setSuccess(false);
                router.push('/gallery');
            }, 2000);

        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Възникна неизвестна грешка');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="upload-artwork-form">
            <form onSubmit={handleSubmit(onSubmit)} className="upload-form">
                {/* Basic Information */}
                <div className="form-section">
                    <h3 className="section-title">Основна информация</h3>

                    <div className="form-group">
                        <label htmlFor="title" className="form-label">
                            Заглавие *
                        </label>
                        <input
                            {...register('title')}
                            type="text"
                            id="title"
                            className={`form-input ${errors.title ? 'form-input-error' : ''}`}
                            placeholder="Въведете заглавие на картината"
                        />
                        {errors.title && (
                            <span className="form-error">
                                <AlertCircle size={16} />
                                {errors.title.message}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="urlTitle" className="form-label">
                            URL-заглавие *
                        </label>
                        <input
                            {...register('urlTitle')}
                            type="text"
                            id="urlTitle"
                            className={`form-input ${errors.urlTitle ? 'form-input-error' : ''}`}
                            placeholder="твоето URL заглавие тук"
                        />
                        {errors.urlTitle && (
                            <span className="form-error">
                                <AlertCircle size={16} />
                                {errors.urlTitle.message}
                            </span>
                        )}
                        <div className="url-preview">
                            <small>
                                URL ще изглежда така: <span className="url-example">xartify.com/gallery/{watch('urlTitle') ? convertToUrlFormat(watch('urlTitle')) : 'твоето-url-заглавие-тук'}</span>
                            </small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="form-label">
                            Описание
                        </label>
                        <textarea
                            {...register('description')}
                            id="description"
                            rows={4}
                            className={`form-textarea ${errors.description ? 'form-input-error' : ''}`}
                            placeholder="Опишете картината, техниката, вдъхновението..."
                        />
                        {errors.description && (
                            <span className="form-error">
                                <AlertCircle size={16} />
                                {errors.description.message}
                            </span>
                        )}
                    </div>


                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="widthCm" className="form-label">
                                Ширина (см) *
                            </label>
                            <input
                                {...register('widthCm', { valueAsNumber: true })}
                                type="number"
                                step="0.1"
                                id="widthCm"
                                className={`form-input ${errors.widthCm ? 'form-input-error' : ''}`}
                                placeholder="80"
                            />
                            {errors.widthCm && (
                                <span className="form-error">
                                    <AlertCircle size={16} />
                                    {errors.widthCm.message}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="heightCm" className="form-label">
                                Височина (см) *
                            </label>
                            <input
                                {...register('heightCm', { valueAsNumber: true })}
                                type="number"
                                step="0.1"
                                id="heightCm"
                                className={`form-input ${errors.heightCm ? 'form-input-error' : ''}`}
                                placeholder="60"
                            />
                            {errors.heightCm && (
                                <span className="form-error">
                                    <AlertCircle size={16} />
                                    {errors.heightCm.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="price" className="form-label">
                            Цена (лв) *
                        </label>
                        <input
                            {...register('price', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            id="price"
                            className={`form-input ${errors.price ? 'form-input-error' : ''}`}
                            placeholder="0.00"
                        />
                        {errors.price && (
                            <span className="form-error">
                                <AlertCircle size={16} />
                                {errors.price.message}
                            </span>
                        )}
                    </div>

                    {/* Sale Toggle */}
                    <div className="form-group">
                        <div className="sale-toggle-container">
                            <label htmlFor="isOnSale" className="sale-toggle-label">
                                Намаление
                            </label>
                            <div className="sale-toggle-wrapper">
                                <input
                                    type="checkbox"
                                    id="isOnSale"
                                    checked={isOnSale}
                                    onChange={(e) => {
                                        setIsOnSale(e.target.checked);
                                        if (!e.target.checked) {
                                            setSalePercentage(0);
                                        }
                                    }}
                                    className="sale-toggle-input"
                                />
                                <label htmlFor="isOnSale" className="sale-toggle-slider">
                                    <span className="sale-toggle-slider-button"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Sale Percentage */}
                    {isOnSale && (
                        <div className="form-group">
                            <label htmlFor="salePercentage" className="form-label">
                                Процент намаление (1-100%)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                onChange={(e) => setSalePercentage(Number(e.target.value))}
                                id="salePercentage"
                                className="form-input"
                                placeholder="0"
                            />
                        </div>
                    )}

                    {/* Price Preview */}
                    {isOnSale && salePercentage > 0 && (
                        <div className="price-preview">
                            <div className="price-preview-item">
                                <span className="price-label">Оригинална цена:</span>
                                <span className="price-value original">
                                    {Math.round(calculateOriginalPrice(watch('price') || 0, salePercentage))} лв
                                </span>
                            </div>
                            <div className="price-preview-item">
                                <span className="price-label">Намалена цена:</span>
                                <span className="price-value sale">
                                    {Math.round(watch('price') || 0)} лв
                                </span>
                            </div>
                            <div className="price-preview-note">
                                * Потребителите ще видят намалената цена като промоция
                            </div>
                        </div>
                    )}

                </div>

                {/* Classification */}
                <div className="form-section">
                    <h3 className="section-title">Класификация</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <CustomDropdown
                                value={watch('technique') || ''}
                                onChange={(value) => setValue('technique', value)}
                                options={techniqueOptions}
                                label="Техника *"
                                className={errors.technique ? 'form-input-error' : ''}
                                aria-label="Изберете техника"
                            />
                            {errors.technique && (
                                <span className="form-error">
                                    <AlertCircle size={16} />
                                    {errors.technique.message}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <CustomDropdown
                                value={watch('subject') || ''}
                                onChange={(value) => setValue('subject', value)}
                                options={subjectOptions}
                                label="Тема *"
                                className={errors.subject ? 'form-input-error' : ''}
                                aria-label="Изберете тема"
                            />
                            {errors.subject && (
                                <span className="form-error">
                                    <AlertCircle size={16} />
                                    {errors.subject.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <CustomDropdown
                                value={watch('style') || ''}
                                onChange={(value) => setValue('style', value)}
                                options={styleOptions}
                                label="Стил *"
                                className={errors.style ? 'form-input-error' : ''}
                                aria-label="Изберете стил"
                            />
                            {errors.style && (
                                <span className="form-error">
                                    <AlertCircle size={16} />
                                    {errors.style.message}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="materials" className="form-label">
                                Материали
                            </label>
                            <input
                                {...register('materials')}
                                type="text"
                                id="materials"
                                className={`form-input ${errors.materials ? 'form-input-error' : ''}`}
                                placeholder="напр. Маслени бои върху платно"
                            />
                            {errors.materials && (
                                <span className="form-error">
                                    <AlertCircle size={16} />
                                    {errors.materials.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Тагове * (минимум 1, максимум 10)
                        </label>

                        {/* Custom Tag Input */}
                        <div className="custom-tag-input-container">
                            <div className="custom-tag-input-wrapper">
                                <input
                                    type="text"
                                    value={customTagInput}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setCustomTagInput(value);

                                        // Clear error when user starts typing valid characters
                                        if (tagError && isValidTagInput(value)) {
                                            setTagError(null);
                                        }
                                    }}
                                    placeholder="Добави нов таг..."
                                    className="custom-tag-input"
                                    maxLength={50}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addCustomTag();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={addCustomTag}
                                    disabled={isAddingTag || !customTagInput.trim() || !isValidTagInput(customTagInput)}
                                    className="add-tag-button"
                                >
                                    {isAddingTag ? (
                                        <div className="loading-spinner-small" />
                                    ) : (
                                        <Plus size={16} />
                                    )}
                                </button>
                            </div>

                            {/* Character validation message */}
                            <div className="tag-validation-info">
                                <span className="validation-text">
                                    Разрешени символи: букви (a-z, A-Z, а-я, А-Я), цифри (0-9), символ # и интервали
                                </span>
                            </div>

                            {tagError && (
                                <span className="form-error">
                                    <AlertCircle size={16} />
                                    {tagError}
                                </span>
                            )}
                        </div>

                        {/* Available Tags */}
                        <div className="tags-section">
                            <h3 className="tags-section-title">Последно използвани тагове</h3>
                            <div className="tags-container">
                                {isLoadingTags ? (
                                    <div className="loading-tags">
                                        <div className="loading-spinner-small" />
                                        <span>Зареждане на тагове...</span>
                                    </div>
                                ) : (
                                    (showMoreTags ? availableTags : availableTags.slice(0, 10)).map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            className={`tag-button ${watchedTags?.includes(tag) ? 'tag-selected' : ''}`}
                                        >
                                            {tag}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {availableTags.length > 10 && (
                            <button
                                type="button"
                                onClick={() => setShowMoreTags(!showMoreTags)}
                                className="show-more-tags-button"
                            >
                                <ChevronDown
                                    size={16}
                                    className={`chevron-icon ${showMoreTags ? 'rotate-180' : ''}`}
                                />
                                {showMoreTags ? 'Покажи по-малко' : `Покажи още ${availableTags.length - 10} тага`}
                            </button>
                        )}

                        {errors.tags && (
                            <span className="form-error">
                                <AlertCircle size={16} />
                                {errors.tags.message}
                            </span>
                        )}
                    </div>
                </div>

                {/* Image Upload */}
                <div className="form-section">
                    <h3 className="section-title">Изображения</h3>

                    <div className="upload-area">
                        <input
                            type="file"
                            id="images"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        <label htmlFor="images" className="upload-label">
                            <Upload size={24} />
                            <span>Изберете изображения (2-5 файла)</span>
                            <small>JPG, PNG, WEBP, GIF до 5MB всеки</small>
                        </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                        <div className="uploaded-files">
                            {uploadedFiles.map(file => (
                                <div key={file.id} className="uploaded-file">
                                    <Image
                                        src={file.preview}
                                        alt="Preview"
                                        className="file-preview"
                                        width={120}
                                        height={120}
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(file.id)}
                                        className="remove-file-button"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Progress */}
                {isUploading && (
                    <div className="upload-progress">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <span className="progress-text">
                            Качване... {Math.round(uploadProgress)}%
                        </span>
                    </div>
                )}

                {/* Messages */}
                {error && (
                    <div className="message message-error">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="message message-success">
                        <CheckCircle size={20} />
                        Картината е успешно добавена!
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || isUploading || !areRequiredFieldsFilled()}
                    onClick={handleButtonClick}
                    className="submit-button"
                >
                    {isSubmitting || isUploading ? 'Добавяне...' : 'Добави картина'}
                </button>
            </form>
        </div>
    );
}
