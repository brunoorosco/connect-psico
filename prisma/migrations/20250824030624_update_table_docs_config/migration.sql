/*
  Warnings:

  - You are about to drop the `CertificateConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CertificateConfig" DROP CONSTRAINT "CertificateConfig_user_id_fkey";

-- DropTable
DROP TABLE "CertificateConfig";

-- CreateTable
CREATE TABLE "certificate_config" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificate_config_user_id_name_key" ON "certificate_config"("user_id", "name");

-- AddForeignKey
ALTER TABLE "certificate_config" ADD CONSTRAINT "certificate_config_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
