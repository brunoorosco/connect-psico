-- CreateTable
CREATE TABLE "anamnesis_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "anamnesis_tokens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "anamnesis_adult" ADD CONSTRAINT "anamnesis_adult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamnesis_tokens" ADD CONSTRAINT "anamnesis_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamnesis_tokens" ADD CONSTRAINT "anamnesis_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
