class TwoWaySyncManager {
  constructor(systemA, systemB, conflictResolver) {
    this.systemA = systemA;
    this.systemB = systemB;
    this.conflictResolver = conflictResolver;
    this.lastSyncTime = new Map(); // Track per-entity last sync
    this.changeLog = new Map(); // Track changes between syncs
  }

  async syncBothDirections(entityId) {
    // Phase 1: Detect changes since last sync
    const changesA = await this.systemA.getChangesSince(
      entityId,
      this.lastSyncTime.get(`A:${entityId}`)
    );

    const changesB = await this.systemB.getChangesSince(
      entityId,
      this.lastSyncTime.get(`B:${entityId}`)
    );

    // Phase 2: Detect conflicts
    const conflicts = this.detectConflicts(entityId, changesA, changesB);

    // Phase 3: Resolve conflicts
    for (const conflict of conflicts) {
      const resolution = this.conflictResolver.resolve(conflict);
      
      if (resolution.winner === 'A') {
        await this.systemB.applyChanges(resolution.changes);
      } else if (resolution.winner === 'B') {
        await this.systemA.applyChanges(resolution.changes);
      } else if (resolution.action === 'merge') {
        // Field-level merging
        const merged = this.mergeChanges(conflict.changesA, conflict.changesB);
        await this.systemA.applyChanges(merged);
        await this.systemB.applyChanges(merged);
      }
    }

    // Phase 4: Apply non-conflicting changes
    const nonConflictingA = changesA.filter(c => !conflicts.some(x => x.id === c.id));
    const nonConflictingB = changesB.filter(c => !conflicts.some(x => x.id === c.id));

    await this.systemB.applyChanges(nonConflictingA);
    await this.systemA.applyChanges(nonConflictingB);

    // Phase 5: Update sync timestamps
    this.lastSyncTime.set(`A:${entityId}`, new Date());
    this.lastSyncTime.set(`B:${entityId}`, new Date());
  }

  detectConflicts(entityId, changesA, changesB) {
    const conflicts = [];

    // Find entities changed in both systems
    const idsA = new Set(changesA.map(c => c.entityId));
    const idsB = new Set(changesB.map(c => c.entityId));
    const both = [...idsA].filter(id => idsB.has(id));

    for (const conflictId of both) {
      const changeA = changesA.find(c => c.entityId === conflictId);
      const changeB = changesB.find(c => c.entityId === conflictId);

      // Check if same fields were modified
      const fieldsA = Object.keys(changeA.changes);
      const fieldsB = Object.keys(changeB.changes);
      const overlapping = fieldsA.filter(f => fieldsB.includes(f));

      if (overlapping.length > 0) {
        conflicts.push({
          id: conflictId,
          changesA: changeA.changes,
          changesB: changeB.changes,
          overlappingFields: overlapping,
          timestampA: changeA.timestamp,
          timestampB: changeB.timestamp
        });
      }
    }

    return conflicts;
  }

  mergeChanges(changesA, changesB) {
    // Field-level merge: newer timestamp wins per field
    const merged = {};
    const allFields = new Set([
      ...Object.keys(changesA),
      ...Object.keys(changesB)
    ]);

    for (const field of allFields) {
      if (changesA[field] && !changesB[field]) {
        merged[field] = changesA[field];
      } else if (changesB[field] && !changesA[field]) {
        merged[field] = changesB[field];
      } else if (changesA[field] && changesB[field]) {
        // Both changed: use timestamp-based resolution
        const timeA = changesA[field].timestamp || 0;
        const timeB = changesB[field].timestamp || 0;
        merged[field] = timeA > timeB ? changesA[field] : changesB[field];
      }
    }

    return merged;
  }
}

// Conflict resolution strategies
const ConflictResolver = {
  strategies: {
    LAST_WRITE_WINS: (conflict) => ({
      winner: conflict.timestampA > conflict.timestampB ? 'A' : 'B',
      changes: conflict.timestampA > conflict.timestampB ? 
        conflict.changesA : conflict.changesB
    }),

    SYSTEM_A_PRIORITY: (conflict) => ({
      winner: 'A',
      changes: conflict.changesA
    }),

    FIELD_MERGE: (conflict) => ({
      action: 'merge',
      changesA: conflict.changesA,
      changesB: conflict.changesB
    }),

    MANUAL_REVIEW: (conflict) => ({
      action: 'escalate',
      escalatedTo: 'admin-queue',
      conflictDetails: conflict
    })
  },

  resolve(conflict, strategy = 'LAST_WRITE_WINS') {
    const resolver = this.strategies[strategy];
    if (!resolver) throw new Error(`Unknown strategy: ${strategy}`);
    return resolver(conflict);
  }
};

// Usage
const syncManager = new TwoWaySyncManager(
  cloudDB,      // System A
  mobileDB,     // System B
  ConflictResolver
);

// Run sync
await syncManager.syncBothDirections('customer:12345');
