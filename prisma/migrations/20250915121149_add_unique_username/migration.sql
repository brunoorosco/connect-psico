/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `professionals` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "professionals_username_key" ON "professionals"("username");
