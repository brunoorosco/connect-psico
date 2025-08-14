-- CreateTable
CREATE TABLE "NotifyDigest" (
    "receiverId" TEXT NOT NULL,
    "firstEventAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEventAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "windowEndAt" TIMESTAMP(3) NOT NULL,
    "msgCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NotifyDigest_pkey" PRIMARY KEY ("receiverId")
);
