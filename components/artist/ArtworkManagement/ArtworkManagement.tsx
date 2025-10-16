// components/artist/ArtworkManagement/ArtworkManagement.tsx
"use client";

import { useState, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import Image from "next/image";

import CustomDropdown from "@/components/ui/CustomDropdown";
import "./styles/artwork-management.css";

interface Artwork {
    id: string;
    title: string;
    urlTitle: string;
    description: string | null;
    images: string[];
    price: number;
    isSold: boolean;
    status: string;
    technique: string | null;
    subject: string | null;
    style: string | null;
    tags: string[];
    isOnSale: boolean;
    salePercentage: number | null;
    finalPrice: number | null;
    originalPrice: number | null;
    createdAt: string;
    updatedAt: string;
}

interface ArtworkFilters {
    search: string;
    status: string;
    technique: string;
    subject: string;
    style: string;
    isOnSale: string;
    sortBy: string;
    sortOrder: string;
}

interface FilterOptions {
    techniques: string[];
    subjects: string[];
    styles: string[];
    statuses: string[];
    hasOnSale: boolean;
    hasNotOnSale: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ArtworkManagement(): JSX.Element {
    const [filters, setFilters] = useState<ArtworkFilters>({
        search: "",
        status: "",
        technique: "",
        subject: "",
        style: "",
        isOnSale: "",
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);

    const { data, error, isLoading, mutate } = useSWR<{
        artworks: Artwork[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>(`/api/artist/artworks?${new URLSearchParams(filters as unknown as string)}`, fetcher);

    const { data: filterOptions } = useSWR<FilterOptions>('/api/artist/artworks/filter-options', fetcher);

    // Dynamic filter options based on existing artworks
    const statusOptions = [
        { value: "", label: "Всички статуси" },
        ...(filterOptions?.statuses || []).map(status => ({
            value: status,
            label: status === "draft" ? "Чернови" :
                status === "published" ? "Публикувани" :
                    status === "sold" ? "Продадени" :
                        status === "archived" ? "Архивирани" : status
        }))
    ];

    const techniqueOptions = [
        { value: "", label: "Всички техники" },
        ...(filterOptions?.techniques || []).map(technique => ({
            value: technique,
            label: technique === "OIL" ? "Маслени бои" :
                technique === "ACRYLIC" ? "Акрил" :
                    technique === "WATERCOLOR" ? "Акварел" :
                        technique === "DIGITAL" ? "Дигитално" :
                            technique === "MIXED" ? "Смесена техника" : technique
        }))
    ];

    const subjectOptions = [
        { value: "", label: "Всички теми" },
        ...(filterOptions?.subjects || []).map(subject => ({
            value: subject,
            label: subject === "PORTRAIT" ? "Портрет" :
                subject === "LANDSCAPE" ? "Пейзаж" :
                    subject === "ABSTRACT" ? "Абстрактно" :
                        subject === "STILL_LIFE" ? "Натюрморт" :
                            subject === "ANIMAL" ? "Животни" : subject
        }))
    ];

    const styleOptions = [
        { value: "", label: "Всички стилове" },
        ...(filterOptions?.styles || []).map(style => ({
            value: style,
            label: style === "REALISTIC" ? "Реалистичен" :
                style === "IMPRESSIONIST" ? "Импресионистичен" :
                    style === "EXPRESSIONIST" ? "Експресионистичен" :
                        style === "MODERN" ? "Модерен" :
                            style === "CONTEMPORARY" ? "Съвременен" : style
        }))
    ];

    const saleOptions = [
        { value: "", label: "Всички картини" },
        ...(filterOptions?.hasOnSale ? [{ value: "true", label: "На промоция" }] : []),
        ...(filterOptions?.hasNotOnSale ? [{ value: "false", label: "Обикновени цени" }] : [])
    ];

    const sortOptions = [
        { value: "createdAt", label: "Дата на създаване" },
        { value: "updatedAt", label: "Последна промяна" },
        { value: "title", label: "Заглавие" },
        { value: "price", label: "Цена" },
    ];

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("bg-BG", {
            style: "currency",
            currency: "BGN",
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString("bg-BG");
    };

    const handleFilterChange = (key: keyof ArtworkFilters, value: string): void => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSelectArtwork = (artworkId: string): void => {
        setSelectedArtworks(prev =>
            prev.includes(artworkId)
                ? prev.filter(id => id !== artworkId)
                : [...prev, artworkId]
        );
    };

    const handleSelectAll = (): void => {
        if (data?.artworks) {
            setSelectedArtworks(
                selectedArtworks.length === data.artworks.length
                    ? []
                    : data.artworks.map(artwork => artwork.id)
            );
        }
    };

    const handleDeleteClick = (artwork: Artwork): void => {
        setArtworkToDelete(artwork);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!artworkToDelete) return;

        try {
            const response = await fetch(`/api/artist/artworks/${artworkToDelete.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                mutate();
                setShowDeleteModal(false);
                setArtworkToDelete(null);
            }
        } catch (error) {
            console.error("Error deleting artwork:", error);
        }
    };

    const getStatusBadge = (status: string): JSX.Element => {
        const statusConfig = {
            draft: { label: "Чернови", className: "status-draft" },
            published: { label: "Публикувани", className: "status-published" },
            sold: { label: "Продадени", className: "status-sold" },
            archived: { label: "Архивирани", className: "status-archived" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

        return (
            <span className={`status-badge ${config.className}`}>
                {config.label}
            </span>
        );
    };

    if (error) {
        return (
            <div className="artwork-management-error">
                <h2>Грешка при зареждане на картините</h2>
                <p>Моля, опитайте отново по-късно.</p>
            </div>
        );
    }

    return (
        <div className="artwork-management">
            <div className="artwork-management-header">
                <h1 className="artwork-management-title">Управление на картини</h1>
                <div className="artwork-management-actions">
                    <button className="artwork-add-button">
                        + Добави картина
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="artwork-filters">
                <div className="artwork-filters-row">
                    <div className="artwork-filter-group">
                        <input
                            type="text"
                            placeholder="Търси картини..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            className="artwork-search-input"
                        />
                    </div>

                    <div className="artwork-filter-group">
                        <CustomDropdown
                            options={statusOptions}
                            value={filters.status}
                            onChange={(value) => handleFilterChange("status", value)}
                            aria-label="Филтър по статус"
                        />
                    </div>

                    <div className="artwork-filter-group">
                        <CustomDropdown
                            options={techniqueOptions}
                            value={filters.technique}
                            onChange={(value) => handleFilterChange("technique", value)}
                            aria-label="Филтър по техника"
                        />
                    </div>

                    <div className="artwork-filter-group">
                        <CustomDropdown
                            options={subjectOptions}
                            value={filters.subject}
                            onChange={(value) => handleFilterChange("subject", value)}
                            aria-label="Филтър по тема"
                        />
                    </div>

                    <div className="artwork-filter-group">
                        <CustomDropdown
                            options={styleOptions}
                            value={filters.style}
                            onChange={(value) => handleFilterChange("style", value)}
                            aria-label="Филтър по стил"
                        />
                    </div>

                    <div className="artwork-filter-group">
                        <CustomDropdown
                            options={saleOptions}
                            value={filters.isOnSale}
                            onChange={(value) => handleFilterChange("isOnSale", value)}
                            aria-label="Филтър по промоция"
                        />
                    </div>

                    <div className="artwork-filter-group">
                        <CustomDropdown
                            options={sortOptions}
                            value={filters.sortBy}
                            onChange={(value) => handleFilterChange("sortBy", value)}
                            aria-label="Сортиране"
                        />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="artwork-toolbar">
                <div className="artwork-toolbar-left">
                    <div className="artwork-view-controls">
                        <button
                            className={`view-button ${viewMode === "grid" ? "active" : ""}`}
                            onClick={() => setViewMode("grid")}
                            aria-label="Grid view"
                        >
                            ⊞
                        </button>
                        <button
                            className={`view-button ${viewMode === "list" ? "active" : ""}`}
                            onClick={() => setViewMode("list")}
                            aria-label="List view"
                        >
                            ☰
                        </button>
                    </div>

                    {data?.artworks && data.artworks.length > 0 && (
                        <div className="artwork-selection">
                            <label className="artwork-select-all">
                                <input
                                    type="checkbox"
                                    checked={selectedArtworks.length === data.artworks.length}
                                    onChange={handleSelectAll}
                                />
                                Избери всички
                            </label>
                            {selectedArtworks.length > 0 && (
                                <span className="artwork-selected-count">
                                    {selectedArtworks.length} избрани
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="artwork-toolbar-right">
                    {data && (
                        <p className="artwork-count">
                            {data.total} картини
                        </p>
                    )}
                </div>
            </div>

            {/* Artworks List */}
            {isLoading ? (
                <div className="artwork-loading">
                    <div className="artwork-spinner"></div>
                    <p>Зареждане на картините...</p>
                </div>
            ) : data?.artworks && data.artworks.length > 0 ? (
                <div className={`artwork-list ${viewMode}`}>
                    {data.artworks.map((artwork) => (
                        <motion.div
                            key={artwork.id}
                            className="artwork-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="artwork-item-header">
                                <label className="artwork-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedArtworks.includes(artwork.id)}
                                        onChange={() => handleSelectArtwork(artwork.id)}
                                    />
                                </label>
                                {getStatusBadge(artwork.status)}
                            </div>

                            <div className="artwork-image-container">
                                {artwork.images[0] && (
                                    <Image
                                        src={artwork.images[0]}
                                        alt={artwork.title}
                                        width={300}
                                        height={200}
                                        className="artwork-image"
                                    />
                                )}
                                {artwork.isOnSale && (
                                    <div className="artwork-sale-badge">
                                        -{artwork.salePercentage}%
                                    </div>
                                )}
                            </div>

                            <div className="artwork-details">
                                <h3 className="artwork-title">{artwork.title}</h3>
                                <p className="artwork-price">
                                    {artwork.isOnSale && artwork.finalPrice ? (
                                        <>
                                            <span className="artwork-final-price">
                                                {formatCurrency(artwork.finalPrice)}
                                            </span>
                                            <span className="artwork-original-price">
                                                {formatCurrency(artwork.originalPrice || artwork.price)}
                                            </span>
                                        </>
                                    ) : (
                                        formatCurrency(artwork.price)
                                    )}
                                </p>
                                <p className="artwork-date">
                                    Създадена: {formatDate(artwork.createdAt)}
                                </p>
                                {artwork.tags.length > 0 && (
                                    <div className="artwork-tags">
                                        {artwork.tags.slice(0, 3).map((tag) => (
                                            <span key={tag} className="artwork-tag">
                                                {tag}
                                            </span>
                                        ))}
                                        {artwork.tags.length > 3 && (
                                            <span className="artwork-tag-more">
                                                +{artwork.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="artwork-actions">
                                <button className="artwork-action-button">
                                    Редактирай
                                </button>
                                <button
                                    className="artwork-action-button danger"
                                    onClick={() => handleDeleteClick(artwork)}
                                >
                                    Изтрий
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="artwork-empty">
                    <h3>Няма картини</h3>
                    <p>Започнете като добавите първата си картина.</p>
                    <button className="artwork-add-button">
                        + Добави картина
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && artworkToDelete && (
                    <motion.div
                        className="artwork-delete-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            className="artwork-delete-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Потвърди изтриване</h3>
                            <p>
                                Сигурни ли сте, че искате да изтриете картината {artworkToDelete.title}?
                                Това действие не може да бъде отменено.
                            </p>
                            <div className="artwork-delete-modal-actions">
                                <button
                                    className="artwork-delete-cancel"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Отказ
                                </button>
                                <button
                                    className="artwork-delete-confirm"
                                    onClick={handleDeleteConfirm}
                                >
                                    Изтрий
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
