import { RoughCanvas } from "roughjs/bin/canvas";

export type UpdateState = {
  roughCanvas: RoughCanvas | undefined;
}
export interface Observer {
  update(state: UpdateState): void;
}