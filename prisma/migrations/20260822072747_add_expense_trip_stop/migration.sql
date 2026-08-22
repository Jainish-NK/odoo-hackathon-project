-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "tripStopId" TEXT;

-- CreateIndex
CREATE INDEX "expenses_tripStopId_idx" ON "expenses"("tripStopId");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tripStopId_fkey" FOREIGN KEY ("tripStopId") REFERENCES "trip_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
