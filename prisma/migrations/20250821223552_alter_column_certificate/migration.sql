/*
  Warnings:

  - The primary key for the `CertificateConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `CertificateConfig` table. All the data in the column will be lost.
  - The `id` column on the `CertificateConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[user_id]` on the table `CertificateConfig` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `CertificateConfig` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CertificateConfig" DROP CONSTRAINT "CertificateConfig_userId_fkey";

-- DropIndex
DROP INDEX "CertificateConfig_userId_key";

-- AlterTable
ALTER TABLE "CertificateConfig" DROP CONSTRAINT "CertificateConfig_pkey",
DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "CertificateConfig_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateConfig_user_id_key" ON "CertificateConfig"("user_id");

-- AddForeignKey
ALTER TABLE "CertificateConfig" ADD CONSTRAINT "CertificateConfig_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
