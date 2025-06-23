/*
  Warnings:

  - You are about to drop the column `isNewProfile` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "isNewProfile";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isNewProfile" BOOLEAN NOT NULL DEFAULT false;
