-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "room_id" TEXT,
ADD COLUMN     "tipo_atendimento" TEXT DEFAULT 'ambos';
