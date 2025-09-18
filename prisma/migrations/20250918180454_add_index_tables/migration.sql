-- DropIndex
DROP INDEX "professionals_id_username_idx";

-- CreateIndex
CREATE INDEX "appointments_professional_id_patient_id_status_idx" ON "appointments"("professional_id", "patient_id", "status");

-- CreateIndex
CREATE INDEX "availabilities_professional_id_idx" ON "availabilities"("professional_id");

-- CreateIndex
CREATE INDEX "patients_patient_id_idx" ON "patients"("patient_id");

-- CreateIndex
CREATE INDEX "professionals_id_username_userId_idx" ON "professionals"("id", "username", "userId");
