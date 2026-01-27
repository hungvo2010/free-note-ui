import EventBus from "./EventBus";
import { MessageHandler } from "../events/message/MessageHandler";
import { ConnectionReadyHandler } from "../events/ready/ConnectionReadyHandler";
import { ConnectionStateHandler } from "../events/reconnect/ConnectionStateHandler";
import { ReDrawController } from "main/ReDrawController";
import { RoughCanvas } from "roughjs/bin/canvas";
import { DraftSyncClient } from "../DraftSyncClient";

interface EventHandlerCoordinatorConfig {
  draftId: string;
  roughCanvas: RoughCanvas | undefined;
  reDrawController: ReDrawController;
  onDraftChange: (newDraftId: string) => void;
}

/**
 * Coordinates event handlers by registering them with the EventBus.
 * Responsible for:
 * - Creating handlers with proper configuration
 * - Registering handlers as observers to EventBus subjects
 * - Cleaning up handlers when no longer needed
 */
export class EventHandlerCoordinator {
  private messageHandler: MessageHandler;
  private connectionReadyHandler?: ConnectionReadyHandler;
  private connectionStateHandler?: ConnectionStateHandler;

  constructor(private config: EventHandlerCoordinatorConfig) {
    this.messageHandler = new MessageHandler(config);
  }

  /**
   * Register all handlers with EventBus and set up their dependencies
   */
  register(dispatcher: DraftSyncClient): void {
    this.connectionReadyHandler = new ConnectionReadyHandler(
      dispatcher,
      this.config.draftId
    );
    this.connectionStateHandler = new ConnectionStateHandler(
      this.connectionReadyHandler
    );

    EventBus.addMessageHandler(this.messageHandler);
    EventBus.addConnectionReadyHandler(this.connectionReadyHandler);
    EventBus.addConnectionStateChange(this.connectionStateHandler);
  }

  /**
   * Unregister all handlers from EventBus
   */
  unregister(): void {
    EventBus.removeMessageHandler(this.messageHandler);
    if (this.connectionReadyHandler) {
      EventBus.removeConnectionReadyHandler(this.connectionReadyHandler);
    }
    if (this.connectionStateHandler) {
      EventBus.removeConnectionStateChange(this.connectionStateHandler);
    }
  }
}
