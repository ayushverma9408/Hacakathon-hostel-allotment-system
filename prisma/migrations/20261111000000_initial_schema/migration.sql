CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'WARDEN', 'STAFF');
CREATE TYPE "AcademicSessionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');
CREATE TYPE "ParticipantStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "AllocationRunStatus" AS ENUM ('DRAFT', 'COMPLETED', 'FAILED');
CREATE TYPE "AllocationStatus" AS ENUM ('CONFIRMED', 'WAITLISTED', 'CANCELLED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" VARCHAR(254) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'STAFF',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

CREATE TABLE "AcademicSession" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(32) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "status" "AcademicSessionStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AcademicSession_dates_check" CHECK ("endsAt" > "startsAt")
);
CREATE UNIQUE INDEX "AcademicSession_code_key" ON "AcademicSession"("code");
CREATE INDEX "AcademicSession_status_startsAt_idx" ON "AcademicSession"("status", "startsAt");

CREATE TABLE "Hostel" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(24) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" VARCHAR(500),
  "policyCode" VARCHAR(64),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Hostel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Hostel_code_key" ON "Hostel"("code");
CREATE INDEX "Hostel_isActive_name_idx" ON "Hostel"("isActive", "name");

CREATE TABLE "Building" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(24) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "hostelId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Building_hostelId_code_key" ON "Building"("hostelId", "code");
CREATE INDEX "Building_hostelId_name_idx" ON "Building"("hostelId", "name");

CREATE TABLE "Room" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(24) NOT NULL,
  "floor" INTEGER NOT NULL DEFAULT 0,
  "capacity" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "buildingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Room_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Room_capacity_check" CHECK ("capacity" > 0),
  CONSTRAINT "Room_floor_check" CHECK ("floor" >= 0)
);
CREATE UNIQUE INDEX "Room_buildingId_code_key" ON "Room"("buildingId", "code");
CREATE INDEX "Room_buildingId_isActive_idx" ON "Room"("buildingId", "isActive");

CREATE TABLE "Participant" (
  "id" TEXT NOT NULL,
  "registrationNo" VARCHAR(40) NOT NULL,
  "fullName" VARCHAR(120) NOT NULL,
  "email" VARCHAR(254),
  "department" VARCHAR(100),
  "academicYear" INTEGER,
  "status" "ParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
  "sessionId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Participant_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Participant_academicYear_check" CHECK ("academicYear" IS NULL OR "academicYear" BETWEEN 1 AND 10)
);
CREATE UNIQUE INDEX "Participant_registrationNo_key" ON "Participant"("registrationNo");
CREATE INDEX "Participant_sessionId_status_idx" ON "Participant"("sessionId", "status");
CREATE INDEX "Participant_fullName_idx" ON "Participant"("fullName");

CREATE TABLE "AllocationRun" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "createdById" TEXT,
  "status" "AllocationRunStatus" NOT NULL DEFAULT 'DRAFT',
  "algorithmVersion" VARCHAR(32) NOT NULL DEFAULT 'v1',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AllocationRun_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AllocationRun_sessionId_status_createdAt_idx" ON "AllocationRun"("sessionId", "status", "createdAt");

CREATE TABLE "Allocation" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "bedNumber" INTEGER NOT NULL,
  "status" "AllocationStatus" NOT NULL DEFAULT 'CONFIRMED',
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Allocation_bedNumber_check" CHECK ("bedNumber" > 0)
);
CREATE UNIQUE INDEX "Allocation_participantId_sessionId_key" ON "Allocation"("participantId", "sessionId");
CREATE UNIQUE INDEX "Allocation_runId_roomId_bedNumber_key" ON "Allocation"("runId", "roomId", "bedNumber");
CREATE INDEX "Allocation_runId_status_idx" ON "Allocation"("runId", "status");
CREATE INDEX "Allocation_roomId_status_idx" ON "Allocation"("roomId", "status");

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" VARCHAR(80) NOT NULL,
  "entityType" VARCHAR(80) NOT NULL,
  "entityId" VARCHAR(128) NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditEvent_entityType_entityId_createdAt_idx" ON "AuditEvent"("entityType", "entityId", "createdAt");
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");

ALTER TABLE "Building" ADD CONSTRAINT "Building_hostelId_fkey"
  FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Room" ADD CONSTRAINT "Room_buildingId_fkey"
  FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AllocationRun" ADD CONSTRAINT "AllocationRun_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AllocationRun" ADD CONSTRAINT "AllocationRun_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_runId_fkey"
  FOREIGN KEY ("runId") REFERENCES "AllocationRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_participantId_fkey"
  FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
