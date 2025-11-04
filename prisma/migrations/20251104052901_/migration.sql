-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_senderId_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "responseData" TEXT,
ALTER COLUMN "conversationId" DROP NOT NULL,
ALTER COLUMN "senderId" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
