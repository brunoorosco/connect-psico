-- DropIndex
DROP INDEX "users_id_idx";

-- CreateTable
CREATE TABLE "patient_professional" (
    "id" SERIAL NOT NULL,
    "patitent_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_professional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_professional_patitent_id_professional_id_idx" ON "patient_professional"("patitent_id", "professional_id");

-- CreateIndex
CREATE INDEX "users_id_email_idx" ON "users"("id", "email");

-- AddForeignKey
ALTER TABLE "patient_professional" ADD CONSTRAINT "patient_professional_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_professional" ADD CONSTRAINT "patient_professional_patitent_id_fkey" FOREIGN KEY ("patitent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
