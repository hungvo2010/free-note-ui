import { MessageObserver } from "./MessageSubject";
import { getShapesToUpdate, parseDraftResponse } from "core/shapeLogic";
import { ReDrawController } from "main/ReDrawController";
import { RoughCanvas } from "roughjs/bin/canvas";

interface MessageHandlerConfig {
  draftId: string;
  roughCanvas: RoughCanvas | undefined;
  reDrawController: ReDrawController;
  onDraftChange: (newDraftId: string) => void;
}

export class MessageHandler implements MessageObserver {
  constructor(private config: MessageHandlerConfig) {}

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

export type { MessageHandlerConfig };
