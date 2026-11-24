-- AlterTable
ALTER TABLE "Order" ADD COLUMN "statusBeforeRemoval" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN "customerRemarks" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN "removedAt" DATETIME;
