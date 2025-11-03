export enum ActionType {
  INIT = 0,
  INVALID = -1,
  UPDATE = 1,
  NOOP = 2,
}

export type DraftAction = {
  type: ActionType;
  data: Record<string, any>;
};
