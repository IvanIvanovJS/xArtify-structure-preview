// components/artist/CourseManagement/CourseManagement.tsx
"use client";

import { useState, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import Image from "next/image";

import CustomDropdown from "@/components/ui/CustomDropdown";
import "./styles/course-management.css";

interface Course {
    id: string;
    title: string;
    description: string | null;
    price: number;
    videoUrls: string[];
    thumbnailUrl: string | null;
    materials: Array<{
        id: string;
        name: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

interface CourseFilters {
    search: string;
    sortBy: string;
    sortOrder: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CourseManagement(): JSX.Element {
    const [filters, setFilters] = useState<CourseFilters>({
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

    const { data, error, isLoading, mutate } = useSWR<{
        courses: Course[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>(`/api/artist/courses?${new URLSearchParams(filters as unknown as string)}`, fetcher);

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

    const handleFilterChange = (key: keyof CourseFilters, value: string): void => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleCreateCourse = (): void => {
        setEditingCourse(null);
        setShowCreateForm(true);
    };

    const handleEditCourse = (course: Course): void => {
        setEditingCourse(course);
        setShowCreateForm(true);
    };

    const handleDeleteClick = (course: Course): void => {
        setCourseToDelete(course);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!courseToDelete) return;

        try {
            const response = await fetch(`/api/artist/courses/${courseToDelete.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                mutate();
                setShowDeleteModal(false);
                setCourseToDelete(null);
            }
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    };

    const handleFormSubmit = async (courseData: unknown): Promise<void> => {
        try {
            const url = editingCourse
                ? `/api/artist/courses/${editingCourse.id}`
                : "/api/artist/courses";

            const method = editingCourse ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseData),
            });

            if (response.ok) {
                mutate();
                setShowCreateForm(false);
                setEditingCourse(null);
            }
        } catch (error) {
            console.error("Error saving course:", error);
        }
    };

    if (error) {
        return (
            <div className="course-management-error">
                <h2>Грешка при зареждане на курсовете</h2>
                <p>Моля, опитайте отново по-късно.</p>
            </div>
        );
    }

    return (
        <div className="course-management">
            <div className="course-management-header">
                <h1 className="course-management-title">Управление на курсове</h1>
                <div className="course-management-actions">
                    <button
                        className="course-add-button"
                        onClick={handleCreateCourse}
                    >
                        + Добави курс
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="course-filters">
                <div className="course-filters-row">
                    <div className="course-filter-group">
                        <input
                            type="text"
                            placeholder="Търси курсове..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            className="course-search-input"
                        />
                    </div>

                    <div className="course-filter-group">
                        <CustomDropdown
                            options={sortOptions}
                            value={filters.sortBy}
                            onChange={(value) => handleFilterChange("sortBy", value)}
                            aria-label="Сортиране"
                        />
                    </div>
                </div>
            </div>

            {/* Courses List */}
            {isLoading ? (
                <div className="course-loading">
                    <div className="course-spinner"></div>
                    <p>Зареждане на курсовете...</p>
                </div>
            ) : data?.courses && data.courses.length > 0 ? (
                <div className="course-list">
                    {data.courses.map((course) => (
                        <motion.div
                            key={course.id}
                            className="course-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="course-thumbnail">
                                {course.thumbnailUrl ? (
                                    <Image
                                        src={course.thumbnailUrl}
                                        alt={course.title}
                                        width={200}
                                        height={120}
                                        className="course-thumbnail-image"
                                    />
                                ) : (
                                    <div className="course-thumbnail-placeholder">
                                        📚
                                    </div>
                                )}
                            </div>

                            <div className="course-details">
                                <h3 className="course-title">{course.title}</h3>
                                <p className="course-description">
                                    {course.description || "Няма описание"}
                                </p>
                                <div className="course-meta">
                                    <div className="course-price">
                                        {formatCurrency(course.price)}
                                    </div>
                                    <div className="course-videos">
                                        {course.videoUrls.length} видео{course.videoUrls.length !== 1 ? "а" : ""}
                                    </div>
                                    <div className="course-materials">
                                        {course.materials.length} материал{course.materials.length !== 1 ? "и" : ""}
                                    </div>
                                </div>
                                <div className="course-dates">
                                    <p>Създаден: {formatDate(course.createdAt)}</p>
                                    <p>Обновен: {formatDate(course.updatedAt)}</p>
                                </div>
                            </div>

                            <div className="course-actions">
                                <button
                                    className="course-action-button"
                                    onClick={() => handleEditCourse(course)}
                                >
                                    Редактирай
                                </button>
                                <button
                                    className="course-action-button danger"
                                    onClick={() => handleDeleteClick(course)}
                                >
                                    Изтрий
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="course-empty">
                    <h3>Няма курсове</h3>
                    <p>Започнете като добавите първия си курс.</p>
                    <button
                        className="course-add-button"
                        onClick={handleCreateCourse}
                    >
                        + Добави курс
                    </button>
                </div>
            )}

            {/* Create/Edit Course Form Modal */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        className="course-form-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateForm(false)}
                    >
                        <motion.div
                            className="course-form-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <CourseForm
                                course={editingCourse}
                                onSubmit={handleFormSubmit}
                                onCancel={() => setShowCreateForm(false)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && courseToDelete && (
                    <motion.div
                        className="course-delete-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            className="course-delete-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Потвърди изтриване</h3>
                            <p>
                                Сигурни ли сте, че искате да изтриете курса {courseToDelete.title}?
                                Това действие не може да бъде отменено.
                            </p>
                            <div className="course-delete-modal-actions">
                                <button
                                    className="course-delete-cancel"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Отказ
                                </button>
                                <button
                                    className="course-delete-confirm"
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

// Course Form Component
interface CourseFormProps {
    course: Course | null;
    onSubmit: (data: unknown) => Promise<void>;
    onCancel: () => void;
}

function CourseForm({ course, onSubmit, onCancel }: CourseFormProps): JSX.Element {
    const [formData, setFormData] = useState({
        title: course?.title || "",
        description: course?.description || "",
        price: course?.price || 0,
        videoUrls: course?.videoUrls || [""],
        thumbnailUrl: course?.thumbnailUrl || "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field: string, value: unknown): void => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleVideoUrlChange = (index: number, value: string): void => {
        const newVideoUrls = [...formData.videoUrls];
        newVideoUrls[index] = value;
        setFormData(prev => ({ ...prev, videoUrls: newVideoUrls }));
    };

    const addVideoUrl = (): void => {
        setFormData(prev => ({ ...prev, videoUrls: [...prev.videoUrls, ""] }));
    };

    const removeVideoUrl = (index: number): void => {
        if (formData.videoUrls.length > 1) {
            const newVideoUrls = formData.videoUrls.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, videoUrls: newVideoUrls }));
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const submitData = {
                ...formData,
                videoUrls: formData.videoUrls.filter(url => url.trim() !== ""),
            };
            await onSubmit(submitData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="course-form" onSubmit={handleSubmit}>
            <div className="course-form-header">
                <h3>{course ? "Редактирай курс" : "Създай нов курс"}</h3>
                <button
                    type="button"
                    className="course-form-close"
                    onClick={onCancel}
                    aria-label="Затвори"
                >
                    ✕
                </button>
            </div>

            <div className="course-form-content">
                <div className="course-form-group">
                    <label htmlFor="title">Заглавие *</label>
                    <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                        className="course-form-input"
                    />
                </div>

                <div className="course-form-group">
                    <label htmlFor="description">Описание</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={4}
                        className="course-form-textarea"
                    />
                </div>

                <div className="course-form-group">
                    <label htmlFor="price">Цена (BGN) *</label>
                    <input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                        required
                        className="course-form-input"
                    />
                </div>

                <div className="course-form-group">
                    <label htmlFor="thumbnailUrl">Thumbnail URL</label>
                    <input
                        id="thumbnailUrl"
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
                        className="course-form-input"
                    />
                </div>

                <div className="course-form-group">
                    <label>Видео URL адреси *</label>
                    {formData.videoUrls.map((url, index) => (
                        <div key={index} className="course-form-video-group">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                                placeholder="https://example.com/video"
                                className="course-form-input"
                            />
                            {formData.videoUrls.length > 1 && (
                                <button
                                    type="button"
                                    className="course-form-remove-video"
                                    onClick={() => removeVideoUrl(index)}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        className="course-form-add-video"
                        onClick={addVideoUrl}
                    >
                        + Добави видео
                    </button>
                </div>
            </div>

            <div className="course-form-actions">
                <button
                    type="button"
                    className="course-form-cancel"
                    onClick={onCancel}
                >
                    Отказ
                </button>
                <button
                    type="submit"
                    className="course-form-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Запазване..." : (course ? "Обнови" : "Създай")}
                </button>
            </div>
        </form>
    );
}
