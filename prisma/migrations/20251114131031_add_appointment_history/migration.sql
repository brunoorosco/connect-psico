-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "appointment_histories" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "previousDate" TIMESTAMP(3),
    "newDate" TIMESTAMP(3),
    "reason" TEXT,
    "performedBy" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointment_histories_appointmentId_idx" ON "appointment_histories"("appointmentId");

-- CreateIndex
CREATE INDEX "appointment_histories_performedBy_idx" ON "appointment_histories"("performedBy");

-- AddForeignKey
ALTER TABLE "appointment_histories" ADD CONSTRAINT "appointment_histories_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_histories" ADD CONSTRAINT "appointment_histories_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
