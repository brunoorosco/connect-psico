-- CreateTable
CREATE TABLE "anamnesis_adult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "maritalStatus" TEXT,
    "occupation" TEXT,
    "education" TEXT,
    "referredBy" TEXT,
    "currentComplaint" TEXT NOT NULL,
    "complaintHistory" TEXT,
    "previousTreatment" TEXT,
    "medications" TEXT,
    "familyHistory" TEXT,
    "personalHistory" TEXT,
    "sleepPattern" TEXT,
    "appetite" TEXT,
    "mood" TEXT,
    "anxiety" TEXT,
    "stressLevel" TEXT,
    "suicidalThoughts" BOOLEAN NOT NULL DEFAULT false,
    "selfHarm" BOOLEAN NOT NULL DEFAULT false,
    "violence" BOOLEAN NOT NULL DEFAULT false,
    "additionalInfo" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anamnesis_adult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anamnesis_adult_userId_key" ON "anamnesis_adult"("userId");
