-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_id_fkey";

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
