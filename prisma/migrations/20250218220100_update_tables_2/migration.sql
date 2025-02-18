/*
  Warnings:

  - You are about to drop the column `num_conselho ` on the `professionals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "num_conselho ",
ADD COLUMN     "num_conselho" VARCHAR(8);
