/*
  Warnings:

  - The `publico_alvo` column on the `professionals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `professionals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'CONCLUDED';

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "(titulo_academico)" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tempo_consulta" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "publico_alvo",
ADD COLUMN     "publico_alvo" TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "index" SERIAL NOT NULL;

-- CreateTable
CREATE TABLE "prontuarios" (
    "id" TEXT NOT NULL,
    "index" SERIAL NOT NULL,
    "professional_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prontuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prontuarios_id_idx" ON "prontuarios"("id");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "users"("id");

-- AddForeignKey
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
