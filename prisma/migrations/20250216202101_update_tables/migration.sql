/*
  Warnings:

  - The values [STUDENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `crp` on the `professionals` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `professionals` table. All the data in the column will be lost.
  - You are about to drop the column `publicoAlvo` on the `professionals` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Org` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bio` to the `professionals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_conselho ` to the `professionals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publico_alvo` to the `professionals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uf_conselho` to the `professionals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor_atendimento` to the `professionals` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('DEFAULT', 'ADMIN', 'SUPERVISOR');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'DEFAULT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_user_id_fkey";

-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "crp",
DROP COLUMN "estado",
DROP COLUMN "publicoAlvo",
ADD COLUMN     "bio" TEXT NOT NULL,
ADD COLUMN     "num_conselho " TEXT NOT NULL,
ADD COLUMN     "publico_alvo" TEXT NOT NULL,
ADD COLUMN     "uf_conselho" TEXT NOT NULL,
ADD COLUMN     "valor_atendimento" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Org";
