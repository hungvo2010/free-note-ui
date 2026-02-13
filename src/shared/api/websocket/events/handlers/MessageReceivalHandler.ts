import {
  parseDraftResponseData,
  shapesFromResponseData,
} from "@features/draft/mappers/draftResponseMapper";
import { ReDrawController } from "@features/whiteboard/controllers/ReDrawController";
import { RequestType } from "@features/whiteboard/hooks/machine/types";
import { RoughCanvas } from "roughjs/bin/canvas";
import { WebSocketConnection } from "../../connection/WebSocketConnection";
import { MessageObserver } from "../subjects/MessageSubject";

interface MessageHandlerConfig {
  draftId: string;
  roughCanvas: RoughCanvas | undefined;
  webSocketConnection: WebSocketConnection;
  reDrawController: ReDrawController;
  onDraftChange: (newDraftId: string) => void;
}

export class MessageReceivalHandler implements MessageObserver {
  constructor(private config: MessageHandlerConfig) {}

  async update(message: Blob | string): Promise<void> {
    let jsonData: Record<string, any> = {};
    console.log("[MessageHandler] type of message: ", message);
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

    const draftResponse = parseDraftResponseData(jsonData);
    const shapesToUpdate = shapesFromResponseData(draftResponse);
    for (const shape of shapesToUpdate) {
      shape.setRoughCanvas(this.config.roughCanvas);
      this.config.reDrawController.mergeShape(shape);
    }
    if (
      sentFromOtherSender(
        this.config.webSocketConnection,
        draftResponse?.senderId,
        draftResponse?.requestType,
      )
    ) {
      console.log(
        "[] current senderId: ",
        this.config.webSocketConnection.getSessionId(),
      );
      console.log("[] messages senderId: ", draftResponse?.senderId);
      console.log(
        "[MessageReceivalHandler] RE-DRAW all due to messages from other sender OR CONNECT request",
      );
      this.config.reDrawController.reDraw(0, 0);
    }
    console.log("End observers message-receival");
  }
}

export type { MessageHandlerConfig };
function sentFromOtherSender(
  webSocketConnection: WebSocketConnection,
  senderId: string | undefined,
  requestType: number | undefined,
) {
  console.log("request type: ", requestType);
  return (
    webSocketConnection.getSessionId() !== senderId ||
    requestType === RequestType.CONNECT
  );
}
