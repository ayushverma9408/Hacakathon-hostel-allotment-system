/**
 * AllotmentPro - Allocation Algorithm Module
 * Advanced algorithms for hostel room allocation
 */

/**
 * Allocation Strategy Enum
 */
const AllocationStrategy = {
  FIFO: 'fifo',                    // First In First Out
  PRIORITY: 'priority',            // By year and priority
  GENDER_FIRST: 'gender_first',   // Gender preference then FIFO
  CAPACITY_OPTIMAL: 'capacity_optimal' // Optimal capacity utilization
};

/**
 * Main allocation class
 */
class AllocationEngine {
  constructor(hostels, participants, strategy = AllocationStrategy.GENDER_FIRST) {
    this.hostels = hostels || [];
    this.participants = participants || [];
    this.strategy = strategy;
    this.results = {
      allotted: [],
      waitlist: [],
      unallocated: [],
      statistics: {}
    };
    this.roomPool = {};
  }

  /**
   * Initialize room pool from hostel data
   */
  initializeRoomPool() {
    this.roomPool = {
      male: [],
      female: [],
      other: []
    };

    this.hostels.forEach((room) => {
      const gender = this.normalizeGender(room.gender);
      const capacity = this.getCapacity(room);

      if (!this.roomPool[gender]) {
        this.roomPool[gender] = [];
      }

      // Create individual bed slots for each capacity unit
      for (let i = 0; i < capacity; i++) {
        this.roomPool[gender].push({
          id: `${room.building}-${room['room number'] || room['room_number']}-${i}`,
          building: room.building || 'Unknown',
          roomNumber: room['room number'] || room['room_number'] || 'N/A',
          bedNumber: i + 1,
          gender: gender,
          occupied: false,
          occupant: null,
          allocatedAt: null
        });
      }
    });

    return this.roomPool;
  }

  /**
   * Normalize gender values
   */
  normalizeGender(gender) {
    if (!gender) return 'other';
    
    const normalized = gender.trim().toLowerCase();
    if (normalized === 'm' || normalized === 'male' || normalized === 'boy') {
      return 'male';
    }
    if (normalized === 'f' || normalized === 'female' || normalized === 'girl') {
      return 'female';
    }
    return 'other';
  }

  /**
   * Get room capacity
   */
  getCapacity(room) {
    const capacity = room.capacity || room.Capacity || 1;
    const numCapacity = parseInt(capacity);
    return isNaN(numCapacity) ? 1 : Math.max(1, numCapacity);
  }

  /**
   * Sort participants based on strategy
   */
  sortParticipants() {
    const sorted = [...this.participants];

    switch (this.strategy) {
      case AllocationStrategy.PRIORITY:
        // Sort by year (descending), then by name
        sorted.sort((a, b) => {
          const yearA = this.getYear(a);
          const yearB = this.getYear(b);
          if (yearB !== yearA) return yearB - yearA;
          return (a.name || '').localeCompare(b.name || '');
        });
        break;

      case AllocationStrategy.GENDER_FIRST:
        // Sort by gender match, then by year
        sorted.sort((a, b) => {
          const yearA = this.getYear(a);
          const yearB = this.getYear(b);
          return yearB - yearA;
        });
        break;

      case AllocationStrategy.FIFO:
      default:
        // Keep original order
        break;
    }

    return sorted;
  }

  /**
   * Get participant year
   */
  getYear(participant) {
    const year = participant.year || participant.Year || 0;
    const numYear = parseInt(year);
    return isNaN(numYear) ? 0 : numYear;
  }

  /**
   * Find available room for participant
   */
  findAvailableRoom(participant) {
    const gender = this.normalizeGender(participant.gender);
    const availableRooms = this.roomPool[gender] || [];

    // Find first available room
    for (let i = 0; i < availableRooms.length; i++) {
      if (!availableRooms[i].occupied) {
        return availableRooms[i];
      }
    }

    // If no exact gender match, try 'other' category
    if (gender !== 'other') {
      const otherRooms = this.roomPool.other || [];
      for (let i = 0; i < otherRooms.length; i++) {
        if (!otherRooms[i].occupied) {
          return otherRooms[i];
        }
      }
    }

    return null;
  }

  /**
   * Allocate a participant to a room
   */
  allocateParticipant(participant, room) {
    if (!room) return false;

    room.occupied = true;
    room.occupant = participant.name;
    room.allocatedAt = new Date().toISOString();

    this.results.allotted.push({
      name: participant.name,
      status: 'Allotted',
      room: `${room.building} - Room ${room.roomNumber}, Bed ${room.bedNumber}`,
      gender: participant.gender || 'N/A',
      department: participant.department || participant.Department || 'N/A',
      year: participant.year || participant.Year || 'N/A',
      roomId: room.id
    });

    return true;
  }

  /**
   * Add participant to waitlist
   */
  addToWaitlist(participant) {
    this.results.waitlist.push({
      name: participant.name,
      status: 'Waitlist',
      room: 'N/A',
      gender: participant.gender || 'N/A',
      department: participant.department || participant.Department || 'N/A',
      year: participant.year || participant.Year || 'N/A',
      reason: 'No available rooms matching preferences'
    });
  }

  /**
   * Calculate allocation statistics
   */
  calculateStatistics() {
    const stats = {
      totalParticipants: this.participants.length,
      totalAllotted: this.results.allotted.length,
      totalWaitlist: this.results.waitlist.length,
      allocationRate: 0,
      genderDistribution: {
        male: 0,
        female: 0,
        other: 0
      },
      roomUtilization: {
        total: 0,
        occupied: 0,
        utilization: 0
      }
    };

    // Calculate allocation rate
    stats.allocationRate = stats.totalParticipants > 0 
      ? (stats.totalAllotted / stats.totalParticipants * 100).toFixed(2)
      : 0;

    // Gender distribution
    this.results.allotted.forEach((result) => {
      const gender = this.normalizeGender(result.gender);
      stats.genderDistribution[gender] = (stats.genderDistribution[gender] || 0) + 1;
    });

    // Room utilization
    Object.values(this.roomPool).forEach((rooms) => {
      stats.roomUtilization.total += rooms.length;
      stats.roomUtilization.occupied += rooms.filter(r => r.occupied).length;
    });

    if (stats.roomUtilization.total > 0) {
      stats.roomUtilization.utilization = (
        stats.roomUtilization.occupied / stats.roomUtilization.total * 100
      ).toFixed(2);
    }

    this.results.statistics = stats;
    return stats;
  }

  /**
   * Execute allocation
   */
  execute() {
    // Initialize room pool
    this.initializeRoomPool();

    // Sort participants
    const sortedParticipants = this.sortParticipants();

    // Allocate each participant
    sortedParticipants.forEach((participant) => {
      const room = this.findAvailableRoom(participant);
      
      if (room) {
        this.allocateParticipant(participant, room);
      } else {
        this.addToWaitlist(participant);
      }
    });

    // Calculate statistics
    this.calculateStatistics();

    return this.results;
  }

  /**
   * Get results
   */
  getResults() {
    return this.results;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return this.results.statistics;
  }
}

/**
 * Utility functions for allocation
 */
const AllocationUtils = {
  /**
   * Validate hostel data
   */
  validateHostelData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Hostel data must be a non-empty array');
    }

    const requiredFields = ['building', 'room number', 'capacity', 'gender'];
    const hasRequiredFields = data.every((room) => {
      return requiredFields.some(field => 
        room[field] || room[field.replace(' ', '_')] || room[field.toUpperCase()]
      );
    });

    if (!hasRequiredFields) {
      throw new Error(`Hostel data must contain fields: ${requiredFields.join(', ')}`);
    }

    return true;
  },

  /**
   * Validate participant data
   */
  validateParticipantData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Participant data must be a non-empty array');
    }

    const requiredFields = ['name', 'gender'];
    const hasRequiredFields = data.every((participant) => {
      return requiredFields.some(field => 
        participant[field] || participant[field.toUpperCase()]
      );
    });

    if (!hasRequiredFields) {
      throw new Error(`Participant data must contain fields: ${requiredFields.join(', ')}`);
    }

    return true;
  },

  /**
   * Generate allocation report
   */
  generateReport(results) {
    let report = '=== ALLOCATION REPORT ===\n\n';
    report += `Total Participants: ${results.statistics.totalParticipants}\n`;
    report += `Allotted: ${results.statistics.totalAllotted}\n`;
    report += `Waitlist: ${results.statistics.totalWaitlist}\n`;
    report += `Allocation Rate: ${results.statistics.allocationRate}%\n`;
    report += `Room Utilization: ${results.statistics.roomUtilization.utilization}%\n\n`;

    report += '--- GENDER DISTRIBUTION ---\n';
    Object.entries(results.statistics.genderDistribution).forEach(([gender, count]) => {
      report += `${gender}: ${count}\n`;
    });

    return report;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AllocationEngine, AllocationStrategy, AllocationUtils };
}
