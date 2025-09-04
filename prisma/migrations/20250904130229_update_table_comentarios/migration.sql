/*
  Warnings:

  - You are about to drop the column `content` on the `comentarios` table. All the data in the column will be lost.
  - Added the required column `appointment_id` to the `comentarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `comment` to the `comentarios` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rating` on the `comentarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "comentarios" DROP CONSTRAINT "comentarios_professionalId_fkey";

-- AlterTable
ALTER TABLE "comentarios" DROP COLUMN "content",
ADD COLUMN     "appointment_id" INTEGER NOT NULL,
ADD COLUMN     "comment" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "rating",
ADD COLUMN     "rating" INTEGER NOT NULL,
ALTER COLUMN "professionalId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
