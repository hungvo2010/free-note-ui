import {
  parseDraftResponseData,
  shapesFromResponseData,
} from "@features/draft/mappers/draftResponseMapper";
import { ReDrawController } from "@features/whiteboard/controllers/ReDrawController";
import { RoughCanvas } from "roughjs/bin/canvas";
import { MessageObserver } from "../subjects/MessageSubject";

interface MessageHandlerConfig {
  draftId: string;
  roughCanvas: RoughCanvas | undefined;
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
    this.config.reDrawController.reDraw(0, 0);
  }
}

export type { MessageHandlerConfig };
