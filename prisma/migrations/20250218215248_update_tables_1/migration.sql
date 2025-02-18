/*
  Warnings:

  - You are about to alter the column `num_conselho ` on the `professionals` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.
  - You are about to alter the column `uf_conselho` on the `professionals` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2)`.

*/
-- AlterTable
ALTER TABLE "professionals" ALTER COLUMN "num_conselho " DROP NOT NULL,
ALTER COLUMN "num_conselho " SET DATA TYPE VARCHAR(8),
ALTER COLUMN "publico_alvo" DROP NOT NULL,
ALTER COLUMN "uf_conselho" SET DATA TYPE VARCHAR(2);
