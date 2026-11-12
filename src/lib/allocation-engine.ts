export type AllocationParticipant = {
  id: string;
  registrationNo: string;
  fullName: string;
  createdAt: Date | string;
};

export type AllocationRoom = {
  id: string;
  code: string;
  capacity: number;
  buildingCode: string;
  buildingName: string;
  hostelCode: string;
  hostelName: string;
};

export type PlannedAssignment = {
  participantId: string;
  registrationNo: string;
  fullName: string;
  roomId: string;
  roomCode: string;
  buildingName: string;
  hostelName: string;
  bedNumber: number;
};

export type PlannedWaitlistEntry = {
  participantId: string;
  registrationNo: string;
  fullName: string;
  position: number;
  reason: string;
};

export type AllocationPlan = {
  algorithmVersion: "fifo-v1";
  assignments: PlannedAssignment[];
  waitlist: PlannedWaitlistEntry[];
  statistics: {
    participants: number;
    rooms: number;
    bedCapacity: number;
    assigned: number;
    waitlisted: number;
    unfilledBeds: number;
    occupancyPercent: number;
  };
};

/**
 * Deterministic first-in, first-out allocation.
 * Participant creation time is the primary order; registration number breaks ties.
 * Rooms are traversed by hostel, building, then room code. No personal/sensitive
 * attributes are inferred or used as allocation criteria.
 */
export function planAllocation(
  participants: AllocationParticipant[],
  rooms: AllocationRoom[]
): AllocationPlan {
  const participantIds = new Set<string>();
  for (const person of participants) {
    if (!person.id || !person.registrationNo.trim() || !person.fullName.trim()) {
      throw new Error("Every participant must have an ID, registration number and name.");
    }
    if (participantIds.has(person.id)) throw new Error("Duplicate participant in allocation input.");
    participantIds.add(person.id);
    if (Number.isNaN(new Date(person.createdAt).getTime())) {
      throw new Error(`Participant ${person.registrationNo} has an invalid registration timestamp.`);
    }
  }

  const roomIds = new Set<string>();
  let bedCapacity = 0;
  for (const room of rooms) {
    if (!room.id || !room.code.trim()) throw new Error("Every room must have an ID and room code.");
    if (roomIds.has(room.id)) throw new Error("Duplicate room in allocation input.");
    roomIds.add(room.id);
    if (!Number.isInteger(room.capacity) || room.capacity < 1 || room.capacity > 20) {
      throw new Error(`Room ${room.code} has an invalid capacity.`);
    }
    bedCapacity += room.capacity;
  }

  const orderedPeople = [...participants].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    || a.registrationNo.localeCompare(b.registrationNo, undefined, { numeric: true, sensitivity: "base" })
  );
  const orderedRooms = [...rooms].sort((a, b) =>
    a.hostelCode.localeCompare(b.hostelCode, undefined, { sensitivity: "base" })
    || a.buildingCode.localeCompare(b.buildingCode, undefined, { sensitivity: "base" })
    || a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: "base" })
  );

  const slots = orderedRooms.flatMap((room) =>
    Array.from({ length: room.capacity }, (_, index) => ({
      room,
      bedNumber: index + 1
    }))
  );

  const assignments: PlannedAssignment[] = [];
  const waitlist: PlannedWaitlistEntry[] = [];
  orderedPeople.forEach((person, index) => {
    const slot = slots[index];
    if (!slot) {
      waitlist.push({
        participantId: person.id,
        registrationNo: person.registrationNo,
        fullName: person.fullName,
        position: waitlist.length + 1,
        reason: "No available bed at allocation time."
      });
      return;
    }
    assignments.push({
      participantId: person.id,
      registrationNo: person.registrationNo,
      fullName: person.fullName,
      roomId: slot.room.id,
      roomCode: slot.room.code,
      buildingName: slot.room.buildingName,
      hostelName: slot.room.hostelName,
      bedNumber: slot.bedNumber
    });
  });

  return {
    algorithmVersion: "fifo-v1",
    assignments,
    waitlist,
    statistics: {
      participants: participants.length,
      rooms: rooms.length,
      bedCapacity,
      assigned: assignments.length,
      waitlisted: waitlist.length,
      unfilledBeds: Math.max(0, bedCapacity - assignments.length),
      occupancyPercent: bedCapacity ? Number((assignments.length / bedCapacity * 100).toFixed(2)) : 0
    }
  };
}
