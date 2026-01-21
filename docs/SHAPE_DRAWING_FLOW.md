# Shape Drawing Flow Analysis

## Overview
This document traces the complete data flow when a user draws a shape from mousedown → mousemove → mouseup.

## Flow Diagram

```
User Action          →  Event Handler           →  Dispatcher Method      →  WebSocket Message
─────────────────────────────────────────────────────────────────────────────────────────────────
MOUSEDOWN (start)    →  createDrawTool.onDown   →  dispatcher.addShape()  →  RequestType.ADD
  ↓
  Creates new shape with ID
  Adds to ReDrawController
  Sends initial shape data

MOUSEMOVE (resize)   →  createDrawTool.onMove   →  dispatcher.updateShape() → RequestType.UPDATE
  ↓                                                  (called repeatedly)
  Updates last shape coordinates
  Redraws canvas
  Sends updated shape data

MOUSEUP (finalize)   →  createDrawTool.onUp     →  dispatcher.finalizeShape() → RequestType.UPDATE
  ↓
  Marks shape as complete
  Sends finalization message
```

## Detailed Step-by-Step Flow

### 1. MOUSEDOWN - Shape Creation

**Location**: `src/hooks/whiteboard/tools/draw.ts` → `onDown()`

```typescript
onDown: (pos) => {
  refs.drawingRef.current = true;
  refs.positionRef.current = pos;
  
  // Create new shape with initial position
  const newShape = ShapeFactory.createShape(type, roughCanvas, pos.x, pos.y);
  
  if (newShape) {
    reDrawController.addShape(newShape);
    dispatcher.addShape(newShape);  // ← Sends WebSocket message
  }
}
```

**WebSocket Message Sent**:
```json
{
  "draftId": "draft-123",
  "draftName": "My Drawing",
  "requestType": 2,
  "content": {
    "shapes": [{
      "shapeId": "1234567890",
      "type": "rectangle",
      "content": {
        "id": "1234567890",
        "x": 100,
        "y": 50,
        "width": 0,
        "height": 0
      }
    }]
  }
}
```

**Key Points**:
- Shape ID is generated in `ShapeFactory.createShape()` using `new Date().getMilliseconds()`
- Initial dimensions are 0 (width/height for rectangle, radius for circle)
- Shape is added to local state AND sent via WebSocket

---

### 2. MOUSEMOVE - Shape Resizing

**Location**: `src/hooks/whiteboard/tools/draw.ts` → `onMove()`

```typescript
onMove: (pos) => {
  updateCursorType(canvas, "default");
  if (!refs.drawingRef.current) return;
  
  const start = refs.positionRef.current;
  
  // Update shape dimensions locally
  reDrawController.updateLastShape(start.x, start.y, pos.x, pos.y);
  
  // Get updated shape
  const last = reDrawController.getShapes()[reDrawController.getShapes().length - 1];
  
  if (last) {
    dispatcher.updateShape(last.getId(), last);  // ← Sends WebSocket message
  }
  
  reDrawController.reDraw(0, 0);
}
```

**WebSocket Message Sent** (repeatedly as mouse moves):
```json
{
  "draftId": "draft-123",
  "draftName": "My Drawing",
  "requestType": 3,
  "content": {
    "shapes": [{
      "shapeId": "1234567890",
      "type": "rectangle",
      "content": {
        "id": "1234567890",
        "x": 100,
        "y": 50,
        "width": 150,
        "height": 80
      }
    }]
  }
}
```

**Key Points**:
- Called continuously as mouse moves
- Each move sends a complete UPDATE message with current dimensions
- Same shape ID is maintained throughout
- Can generate many messages for a single shape

---

### 3. MOUSEUP - Shape Finalization

**Location**: `src/hooks/whiteboard/tools/draw.ts` → `onUp()`

```typescript
onUp: () => {
  refs.drawingRef.current = false;
  
  const last = reDrawController.getShapes()[reDrawController.getShapes().length - 1];
  
  if (last) {
    dispatcher.finalizeShape(last.getId());  // ← Sends WebSocket message
  }
}
```

**WebSocket Message Sent**:
```json
{
  "draftId": "draft-123",
  "draftName": "My Drawing",
  "requestType": 3,
  "content": {
    "shapes": [{
      "shapeId": "1234567890"
    }]
  }
}
```

**Key Points**:
- Marks drawing as complete
- Only sends shape ID (no content needed)
- Server can use this to mark shape as "finalized" vs "in-progress"

---

## Message Count Analysis

For a single shape drawing operation:
- **1 ADD message** (mousedown)
- **N UPDATE messages** (mousemove, where N = number of mouse move events)
- **1 FINALIZE message** (mouseup)

**Example**: Drawing a rectangle with 50 mouse move events = 52 total WebSocket messages

---

## Dispatcher Implementation

**Location**: `src/apis/resources/ShapeEventDispatcher.ts`

### addShape()
```typescript
addShape(shapeData: Shape) {
  const payload = ShapeSerialization.serialize(shapeData);
  const wireMessage = {
    draftId: this.currentDraft.draftId,
    draftName: this.currentDraft.draftName,
    requestType: RequestType.ADD,  // = 2
    content: {
      shapes: [payload],
    },
  };
  this.socket.sendAction(JSON.stringify(wireMessage));
}
```

### updateShape()
```typescript
updateShape(id: string, patch: Shape) {
  const payload = ShapeSerialization.serialize(patch);
  const wireMessage = {
    draftId: this.currentDraft.draftId,
    draftName: this.currentDraft.draftName,
    requestType: RequestType.UPDATE,  // = 3
    content: {
      shapes: [payload],
    },
  };
  this.socket.sendAction(JSON.stringify(wireMessage));
}
```

### finalizeShape()
```typescript
finalizeShape(id: string) {
  const wireMessage = {
    draftId: this.currentDraft.draftId,
    draftName: this.currentDraft.draftName,
    requestType: RequestType.UPDATE,  // = 3
    content: {
      shapes: [{ shapeId: id }],
    },
  };
  this.socket.sendAction(JSON.stringify(wireMessage));
}
```

---

## Performance Considerations

### Current Issues
1. **High message frequency**: Every mousemove sends a WebSocket message
2. **No throttling**: Can send 60+ messages per second during fast drawing
3. **Redundant data**: Full shape data sent on every update

### Potential Optimizations
1. **Throttle updates**: Limit to 10-20 updates per second
2. **Batch updates**: Combine multiple shape updates into one message
3. **Delta updates**: Send only changed properties
4. **Local-first**: Only send finalized shapes, keep in-progress shapes local

---

## Shape ID Generation

**Location**: `src/utils/ShapeFactory.ts`

```typescript
// Rectangle example
new RectangleAdapter(
  roughCanvas,
  new Rectangle(roughCanvas, x, y, 0, 0),
  new Date().getMilliseconds()  // ← ID generation
)
```

**Issue**: Using `getMilliseconds()` can cause ID collisions (only 0-999 range)

**Better approach**:
```typescript
Date.now()  // Full timestamp
// or
crypto.randomUUID()  // Guaranteed unique
```

---

## Receiving Updates

**Location**: `src/hooks/useWhiteboardEvents.ts`

```typescript
EventBus.setHandler(async (message) => {
  const jsonData = JSON.parse(message);
  
  if (jsonData?.draftId && jsonData?.draftId !== draftId) {
    navigate(`/draft/${jsonData?.draftId}`);
  }

  const draftAction = parseDraftAction(jsonData);
  const shapesToUpdate = getShapesToUpdate(draftAction);
  
  for (const shape of shapesToUpdate) {
    shape.setRoughCanvas(roughCanvas);
    reDrawController.mergeShape(shape);
  }
  
  reDrawController.reDraw(0, 0);
});
```

---

## Summary

The current implementation sends **real-time updates** for every mouse movement, providing immediate synchronization but at the cost of high message volume. The new schema format properly structures these messages with clear request types (ADD, UPDATE) and consistent shape format (shapeId, type, content).
