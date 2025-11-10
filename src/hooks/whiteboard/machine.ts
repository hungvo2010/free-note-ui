// Finite state machine to orchestrate whiteboard pointer interactions

export type ToolName =
  | "mouse"
  | "hand"
  | "eraser"
  | "word"
  | "image"
  // drawing tools
  | "line"
  | "rectangle"
  | "ellipse"
  | string;

export type Point = { x: number; y: number };

export type StateTag =
  | "Idle"
  | "Drawing"
  | "Dragging"
  | "Panning"
  | "Erasing"
  | "EditingText"
  | "ImagePlacing";

export type Context = {
  currentTool: ToolName;
  locked: boolean;
  pos: Point | null;
  startPos: Point | null;
  selectedShapeId: string | null;
};

export type Event =
  | { type: "PointerDown"; pos: Point; hit?: boolean }
  | { type: "PointerMove"; pos: Point }
  | { type: "PointerUp"; pos: Point }
  | { type: "KeyDown"; key: string }
  | { type: "ToolChange"; tool: ToolName }
  | { type: "LockToggle"; locked: boolean }
  | { type: "ImagePlaced" };

export type State = { tag: StateTag; ctx: Context };

export const initialState = (tool: ToolName, locked = false): State => ({
  tag: "Idle",
  ctx: {
    currentTool: tool,
    locked,
    pos: null,
    startPos: null,
    selectedShapeId: null,
  },
});

export function transition(state: State, event: Event): State {
  const { tag, ctx } = state;
  switch (tag) {
    case "Idle": {
      if (event.type === "PointerDown") {
        if (ctx.locked) return { tag: "Idle", ctx: { ...ctx, pos: event.pos } };
        switch (ctx.currentTool) {
          case "mouse": {
            if (event.hit) {
              return {
                tag: "Dragging",
                ctx: { ...ctx, startPos: event.pos, pos: event.pos },
              };
            }
            return { tag: "Idle", ctx: { ...ctx, pos: event.pos } };
          }
          case "hand":
            return {
              tag: "Panning",
              ctx: { ...ctx, startPos: event.pos, pos: event.pos },
            };
          case "eraser":
            return {
              tag: "Erasing",
              ctx: { ...ctx, startPos: event.pos, pos: event.pos },
            };
          case "word":
            return {
              tag: "EditingText",
              ctx: { ...ctx, startPos: event.pos, pos: event.pos },
            };
          case "image":
            return {
              tag: "ImagePlacing",
              ctx: { ...ctx, startPos: event.pos, pos: event.pos },
            };
          default:
            return {
              tag: "Drawing",
              ctx: { ...ctx, startPos: event.pos, pos: event.pos },
            };
        }
      }
      if (event.type === "ToolChange") {
        return { tag, ctx: { ...ctx, currentTool: event.tool } };
      }
      if (event.type === "LockToggle") {
        return { tag, ctx: { ...ctx, locked: event.locked } };
      }
      if (event.type === "PointerMove") {
        return { tag, ctx: { ...ctx, pos: event.pos } };
      }
      return state;
    }
    case "Drawing": {
      if (event.type === "PointerMove") {
        return { tag, ctx: { ...ctx, pos: event.pos } };
      }
      if (event.type === "PointerUp") {
        return { tag: "Idle", ctx: { ...ctx, pos: event.pos, startPos: null } };
      }
      if (event.type === "ToolChange") {
        return { tag: "Idle", ctx: { ...ctx, currentTool: event.tool, startPos: null } };
      }
      return state;
    }
    case "Dragging": {
      if (event.type === "PointerMove") {
        return { tag, ctx: { ...ctx, pos: event.pos } };
      }
      if (event.type === "PointerUp") {
        return { tag: "Idle", ctx: { ...ctx, pos: event.pos, startPos: null } };
      }
      if (event.type === "ToolChange") {
        return { tag: "Idle", ctx: { ...ctx, currentTool: event.tool, startPos: null } };
      }
      return state;
    }
    case "Panning": {
      if (event.type === "PointerMove") {
        return { tag, ctx: { ...ctx, pos: event.pos } };
      }
      if (event.type === "PointerUp") {
        return { tag: "Idle", ctx: { ...ctx, pos: event.pos, startPos: null } };
      }
      if (event.type === "ToolChange") {
        return { tag: "Idle", ctx: { ...ctx, currentTool: event.tool, startPos: null } };
      }
      return state;
    }
    case "Erasing": {
      if (event.type === "PointerMove") {
        return { tag, ctx: { ...ctx, pos: event.pos } };
      }
      if (event.type === "PointerUp") {
        return { tag: "Idle", ctx: { ...ctx, pos: event.pos, startPos: null } };
      }
      if (event.type === "ToolChange") {
        return { tag: "Idle", ctx: { ...ctx, currentTool: event.tool, startPos: null } };
      }
      return state;
    }
    case "EditingText": {
      if (event.type === "KeyDown") {
        return state; // handled via actions outside
      }
      if (event.type === "PointerDown") {
        // clicking elsewhere while in text mode: remain EditingText unless tool changes
        return { tag: "EditingText", ctx: { ...ctx, pos: event.pos } };
      }
      if (event.type === "ToolChange") {
        return { tag: "Idle", ctx: { ...ctx, currentTool: event.tool } };
      }
      return state;
    }
    case "ImagePlacing": {
      if (event.type === "ImagePlaced") {
        return { tag: "Idle", ctx };
      }
      if (event.type === "ToolChange") {
        return { tag: "Idle", ctx: { ...ctx, currentTool: event.tool } };
      }
      return state;
    }
    default:
      return state;
  }
}

type Listener = (next: State, prev: State, event: Event) => void;

export function createWhiteboardMachine(initial: State): {
  getState: () => State;
  send: (event: Event) => void;
  subscribe: (fn: Listener) => () => void;
} {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    send: (event: Event) => {
      const prev = state;
      const next = transition(prev, event);
      state = next;
      if (next !== prev) {
        listeners.forEach((fn) => fn(next, prev, event));
      }
    },
    subscribe: (fn: Listener) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export const isInteractive = (tag: StateTag) =>
  tag === "Drawing" || tag === "Dragging" || tag === "Panning" || tag === "Erasing" || tag === "EditingText" || tag === "ImagePlacing";

