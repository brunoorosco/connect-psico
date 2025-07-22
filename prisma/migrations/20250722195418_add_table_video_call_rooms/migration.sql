-- CreateTable
CREATE TABLE "video_call_rooms" (
    "id" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_call_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoCallParticipant" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoCallParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoCallParticipant_userId_roomId_key" ON "VideoCallParticipant"("userId", "roomId");

-- AddForeignKey
ALTER TABLE "VideoCallParticipant" ADD CONSTRAINT "VideoCallParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoCallParticipant" ADD CONSTRAINT "VideoCallParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "video_call_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
