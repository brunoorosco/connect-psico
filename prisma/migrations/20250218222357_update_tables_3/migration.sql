/*
  Warnings:

  - You are about to drop the column `author` on the `comentarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `professionals` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "comentarios" DROP COLUMN "author";

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "education" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "professionals_userId_key" ON "professionals"("userId");
