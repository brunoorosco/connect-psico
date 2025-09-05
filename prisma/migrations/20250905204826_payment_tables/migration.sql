-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'CANCELED', 'FAILED');

-- CreateEnum
CREATE TYPE "RefundReason" AS ENUM ('PATIENT_CANCEL_48H', 'PATIENT_CANCEL_LT48H', 'PRO_CANCEL', 'OTHER');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "priceCents" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT,
    "checkoutUrl" TEXT,
    "qrCodeText" TEXT,
    "expiresAt" TIMESTAMP(3),
    "amountCents" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund" (
    "id" TEXT NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "reason" "RefundReason" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "providerRefundId" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout" (
    "id" TEXT NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "professionalId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "providerPayoutId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotencyKey" (
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotencyKey_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_appointmentId_key" ON "payment"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_providerPaymentId_key" ON "payment"("providerPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "refund_appointmentId_key" ON "refund"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "payout_appointmentId_key" ON "payout"("appointmentId");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund" ADD CONSTRAINT "refund_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout" ADD CONSTRAINT "payout_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
