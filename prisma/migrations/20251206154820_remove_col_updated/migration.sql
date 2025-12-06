/*
  Warnings:

  - You are about to drop the column `updated_at` on the `ResetPasswordToken` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `VerificationToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ResetPasswordToken" DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "VerificationToken" DROP COLUMN "updated_at";
