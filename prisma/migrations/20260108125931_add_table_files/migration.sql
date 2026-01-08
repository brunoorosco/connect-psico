-- CreateTable
CREATE TABLE "patient_files" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_key" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_files_user_id_idx" ON "patient_files"("user_id");

-- AddForeignKey
ALTER TABLE "patient_files" ADD CONSTRAINT "patient_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
