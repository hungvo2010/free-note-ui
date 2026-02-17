import { DraftSyncClient } from "@features/draft/api/DraftSyncClient";
import { ReDrawController } from "@features/whiteboard/controllers/ReDrawController";
import { RoughCanvas } from "roughjs/bin/canvas";
import { WebSocketConnection } from "../../connection/WebSocketConnection";
import { ConnectionReadyHandler } from "../handlers/ConnectionReadyHandler";
import { ConnectionStateHandler } from "../handlers/ConnectionStateHandler";
import { MessageReceivalHandler } from "../handlers/MessageReceivalHandler";
import EventBus from "./EventBus";

interface EventHandlerCoordinatorConfig {
  draftId: string;
  roughCanvas: RoughCanvas | undefined;
  reDrawController: ReDrawController;
  webSocketConnection: WebSocketConnection;
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
  private messageHandler: MessageReceivalHandler;
  private connectionReadyHandler?: ConnectionReadyHandler;
  private connectionStateHandler?: ConnectionStateHandler;

  constructor(private config: EventHandlerCoordinatorConfig) {
    this.messageHandler = new MessageReceivalHandler(config);
  }

  /**
   * Register all handlers with EventBus and set up their dependencies
   */
  register(dispatcher: DraftSyncClient): void {
    this.connectionReadyHandler = new ConnectionReadyHandler(
      dispatcher,
      this.config.draftId,
    );
    this.connectionStateHandler = new ConnectionStateHandler(
      this.connectionReadyHandler,
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
