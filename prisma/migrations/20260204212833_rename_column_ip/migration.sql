/*
  Warnings:

  - You are about to drop the column `ip` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "ip",
ADD COLUMN     "ip_address" VARCHAR(15);
