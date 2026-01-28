/**
 * Generic throttle utility for batching and throttling function calls
 */
export class Throttle<T> {
  private lastTime = 0;
  private pending: T[] = [];
  private timeoutId: number | null = null;

  constructor(
    private throttleMs: number,
    private flushCallback: (items: T[]) => void,
  ) {}

  /**
   * Add an item to the throttle queue
   */
  add(item: T): void {
    this.pending.push(item);

    const now = Date.now();
    const timeSinceLast = now - this.lastTime;

    if (timeSinceLast >= this.throttleMs) {
      this.flush();
    } else {
      // Schedule a flush if not already scheduled
      if (this.timeoutId === null) {
        this.timeoutId = window.setTimeout(() => {
          this.flush();
        }, this.throttleMs - timeSinceLast);
      }
    }
  }

  /**
   * Immediately flush all pending items
   */
  flush(): void {
    if (this.pending.length === 0) return;

    this.flushCallback([...this.pending]);

    this.pending = [];
    this.lastTime = Date.now();
    this.timeoutId = null;
  }

  /**
   * Clear all pending items without flushing
   */
  clear(): void {
    this.pending = [];
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * Map-based throttle for keyed updates (e.g., shape updates by ID)
 * Only keeps the latest value for each key
 */
export class KeyedThrottle<K, V> {
  private lastTime = 0;
  private pending = new Map<K, V>();
  private timeoutId: number | null = null;

  constructor(
    private throttleMs: number,
    private flushCallback: (items: Map<K, V>) => void,
  ) {}

  /**
   * Set/update a keyed item in the throttle queue
   */
  set(key: K, value: V): void {
    this.pending.set(key, value);

    const now = Date.now();
    const timeSinceLast = now - this.lastTime;

    if (timeSinceLast >= this.throttleMs) {
      this.flush();
    } else {
      // Schedule a flush if not already scheduled
      if (this.timeoutId === null) {
        this.timeoutId = window.setTimeout(() => {
          this.flush();
        }, this.throttleMs - timeSinceLast);
      }
    }
  }

  /**
   * Immediately flush all pending items
   */
  flush(): void {
    if (this.pending.size === 0) return;

    this.flushCallback(new Map(this.pending));

    this.pending.clear();
    this.lastTime = Date.now();
    this.timeoutId = null;
  }

  /**
   * Clear all pending items without flushing
   */
  clear(): void {
    this.pending.clear();
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * Accumulator-based throttle for values that need to be summed/accumulated
 * (e.g., pan offsets)
 */
export class AccumulatorThrottle<T> {
  private lastTime = 0;
  private accumulated: T | null = null;
  private timeoutId: number | null = null;

  constructor(
    private throttleMs: number,
    private flushCallback: (value: T) => void,
    private accumulator: (current: T | null, next: T) => T,
  ) {}

  /**
   * Add a value to accumulate
   */
  add(value: T): void {
    this.accumulated = this.accumulator(this.accumulated, value);

    const now = Date.now();
    const timeSinceLast = now - this.lastTime;

    if (timeSinceLast >= this.throttleMs) {
      this.flush();
    } else {
      // Schedule a flush if not already scheduled
      if (this.timeoutId === null) {
        this.timeoutId = window.setTimeout(() => {
          this.flush();
        }, this.throttleMs - timeSinceLast);
      }
    }
  }

  /**
   * Immediately flush the accumulated value
   */
  flush(): void {
    if (this.accumulated === null) return;

    this.flushCallback(this.accumulated);

    this.accumulated = null;
    this.lastTime = Date.now();
    this.timeoutId = null;
  }

  /**
   * Clear accumulated value without flushing
   */
  clear(): void {
    this.accumulated = null;
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
