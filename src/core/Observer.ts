import { RoughCanvas } from "roughjs/bin/canvas";

export type UpdateState = {
  roughCanvas: RoughCanvas | undefined;
  theme?: 'dark' | 'light';
}
export interface Observer {
  observerUpdate(state: UpdateState): void;
}