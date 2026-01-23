import EventBus from "./EventBus";
import { MessageHandler } from "./message/MessageHandler";
import { ConnectionReadyHandler } from "./ready/ConnectionReadyHandler";
import { ConnectionStateHandler } from "./reconnect/ConnectionStateHandler";
import { ReDrawController } from "main/ReDrawController";
import { RoughCanvas } from "roughjs/bin/canvas";
import { ShapeEventDispatcher } from "../ShapeEventDispatcher";

interface ShapeEventHandlerConfig {
  draftId: string;
  roughCanvas: RoughCanvas | undefined;
  reDrawController: ReDrawController;
  onDraftChange: (newDraftId: string) => void;
}

export class ShapeEventHandler {
  private config: ShapeEventHandlerConfig;
  private messageHandler: MessageHandler;
  private connectionReadyHandler?: ConnectionReadyHandler;
  private connectionStateHandler?: ConnectionStateHandler;

  constructor(config: ShapeEventHandlerConfig) {
    this.config = config;
    this.messageHandler = new MessageHandler(config);
  }

  setupHandlers(dispatcher: ShapeEventDispatcher) {
    this.connectionReadyHandler = new ConnectionReadyHandler(dispatcher, this.config.draftId);
    this.connectionStateHandler = new ConnectionStateHandler(this.connectionReadyHandler);
    
    EventBus.getMessageSubject.registerObserver(this.messageHandler);
    EventBus.getConnectionReadySubject.registerObserver(this.connectionReadyHandler);
    EventBus.connectionStateObservers.registerObserver(this.connectionStateHandler);
  }

  cleanup() {
    EventBus.getMessageSubject.removeObserver(this.messageHandler);
    if (this.connectionReadyHandler) {
      EventBus.getConnectionReadySubject.removeObserver(this.connectionReadyHandler);
    }
    if (this.connectionStateHandler) {
      EventBus.connectionStateObservers.removeObserver(this.connectionStateHandler);
    }
  }
}
