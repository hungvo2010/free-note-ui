import EventBus from "./EventBus";
import { MessageObserver } from "./MessageSubject";
import { ConnectionReadyObserver } from "./ConnectionReadySubject";
import { ConnectionStateObserver } from "./ConnectionStateObserver";
import { getShapesToUpdate, parseDraftResponse } from "core/shapeLogic";
import { ReDrawController } from "main/ReDrawController";
import { RoughCanvas } from "roughjs/bin/canvas";
import { ShapeEventDispatcher } from "../ShapeEventDispatcher";

interface ShapeEventHandlerConfig {
  draftId: string;
  roughCanvas: RoughCanvas | undefined;
  reDrawController: ReDrawController;
  onDraftChange: (newDraftId: string) => void;
}

// Message observer for handling incoming messages
class MessageHandler implements MessageObserver {
  constructor(private config: ShapeEventHandlerConfig) {}

  async update(message: Blob | string): Promise<void> {
    let jsonData: Record<string, any> = {};
    console.log("type of message: ", message);
    if (message instanceof Blob) {
      const text = await message.text();
      jsonData = JSON.parse(text);
    } else {
      jsonData = JSON.parse(message);
    }
    
    if (jsonData?.draftId && jsonData?.draftId !== this.config.draftId) {
      this.config.onDraftChange(jsonData.draftId);
      return;
    }

    const draftResponse = parseDraftResponse(jsonData);
    const shapesToUpdate = getShapesToUpdate(draftResponse);
    for (const shape of shapesToUpdate) {
      shape.setRoughCanvas(this.config.roughCanvas);
      this.config.reDrawController.mergeShape(shape);
    }
    this.config.reDrawController.reDraw(0, 0);
  }
}

// Connection ready observer for handling connection ready events
class ConnectionReadyHandler implements ConnectionReadyObserver {
  private hasConnected = false;

  constructor(
    private dispatcher: ShapeEventDispatcher,
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

export class ShapeEventHandler implements ConnectionStateObserver {
  private config: ShapeEventHandlerConfig;
  private messageHandler: MessageHandler;
  private connectionReadyHandler?: ConnectionReadyHandler;

  constructor(config: ShapeEventHandlerConfig) {
    this.config = config;
    this.messageHandler = new MessageHandler(config);
  }

  setupHandlers(dispatcher: ShapeEventDispatcher) {
    this.connectionReadyHandler = new ConnectionReadyHandler(dispatcher, this.config.draftId);
    
    EventBus.messageObservers.registerObserver(this.messageHandler);
    EventBus.connectionReadyObservers.registerObserver(this.connectionReadyHandler);
    EventBus.connectionStateObservers.registerObserver(this);
  }

  cleanup() {
    EventBus.messageObservers.removeObserver(this.messageHandler);
    if (this.connectionReadyHandler) {
      EventBus.connectionReadyObservers.removeObserver(this.connectionReadyHandler);
    }
    EventBus.connectionStateObservers.removeObserver(this);
  }

  // ConnectionStateObserver implementation
  onDisconnect(): void {
    console.log("ShapeEventHandler: Connection lost, resetting state");
    if (this.connectionReadyHandler) {
      this.connectionReadyHandler.reset();
    }
  }

  onReconnect(): void {
    console.log("ShapeEventHandler: Connection restored");
    // State is already reset, observer will be notified via ConnectionReadySubject
  }
}
