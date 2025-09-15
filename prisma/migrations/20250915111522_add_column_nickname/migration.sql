-- DropIndex
DROP INDEX "professionals_id_idx";

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "username" VARCHAR(40);

-- CreateIndex
CREATE INDEX "professionals_id_username_idx" ON "professionals"("id", "username");
