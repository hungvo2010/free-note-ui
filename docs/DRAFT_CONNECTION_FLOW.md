# Draft Connection Flow

## Overview
This document explains what happens when a user accesses a draft URL like:
```
http://localhost:5173/draft/fd7244b4-f8b0-4d33-bb02-8d56f10f4d99
```

---

## Complete Flow Diagram

```
URL Access                    →  React Router           →  Component Mount
────────────────────────────────────────────────────────────────────────────
/draft/:draftId              →  WhiteboardPage         →  WhiteBoard
  ↓                                                         ↓
Extract draftId from URL                              WebSocketProvider
  ↓                                                         ↓
fd7244b4-f8b0-4d33-bb02...                           WhiteboardProvider
                                                            ↓
                                                      useWhiteboardEvents
                                                            ↓
                                                      setupDispatcherAndEventBus()
                                                            ↓
                                                      Create ShapeEventDispatcher
                                                            ↓
                                                      dispatcher.setDraft()
                                                            ↓
                                                      dispatcher.creatingDraft()
                                                            ↓
                                                      Send WebSocket Message
```

---

## Step-by-Step Breakdown

### 1. URL Routing

**File**: `src/App.tsx`

```typescript
<Route path="/draft/:draftId" element={<WhiteboardPage />} />
```

- React Router matches the URL pattern
- Extracts `draftId` parameter: `fd7244b4-f8b0-4d33-bb02-8d56f10f4d99`
- Renders `WhiteboardPage` component

---

### 2. Component Initialization

**File**: `src/WhiteBoardPage.tsx`

```typescript
export default function WhiteboardPage() {
  const [selected, setSelected] = useState(3);
  
  return (
    <ThemeProvider>
      <Toolbar ... />
      <WhiteBoard type={options[selected]} isLocked={false} />
    </ThemeProvider>
  );
}
```

- Initializes with default tool (index 3 = "circle")
- Renders `WhiteBoard` component

---

### 3. Context Providers Setup

**File**: `src/components/rough/WhiteBoard.tsx`

```typescript
export default function WhiteBoard(props: DrawTypeProps) {
  return (
    <WebSocketProvider>
      <WhiteboardProvider isLocked={props.isLocked}>
        <WhiteboardContent {...props} />
      </WhiteboardProvider>
    </WebSocketProvider>
  );
}
```

- `WebSocketProvider` establishes WebSocket connection
- `WhiteboardProvider` initializes canvas and drawing state
- `WhiteboardContent` sets up event handlers

---

### 4. Draft ID Extraction

**File**: `src/hooks/useDraft.ts`

```typescript
export const useDraft = () => {
  const params = useParams();
  const draftId = params.draftId;  // "fd7244b4-f8b0-4d33-bb02-8d56f10f4d99"
  const draftName = params.draftName;  // undefined (not in URL)
  return { draftId, draftName };
};
```

**Result**:
```typescript
{
  draftId: "fd7244b4-f8b0-4d33-bb02-8d56f10f4d99",
  draftName: undefined
}
```

---

### 5. Event Handler Setup

**File**: `src/hooks/useWhiteboardEvents.ts`

```typescript
export function useWhiteboardEvents(isLocked: boolean, type: string) {
  const { draftId, draftName } = useDraft();
  const { webSocketConnection } = useContext(WebSocketContext);
  
  const setupDispatcherAndEventBus = useCallback(() => {
    if (webSocketConnection && !dispatcherRef.current) {
      console.log("Creating dispatcher");
      
      // Create dispatcher with draft info
      dispatcherRef.current = new ShapeEventDispatcher(
        webSocketConnection,
        { draftId, draftName }
      );
      
      // Set up event bus for incoming messages
      EventBus.setHandler(async (message) => {
        // Handle incoming WebSocket messages
        // ...
      });
    } else {
      // If dispatcher already exists, just update draft
      dispatcherApi.ensureDraft({ draftId, draftName });
    }
  }, [webSocketConnection, draftId, draftName]);
  
  // Called on first mousedown
  const handleMouseDown = useCallback(async (e: MouseEvent) => {
    setupDispatcherAndEventBus();
    // ...
  }, []);
}
```

---

### 6. Dispatcher Creation & Draft Connection

**File**: `src/apis/resources/ShapeEventDispatcher.ts`

#### 6a. Dispatcher Instantiation
```typescript
dispatcherRef.current = new ShapeEventDispatcher(
  webSocketConnection,
  {
    draftId: "fd7244b4-f8b0-4d33-bb02-8d56f10f4d99",
    draftName: undefined
  }
);
```

#### 6b. Set Draft (if called via ensureDraft)
```typescript
public setDraft(draft: DraftEntity) {
  this.currentDraft = draft;
  this.creatingDraft();  // ← Sends WebSocket message
}
```

#### 6c. Creating Draft Message
```typescript
creatingDraft() {
  const wireMessage = {
    draftId: this.currentDraft.draftId,
    draftName: this.currentDraft.draftName,
    requestType: RequestType.CONNECT,  // = 1
    content: {
      shapes: [],
    },
  };
  console.log("Send message via WebSocket: " + JSON.stringify(wireMessage));
  this.socket.sendAction(JSON.stringify(wireMessage));
}
```

---

## WebSocket Message Sent

### When Dispatcher is Created (First Interaction)

**Trigger**: First mousedown event after page load

**Message Sent**:
```json
{
  "draftId": "fd7244b4-f8b0-4d33-bb02-8d56f10f4d99",
  "draftName": null,
  "requestType": 1,
  "content": {
    "shapes": []
  }
}
```

**Message Details**:
- `draftId`: Extracted from URL parameter
- `draftName`: `null` (not provided in URL)
- `requestType`: `1` (CONNECT)
- `content.shapes`: Empty array (no existing shapes to send)

---

## Important Notes

### 1. Lazy Connection
The WebSocket message is **NOT sent immediately** when the page loads. It's sent on the **first user interaction** (mousedown event).

**Reason**: The dispatcher is created lazily in `setupDispatcherAndEventBus()` which is called from `handleMouseDown()`.

### 2. Draft Name
The URL pattern `/draft/:draftId` only captures the draft ID, not the name. The `draftName` will be `undefined` unless:
- The server sends it back in a response
- It's stored in local state/storage
- The URL pattern is changed to include it

### 3. Connection Purpose
The CONNECT message tells the server:
- A client wants to join this specific draft
- The client is ready to receive existing shapes
- The client will start sending shape updates

### 4. Expected Server Response
The server should respond with:
```json
{
  "draftId": "fd7244b4-f8b0-4d33-bb02-8d56f10f4d99",
  "draftName": "My Drawing",
  "requestType": 1,
  "data": {
    "shapes": [
      // Array of existing shapes in this draft
      {
        "shapeId": "shape-001",
        "type": "rectangle",
        "content": { "x": 100, "y": 50, "width": 200, "height": 100 }
      }
    ]
  }
}
```

---

## Sequence Diagram

```
User                Browser              React App           WebSocket           Server
 |                     |                     |                    |                 |
 |--Navigate to URL--->|                     |                    |                 |
 |                     |--Load Page--------->|                    |                 |
 |                     |                     |--Connect WS------->|                 |
 |                     |                     |                    |--Establish----->|
 |                     |                     |                    |<--Connected-----|
 |                     |                     |                    |                 |
 |--Click/Draw-------->|                     |                    |                 |
 |                     |--MouseDown--------->|                    |                 |
 |                     |                     |--Create Dispatcher |                 |
 |                     |                     |--setDraft()------->|                 |
 |                     |                     |--creatingDraft()-->|                 |
 |                     |                     |                    |--CONNECT msg--->|
 |                     |                     |                    |                 |
 |                     |                     |                    |<--Shapes data---|
 |                     |                     |<--Parse & Render---|                 |
 |                     |<--Update Canvas-----|                    |                 |
 |<--See Shapes--------|                     |                    |                 |
```

---

## Alternative Flow: Direct Access vs Navigation

### Scenario A: Direct URL Access
```
User types: http://localhost:5173/draft/fd7244b4-...
→ Page loads fresh
→ WebSocket connects
→ First mousedown triggers CONNECT message
```

### Scenario B: Navigation from Another Draft
```
User is on: /draft/abc-123
Server sends: { draftId: "fd7244b4-..." }
→ navigate(`/draft/${jsonData.draftId}`)
→ Page re-renders with new draftId
→ First mousedown triggers CONNECT message with new ID
```

---

## Testing the Flow

### 1. Check Console Logs
When accessing the draft URL, you should see:
```
Creating dispatcher
Send message via WebSocket: {"draftId":"fd7244b4-...","draftName":null,"requestType":1,"content":{"shapes":[]}}
```

### 2. Monitor WebSocket Traffic
Use browser DevTools → Network → WS tab to see:
- Connection established
- CONNECT message sent (after first interaction)
- Server response with existing shapes

### 3. Verify Draft ID
```typescript
// In browser console
const params = new URLSearchParams(window.location.pathname);
console.log(params);  // Should show draftId
```

---

## Summary

**When accessing** `http://localhost:5173/draft/fd7244b4-f8b0-4d33-bb02-8d56f10f4d99`:

1. ✅ React Router extracts `draftId` from URL
2. ✅ Components mount and WebSocket connects
3. ⏳ **No message sent yet** (waiting for user interaction)
4. 👆 User clicks/draws (first mousedown)
5. 📤 **CONNECT message sent**:
   ```json
   {
     "draftId": "fd7244b4-f8b0-4d33-bb02-8d56f10f4d99",
     "draftName": null,
     "requestType": 1,
     "content": { "shapes": [] }
   }
   ```
6. 📥 Server responds with existing shapes
7. 🎨 Canvas renders the shapes
