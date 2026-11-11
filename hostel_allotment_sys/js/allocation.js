/**
 * AllotmentPro - canonical, validated allocation engine.
 */
const AllocationStrategy = Object.freeze({ FIFO: 'fifo', PRIORITY: 'priority', GENDER_FIRST: 'gender_first' });

class AllocationEngine {
  constructor(hostels, participants, strategy = AllocationStrategy.GENDER_FIRST) {
    this.hostels = Array.isArray(hostels) ? hostels : [];
    this.participants = Array.isArray(participants) ? participants : [];
    this.strategy = strategy;
    this.roomPool = [];
    this.results = this.emptyResults();
  }

  emptyResults() {
    return { allotted: [], waitlist: [], unallocated: [], statistics: {} };
  }

  static value(row, ...keys) {
    if (!row || typeof row !== 'object') return undefined;
    const entries = Object.entries(row);
    for (const key of keys) {
      const found = entries.find(([name]) => name.trim().toLowerCase().replace(/[_\\s-]+/g, '') === key.trim().toLowerCase().replace(/[_\\s-]+/g, ''));
      if (found && found[1] !== undefined && found[1] !== null && String(found[1]).trim() !== '') return found[1];
    }
    return undefined;
  }

  normalizeGender(value) {
    const gender = String(value ?? '').trim().toLowerCase();
    if (['m', 'male', 'man', 'boy', 'boys'].includes(gender)) return 'male';
    if (['f', 'female', 'woman', 'girl', 'girls'].includes(gender)) return 'female';
    if (['other', 'others', 'non-binary', 'nonbinary'].includes(gender)) return 'other';
    throw new Error(`Unsupported gender "${value}". Use Male, Female, or Other (or M/F).`);
  }

  getCapacity(room) {
    const value = Number(AllocationEngine.value(room, 'capacity'));
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('Every room capacity must be a positive whole number.');
    }
    return value;
  }

  validate() {
    AllocationUtils.validateHostelData(this.hostels);
    AllocationUtils.validateParticipantData(this.participants);
  }

  initializeRoomPool() {
    this.roomPool = [];
    const seen = new Set();
    for (const room of this.hostels) {
      const building = String(AllocationEngine.value(room, 'building')).trim();
      const roomNumber = String(AllocationEngine.value(room, 'room number', 'room_number')).trim();
      const gender = this.normalizeGender(AllocationEngine.value(room, 'gender'));
      const capacity = this.getCapacity(room);
      const key = `${building.toLowerCase()}::${roomNumber.toLowerCase()}`;
      if (seen.has(key)) throw new Error(`Duplicate room: ${building} - ${roomNumber}.`);
      seen.add(key);
      for (let bed = 1; bed <= capacity; bed++) {
        this.roomPool.push({ id: `${key}::${bed}`, building, roomNumber, bedNumber: bed, gender, occupied: false, occupant: null });
      }
    }
    return this.roomPool;
  }

  getYear(person) {
    const year = Number(AllocationEngine.value(person, 'year'));
    return Number.isFinite(year) ? year : 0;
  }

  sortParticipants() {
    const list = this.participants.map((person, index) => ({ person, index }));
    if ([AllocationStrategy.PRIORITY, AllocationStrategy.GENDER_FIRST].includes(this.strategy)) {
      list.sort((a, b) => this.getYear(b.person) - this.getYear(a.person) || a.index - b.index);
    }
    return list.map(item => item.person);
  }

  findAvailableRoom(person) {
    const gender = this.normalizeGender(AllocationEngine.value(person, 'gender'));
    return this.roomPool.find(room => !room.occupied && room.gender === gender) || null;
  }

  toResult(person, room) {
    return {
      name: String(AllocationEngine.value(person, 'name')).trim(),
      status: room ? 'Allotted' : 'Waitlist',
      room: room ? `${room.building} - Room ${room.roomNumber}, Bed ${room.bedNumber}` : 'N/A',
      gender: String(AllocationEngine.value(person, 'gender')),
      department: AllocationEngine.value(person, 'department') ?? 'N/A',
      year: AllocationEngine.value(person, 'year') ?? 'N/A',
      ...(room ? { roomId: room.id } : { reason: 'No available room matching the participant gender.' })
    };
  }

  calculateStatistics() {
    const total = this.roomPool.length;
    const occupied = this.roomPool.filter(room => room.occupied).length;
    const genderDistribution = { male: 0, female: 0, other: 0 };
    this.results.allotted.forEach(item => genderDistribution[this.normalizeGender(item.gender)]++);
    this.results.statistics = {
      totalParticipants: this.participants.length,
      totalAllotted: this.results.allotted.length,
      totalWaitlist: this.results.waitlist.length,
      allocationRate: this.participants.length ? Number((this.results.allotted.length / this.participants.length * 100).toFixed(2)) : 0,
      genderDistribution,
      roomUtilization: { total, occupied, utilization: total ? Number((occupied / total * 100).toFixed(2)) : 0 }
    };
    return this.results.statistics;
  }

  execute() {
    this.validate();
    this.results = this.emptyResults();
    this.initializeRoomPool();
    for (const person of this.sortParticipants()) {
      const room = this.findAvailableRoom(person);
      if (room) {
        room.occupied = true;
        room.occupant = String(AllocationEngine.value(person, 'name')).trim();
        this.results.allotted.push(this.toResult(person, room));
      } else {
        this.results.waitlist.push(this.toResult(person, null));
      }
    }
    this.calculateStatistics();
    return this.results;
  }

  getResults() { return this.results; }
  getStatistics() { return this.results.statistics; }
}

const AllocationUtils = {
  validateHostelData(data) {
    if (!Array.isArray(data) || !data.length) throw new Error('Hostel data must contain at least one room.');
    const errors = [];
    const seen = new Set();
    data.forEach((room, i) => {
      const row = i + 2;
      const building = AllocationEngine.value(room, 'building');
      const number = AllocationEngine.value(room, 'room number', 'room_number');
      const capacity = Number(AllocationEngine.value(room, 'capacity'));
      const gender = AllocationEngine.value(room, 'gender');
      if (!building) errors.push(`Hostel row ${row}: building is required.`);
      if (!number) errors.push(`Hostel row ${row}: room number is required.`);
      if (!Number.isInteger(capacity) || capacity <= 0) errors.push(`Hostel row ${row}: capacity must be a positive whole number.`);
      if (!gender) errors.push(`Hostel row ${row}: gender is required.`);
      else {
        try { new AllocationEngine([], []).normalizeGender(gender); }
        catch (error) { errors.push(`Hostel row ${row}: ${error.message}`); }
      }
      if (building && number) {
        const key = `${String(building).trim().toLowerCase()}::${String(number).trim().toLowerCase()}`;
        if (seen.has(key)) errors.push(`Hostel row ${row}: duplicate room ${building} - ${number}.`);
        seen.add(key);
      }
    });
    if (errors.length) throw new Error(errors.slice(0, 8).join(' '));
    return true;
  },

  validateParticipantData(data) {
    if (!Array.isArray(data) || !data.length) throw new Error('Participant data must contain at least one participant.');
    const errors = [];
    const seen = new Set();
    data.forEach((person, i) => {
      const row = i + 2;
      const name = AllocationEngine.value(person, 'name');
      const gender = AllocationEngine.value(person, 'gender');
      if (!name) errors.push(`Participant row ${row}: name is required.`);
      if (!gender) errors.push(`Participant row ${row}: gender is required.`);
      else {
        try { new AllocationEngine([], []).normalizeGender(gender); }
        catch (error) { errors.push(`Participant row ${row}: ${error.message}`); }
      }
      if (name) {
        const key = String(name).trim().toLowerCase();
        if (seen.has(key)) errors.push(`Participant row ${row}: duplicate name "${name}".`);
        seen.add(key);
      }
    });
    if (errors.length) throw new Error(errors.slice(0, 8).join(' '));
    return true;
  },

  generateReport(results) {
    const stats = results.statistics || {};
    return [
      '=== ALLOCATION REPORT ===',
      `Total Participants: ${stats.totalParticipants ?? 0}`,
      `Allotted: ${stats.totalAllotted ?? 0}`,
      `Waitlist: ${stats.totalWaitlist ?? 0}`,
      `Allocation Rate: ${stats.allocationRate ?? 0}%`,
      `Room Utilization: ${stats.roomUtilization?.utilization ?? 0}%`
    ].join('\\n');
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AllocationEngine, AllocationStrategy, AllocationUtils };
}
