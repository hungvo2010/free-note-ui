import { RoughCanvas } from "roughjs/bin/canvas";

export type UpdateState = {
  roughCanvas: RoughCanvas | undefined;
  theme?: 'dark' | 'light';
}
export interface Observer {
  update(state: UpdateState): void;
}