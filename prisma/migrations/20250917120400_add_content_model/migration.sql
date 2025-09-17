/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Painting` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Painting" ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "style" TEXT,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "technique" TEXT,
ADD COLUMN     "widthCm" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."Content" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "image1Url" TEXT,
    "image2Url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Content_key_key" ON "public"."Content"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Painting_slug_key" ON "public"."Painting"("slug");

-- CreateIndex
CREATE INDEX "Painting_technique_idx" ON "public"."Painting"("technique");

-- CreateIndex
CREATE INDEX "Painting_subject_idx" ON "public"."Painting"("subject");

-- CreateIndex
CREATE INDEX "Painting_style_idx" ON "public"."Painting"("style");

-- CreateIndex
CREATE INDEX "Painting_price_idx" ON "public"."Painting"("price");

-- CreateIndex
CREATE INDEX "Painting_createdAt_idx" ON "public"."Painting"("createdAt");

-- CreateIndex
CREATE INDEX "Painting_widthCm_heightCm_idx" ON "public"."Painting"("widthCm", "heightCm");
