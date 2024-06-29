/*
  Warnings:

  - You are about to drop the column `is_active` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false;
