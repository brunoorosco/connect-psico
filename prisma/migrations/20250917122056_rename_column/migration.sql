/*
  Warnings:

  - You are about to drop the column `municipio` on the `professionals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "municipio",
ADD COLUMN     "bairro" VARCHAR(25);
