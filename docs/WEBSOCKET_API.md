# WebSocket API Documentation - ShapeEventDispatcher

## Base Message Structure
All WebSocket messages follow this structure:

```typescript
{
  messageId: string;       // UUID v4
  payload: {
    draftId: string;      // Current draft ID
    draftName: string;    // Current draft name
    requestType: string;  // "DATA" or "CONNECT"
    content: {
      type: ActionType;   // Usually ActionType.UPDATE
      details: {          // Operation-specific data
        op: string;       // Operation type
        // ... operation specific fields
      }
    }
  }
}
```

## Operations

### 1. Add Shape
**Method**: `addShape(shapeData: Shape)`  
**Operation**: `"add"`

```typescript
{
  op: "add",
  shape: Shape  // Serialized shape data
}
```

### 2. Update Shape
**Method**: `updateShape(id: string, patch: Shape)`  
**Operation**: `"update"`

```typescript
{
  op: "update",
  id: string,    // Shape ID
  patch: Shape   // Serialized shape data with updates
}
```

### 3. Pan
**Method**: `pan(offset: { x: number, y: number })`  
**Operation**: `"pan"`

```typescript
{
  op: "pan",
  offset: {
    x: number,  // X-axis movement
    y: number   // Y-axis movement
  }
}
```

### 4. Delete Shapes
**Method**: `deleteShapes(ids: string[])`  
**Operation**: `"delete"`

```typescript
{
  op: "delete",
  ids: string[]  // Array of shape IDs to delete
}
```

### 5. Create/Update Draft
**Method**: `creatingDraft()`  
**Operation**: `"creating"`  
**Request Type**: `RequestType.CONNECT`

```typescript
{
  op: "creating"
}
```

### 6. Finalize Shape
**Method**: `finalizeShape(id: string)`  
**Operation**: `"finalize"`

```typescript
{
  op: "finalize",
  id: string  // Shape ID to finalize
}
```

## Notes
- All shape data is serialized using `ShapeSerialization.serialize()` before sending
- The server is expected to handle these operations and broadcast them to other connected clients
- The client uses these same messages to update its local state when receiving updates from the server
- `draftId` and `draftName` are automatically included in every message from the current draft context
- The WebSocket connection is managed by the `WebSocketConnection` class
- Message handling is done through the `EventBus` system

## Error Handling
- If a message fails to process, the client should log the error and continue processing other messages
- The server should validate all incoming messages and respond with appropriate error messages if the format is invalid

## Message Flow
1. Client sends a message through `ShapeEventDispatcher`
2. Message is wrapped in the standard format with a unique `messageId`
3. Server processes the message and broadcasts it to all connected clients
4. Each client processes the message through their local `EventBus`
5. The `useWhiteboardEvents` hook processes the message and updates the UI accordingly

## Security Considerations
- All WebSocket messages should be validated on the server side
- The `draftId` is used to scope operations to a specific draft
- Sensitive operations should be authenticated and authorized

## Performance Considerations
- Large shapes should be optimized before sending
- Consider batching multiple operations when possible
- The client should handle out-of-order messages using the `messageId` if needed
