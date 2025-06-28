/*
  Warnings:

  - You are about to drop the `prontuarios` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `prontuario_id` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "prontuarios" DROP CONSTRAINT "prontuarios_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "prontuarios" DROP CONSTRAINT "prontuarios_professional_id_fkey";

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "emergency_contact" TEXT,
ADD COLUMN     "prontuario_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "prontuarios";

-- CreateTable
CREATE TABLE "note_patients" (
    "id" SERIAL NOT NULL,
    "patitent_id" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_patients_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "note_patients" ADD CONSTRAINT "note_patients_patitent_id_fkey" FOREIGN KEY ("patitent_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
