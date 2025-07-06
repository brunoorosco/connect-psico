/*
  Warnings:

  - Added the required column `prescription` to the `note_patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `professional_id` to the `note_patients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "note_patients" ADD COLUMN     "prescription" TEXT NOT NULL,
ADD COLUMN     "professional_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "note_patients" ADD CONSTRAINT "note_patients_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
