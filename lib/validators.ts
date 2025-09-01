// src/lib/validators.ts
import 'server-only';
import { z } from "zod";

// ---------- Helpers ----------

// Safe string with trimming and basic control char strip
export const safeString = (min: number, max: number, field = "text") =>
  z.string()
    .trim()
    .min(min, `${field} е задължително.`)
    .max(max, `${field} е твърде дълго.`)
    .refine((v) => !/[\u0000-\u001F]/.test(v), `${field} съдържа забранени символи.`);

// Slug (optional) - lowercase, a-z0-9- only
export const slugSchema = z.string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Невалиден slug формат (a-z0-9 и тирета).")
  .min(2).max(120);

// ---------- Register ----------

export const RegisterSchema = z.object({
  name: safeString(1, 80, "Име"),
  email: z.string().trim().toLowerCase().email("Невалиден email."),
  password: z.string()
    .min(12, "Паролата трябва да е поне 12 символа.")
    .max(128, "Паролата е твърде дълга.")
    .refine((v) => /[a-z]/.test(v), "Паролата трябва да съдържа малка буква.")
    .refine((v) => /[A-Z]/.test(v), "Паролата трябва да съдържа главна буква.")
    .refine((v) => /\d/.test(v), "Паролата трябва да съдържа цифра.")
    .refine((v) => /[^\w\s]/.test(v), "Паролата трябва да съдържа специален символ."),
  termsAccepted: z.boolean().refine(Boolean, "Трябва да приемете общите условия."),
  marketingConsent: z.boolean().optional().default(false),
}).strict();

// ---------- Paintings ----------

const nowYear = new Date().getFullYear();

export const ImageSchema = z.object({
  url: z.string().url("Невалиден URL на изображение."),
  alt: z.string().trim().max(120).optional(),
}).strict();

export const DimensionsSchema = z.object({
  width: z.number().positive().max(10000),   // cm/in
  height: z.number().positive().max(10000),
  unit: z.enum(["cm", "in"]),
}).strict();

export const PaintingBase = z.object({
  title: safeString(1, 140, "Заглавие"),
  description: z.string().trim().max(2000).optional().default(""),
  // Използваме minor units за цена (cents/stotinki) за точност
  priceCents: z.number().int().nonnegative().max(1_000_000_00)
    .describe("Цена в стотинки/центове."),
  currency: z.enum(["BGN", "EUR", "USD", "GBP"]).default("BGN"),
  images: z.array(ImageSchema).min(1, "Минимум 1 изображение.").max(10, "Максимум 10 изображения."),
  dimensions: DimensionsSchema.optional(),
  year: z.number().int().min(1000).max(nowYear).optional(),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(24)).max(20).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  artistId: z.string().trim().min(1).max(64).optional(),
  slug: slugSchema.optional(),
}).strict();

export const PaintingCreateSchema = PaintingBase;

export const PaintingUpdateSchema = PaintingBase.partial().extend({
  // при PUT може да се подаде частично; id идва от пътя
}).strict();

// ---------- Params ----------

export const IdParamSchema = z.object({
  id: z.string().trim().min(1).max(64),
});
