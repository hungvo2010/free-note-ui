# WebSocket Payloads Documentation

This document describes all WebSocket message payloads sent during whiteboard shape drawing operations.

## Message Structure

All messages follow this basic structure:
```json
{
  "draftId": "string",      // Current draft identifier
  "draftName": "string",    // Current draft name
  "requestType": number,    // 1 = CONNECT, 2 = DATA
  "content": {
    "type": number,         // 1 = UPDATE
    "details": {
      "op": "string",       // Operation type
      // ... operation-specific data
    }
  }
}
```

## Shape Drawing Operations

### Rectangle Drawing

**Mouse Down (Initial Creation)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "add",
      "shape": {
        "type": "rectangle",
        "data": {
          "id": "rect-001",
          "x": 100,
          "y": 50,
          "width": 0,
          "height": 0
        }
      }
    }
  }
}
```

**Mouse Move (Resize)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "update",
      "id": "rect-001",
      "patch": {
        "type": "rectangle",
        "data": {
          "id": "rect-001",
          "x": 100,
          "y": 50,
          "width": 150,
          "height": 80
        }
      }
    }
  }
}
```

**Mouse Up (Finalize)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "finalize",
      "id": "rect-001"
    }
  }
}
```

### Circle Drawing

**Mouse Down (Initial Creation)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "add",
      "shape": {
        "type": "circle",
        "data": {
          "id": "circle-001",
          "x": 200,
          "y": 150,
          "radius": 0
        }
      }
    }
  }
}
```

**Mouse Move (Resize)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "update",
      "id": "circle-001",
      "patch": {
        "type": "circle",
        "data": {
          "id": "circle-001",
          "x": 200,
          "y": 150,
          "radius": 75
        }
      }
    }
  }
}
```

**Mouse Up (Finalize)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "finalize",
      "id": "circle-001"
    }
  }
}
```

### Line Drawing

**Mouse Down (Initial Creation)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "add",
      "shape": {
        "type": "line",
        "data": {
          "id": "line-001",
          "x1": 50,
          "y1": 100,
          "x2": 50,
          "y2": 100
        }
      }
    }
  }
}
```

**Mouse Move (Extend)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "update",
      "id": "line-001",
      "patch": {
        "type": "line",
        "data": {
          "id": "line-001",
          "x1": 50,
          "y1": 100,
          "x2": 200,
          "y2": 250
        }
      }
    }
  }
}
```

**Mouse Up (Finalize)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "finalize",
      "id": "line-001"
    }
  }
}
```

### Arrow Drawing

**Mouse Down (Initial Creation)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "add",
      "shape": {
        "type": "arrow",
        "data": {
          "id": "arrow-001",
          "x1": 75,
          "y1": 125,
          "x2": 75,
          "y2": 125
        }
      }
    }
  }
}
```

**Mouse Move (Extend)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "update",
      "id": "arrow-001",
      "patch": {
        "type": "arrow",
        "data": {
          "id": "arrow-001",
          "x1": 75,
          "y1": 125,
          "x2": 225,
          "y2": 275
        }
      }
    }
  }
}
```

**Mouse Up (Finalize)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "finalize",
      "id": "arrow-001"
    }
  }
}
```

### Diamond Drawing

**Mouse Down (Initial Creation)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "add",
      "shape": {
        "type": "diamond",
        "data": {
          "id": "diamond-001",
          "x": 300,
          "y": 200,
          "width": 0,
          "height": 0
        }
      }
    }
  }
}
```

**Mouse Move (Resize)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "update",
      "id": "diamond-001",
      "patch": {
        "type": "diamond",
        "data": {
          "id": "diamond-001",
          "x": 300,
          "y": 200,
          "width": 120,
          "height": 80
        }
      }
    }
  }
}
```

**Mouse Up (Finalize)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "finalize",
      "id": "diamond-001"
    }
  }
}
```

### Pen/Freehand Drawing

**Mouse Down (Initial Creation)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "add",
      "shape": {
        "type": "pen",
        "data": {
          "id": "pen-001",
          "points": [[150, 100]]
        }
      }
    }
  }
}
```

**Mouse Move (Add Points)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "update",
      "id": "pen-001",
      "patch": {
        "type": "pen",
        "data": {
          "id": "pen-001",
          "points": [[150, 100], [155, 105], [160, 110], [165, 115]]
        }
      }
    }
  }
}
```

**Mouse Up (Finalize)**
```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "finalize",
      "id": "pen-001"
    }
  }
}
```

## Special Operations

### Create New Draft

```json
{
  "requestType": 1,
  "content": {
    "type": 1,
    "details": {
      "op": "creating"
    }
  }
}
```

### Delete Shapes (Eraser Tool)

```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "delete",
      "ids": ["rect-001", "circle-001"]
    }
  }
}
```

### Pan Canvas

```json
{
  "draftId": "draft-123",
  "draftName": "My Draft",
  "requestType": 2,
  "content": {
    "type": 1,
    "details": {
      "op": "pan",
      "offset": {
        "x": 50,
        "y": -25
      }
    }
  }
}
```

## Request Types

- `1` = `CONNECT` - Used for draft creation
- `2` = `DATA` - Used for all shape operations

## Operation Types

- `add` - Create new shape
- `update` - Modify existing shape
- `finalize` - Complete shape drawing
- `delete` - Remove shapes
- `creating` - Create new draft
- `pan` - Move canvas viewport

## Shape Type Mappings

- `rect` → `rectangle`
- `circle` → `circle`
- `line` → `line`
- `arrow` → `arrow`
- `pen` → `pen` (freehand drawing)
- `diam` → `diamond`