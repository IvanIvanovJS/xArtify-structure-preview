/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Painting` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `ArtistProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ArtistProfile" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Painting" DROP COLUMN "imageUrl",
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "materials" TEXT;
