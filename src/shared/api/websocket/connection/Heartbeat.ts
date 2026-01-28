import { MsgType } from "@features/draft/api/protocol";
import { WebSocketConnection } from "./WebSocketConnection";

export interface HeartbeatMessage {
  msgType: MsgType;
  message?: string;
  pingAt: number;
  receivedPingAt?: number;
  pongAt?: number;
}

export class Heartbeat {
  private intervalId: NodeJS.Timeout | null = null;
  private connection: WebSocketConnection;
  private intervalMs: number;

  constructor(connection: WebSocketConnection, intervalMs: number = 30000) {
    this.connection = connection;
    this.intervalMs = intervalMs;
  }

  start(): void {
    if (this.intervalId) {
      console.warn("Heartbeat already running");
      return;
    }

    console.log(`Starting heartbeat with interval: ${this.intervalMs}ms`);
    this.intervalId = setInterval(() => {
      if (this.connection.isHealthy()) {
        const message: HeartbeatMessage = {
          msgType: MsgType.PING,
          pingAt: Date.now(),
        };
        this.connection.sendAction(JSON.stringify(message));
        console.log("Heartbeat ping sent at:", message.pingAt);
      } else {
        console.warn("Heartbeat skipped - connection not healthy");
      }
    }, this.intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Heartbeat stopped");
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}
