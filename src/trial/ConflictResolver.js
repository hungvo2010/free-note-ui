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