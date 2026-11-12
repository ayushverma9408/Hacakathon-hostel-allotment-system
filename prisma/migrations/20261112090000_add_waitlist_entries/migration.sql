-- Persist waitlisted participants separately because a waitlisted entry has no room or bed.
CREATE TABLE "WaitlistEntry" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "reason" VARCHAR(240) NOT NULL DEFAULT 'No available bed at allocation time.',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WaitlistEntry_position_check" CHECK ("position" > 0)
);

CREATE UNIQUE INDEX "WaitlistEntry_runId_participantId_key"
  ON "WaitlistEntry"("runId", "participantId");
CREATE UNIQUE INDEX "WaitlistEntry_runId_position_key"
  ON "WaitlistEntry"("runId", "position");
CREATE INDEX "WaitlistEntry_participantId_createdAt_idx"
  ON "WaitlistEntry"("participantId", "createdAt");

ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_runId_fkey"
  FOREIGN KEY ("runId") REFERENCES "AllocationRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_participantId_fkey"
  FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
