-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PIX', 'CREDIT_CARD', 'CASH', 'DEBIT_CARD', 'TRANSFER_BANK');

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "type" "PaymentType" DEFAULT 'PIX';
