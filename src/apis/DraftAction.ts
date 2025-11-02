export enum ActionType {
  INIT,
  INVALID,
  UPDATE,
  NOOP,
}

export type DraftAction = {
  type: ActionType;
  data: Record<string, any>;
};
