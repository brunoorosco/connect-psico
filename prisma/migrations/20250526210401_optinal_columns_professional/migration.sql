-- AlterTable
ALTER TABLE "professionals" ALTER COLUMN "abordagem" DROP NOT NULL,
ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "uf_conselho" DROP NOT NULL,
ALTER COLUMN "tipo_atendimento" DROP NOT NULL,
ALTER COLUMN "valor_atendimento" DROP NOT NULL,
ALTER COLUMN "tempo_consulta" DROP NOT NULL;
