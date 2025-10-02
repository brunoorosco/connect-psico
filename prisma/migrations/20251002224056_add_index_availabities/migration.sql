-- DropIndex
DROP INDEX "availabilities_professional_id_idx";

-- CreateIndex
CREATE INDEX "availabilities_id_professional_id_idx" ON "availabilities"("id", "professional_id");
