// lib/validators/artist.ts
import 'server-only';
import { z } from "zod";

// ---------- Artist Dashboard ----------

export const DashboardStatsSchema = z.object({
    period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
}).strict();

// ---------- Artist Artworks ----------

export const CreateArtworkSchema = z.object({
    title: z.string().trim().min(1, "Заглавието е задължително.").max(140, "Заглавието е твърде дълго."),
    description: z.string().trim().max(2000, "Описанието е твърде дълго.").optional(),
    dimensions: z.string().trim().max(50, "Размерите са твърде дълги.").optional(),
    materials: z.string().trim().max(200, "Материалите са твърде дълги.").optional(),
    images: z.array(z.string().url("Невалиден URL на изображение.")).min(1, "Поне едно изображение е задължително.").max(10, "Максимум 10 изображения."),
    price: z.number().positive("Цената трябва да е положителна.").max(100000, "Цената е твърде висока."),
    widthCm: z.number().positive("Ширината трябва да е положителна.").max(10000, "Ширината е твърде голяма."),
    heightCm: z.number().positive("Височината трябва да е положителна.").max(10000, "Височината е твърде голяма."),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Невалиден slug формат.").min(2).max(120).optional(),
    technique: z.string().trim().max(50, "Техниката е твърде дълга.").optional(),
    subject: z.string().trim().max(50, "Темата е твърде дълга.").optional(),
    style: z.string().trim().max(50, "Стилът е твърде дълъг.").optional(),
    tags: z.array(z.string().trim().max(30, "Тагът е твърде дълъг.")).max(10, "Максимум 10 тага.").default([]),
    isOnSale: z.boolean().default(false),
    salePercentage: z.number().min(1).max(100, "Отстъпката е твърде голяма.").optional(),
    finalPrice: z.number().positive("Крайната цена трябва да е положителна.").optional(),
    originalPrice: z.number().positive("Оригиналната цена трябва да е положителна.").optional(),
    status: z.enum(['draft', 'published']).default('published'),
}).strict();

export const UpdateArtworkSchema = CreateArtworkSchema.partial().extend({
    id: z.string().cuid("Невалиден ID на картина."),
}).strict();

export const ReorderArtworksSchema = z.object({
    artworks: z.array(z.object({
        id: z.string().cuid("Невалиден ID на картина."),
        index: z.number().int().min(0, "Индексът трябва да е положителен."),
    })).min(1, "Поне една картина е задължителна."),
}).strict();

export const ArtworkFiltersSchema = z.object({
    status: z.enum(['all', 'draft', 'published']).default('all'),
    technique: z.string().optional(),
    subject: z.string().optional(),
    style: z.string().optional(),
    isOnSale: z.boolean().optional(),
    search: z.string().trim().max(100, "Търсенето е твърде дълго.").optional(),
    page: z.number().int().min(1, "Страницата трябва да е положителна.").default(1),
    limit: z.number().int().min(1).max(50, "Лимитът е твърде голям.").default(20),
}).strict();

// ---------- Artist Courses ----------

export const CreateCourseSchema = z.object({
    title: z.string().trim().min(1, "Заглавието е задължително.").max(140, "Заглавието е твърде дълго."),
    description: z.string().trim().max(2000, "Описанието е твърде дълго.").optional(),
    price: z.number().positive("Цената трябва да е положителна.").max(10000, "Цената е твърде висока."),
    videoUrls: z.array(z.string().url("Невалиден URL на видео.")).min(1, "Поне едно видео е задължително.").max(20, "Максимум 20 видеа."),
    thumbnailUrl: z.string().url("Невалиден URL на thumbnail.").optional(),
}).strict();

export const UpdateCourseSchema = CreateCourseSchema.partial().extend({
    id: z.string().cuid("Невалиден ID на курс."),
}).strict();

export const CourseFiltersSchema = z.object({
    search: z.string().trim().max(100, "Търсенето е твърде дълго.").optional(),
    page: z.number().int().min(1, "Страницата трябва да е положителна.").default(1),
    limit: z.number().int().min(1).max(50, "Лимитът е твърде голям.").default(20),
}).strict();

// ---------- Artist Analytics ----------

export const AnalyticsRangeSchema = z.object({
    startDate: z.string().datetime("Невалидна начална дата.").optional(),
    endDate: z.string().datetime("Невалидна крайна дата.").optional(),
    period: z.enum(['7d', '30d', '90d', '1y', 'custom']).default('30d'),
}).strict();

export const TrackViewSchema = z.object({
    type: z.enum(['painting', 'profile'], "Невалиден тип на преглед."),
    id: z.string().cuid("Невалиден ID."),
}).strict();

// ---------- Artist Settings ----------

export const UpdateArtistSettingsSchema = z.object({
    bio: z.string().trim().max(2000, "Биографията е твърде дълга.").optional(),
    phoneNumber: z.string().trim().max(20, "Телефонният номер е твърде дълъг.").optional(),
    birthDate: z.string().datetime("Невалидна дата на раждане.").optional(),
    showBirthDate: z.boolean().default(false),
    country: z.string().trim().max(50, "Държавата е твърде дълга.").optional(),
    city: z.string().trim().max(50, "Градът е твърде дълъг.").optional(),
    emailNotifications: z.boolean().default(true),
    messageNotifications: z.boolean().default(true),
    salesNotifications: z.boolean().default(true),
    isTwoFactorEnabled: z.boolean().default(false),
}).strict();

export const CreateArtistFAQSchema = z.object({
    question: z.string().trim().min(1, "Въпросът е задължителен.").max(500, "Въпросът е твърде дълъг."),
    answer: z.string().trim().min(1, "Отговорът е задължителен.").max(2000, "Отговорът е твърде дълъг."),
}).strict();

export const UpdateArtistFAQSchema = CreateArtistFAQSchema.extend({
    id: z.string().cuid("Невалиден ID на FAQ."),
}).strict();

// ---------- Artist Messages ----------

export const SendMessageSchema = z.object({
    artistId: z.string().cuid("Невалиден ID на артист."),
    content: z.string().trim().min(1, "Съобщението е задължително.").max(2000, "Съобщението е твърде дълго."),
}).strict();

export const MessageFiltersSchema = z.object({
    page: z.number().int().min(1, "Страницата трябва да е положителна.").default(1),
    limit: z.number().int().min(1).max(50, "Лимитът е твърде голям.").default(20),
}).strict();

export const MarkMessagesReadSchema = z.object({
    conversationId: z.string().cuid("Невалиден ID на разговор."),
}).strict();

