import { DraftSyncClient } from "../../DraftSyncClient";
import { ConnectionReadyObserver } from "./ConnectionReadySubject";

export class ConnectionReadyHandler implements ConnectionReadyObserver {
  private hasConnected = false;

  constructor(
    private dispatcher: DraftSyncClient,
    private draftId: string
  ) {}

  update(): void {
    // Idempotent: only send CONNECT once per connection cycle
    if (this.hasConnected) {
      console.log("Already sent CONNECT request for draft:", this.draftId, "- skipping");
      return;
    }

    console.log("Sending CONNECT request for draft:", this.draftId);
    this.dispatcher.creatingDraft();
    this.hasConnected = true;
  }

  reset(): void {
    // Reset for reconnection scenarios
    console.log("Resetting ConnectionReadyHandler for draft:", this.draftId);
    this.hasConnected = false;
  }
}
