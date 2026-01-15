import React, { useState } from 'react';
import './WebSocketPlayground.scss';

interface PayloadExample {
  title: string;
  description: string;
  payload: any;
}

const WebSocketPlayground: React.FC = () => {
  const [selectedShape, setSelectedShape] = useState<string>("rectangle");
  const [selectedEvent, setSelectedEvent] = useState<string>("mousedown");

  const payloadExamples: Record<string, Record<string, PayloadExample>> = {
    rectangle: {
      mousedown: {
        title: "Rectangle - Mouse Down",
        description: "Initial creation of rectangle shape",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "add",
              shape: {
                type: "rectangle",
                data: {
                  id: "rect-001",
                  x: 100,
                  y: 50,
                  width: 0,
                  height: 0,
                },
              },
            },
          },
        },
      },
      mousemove: {
        title: "Rectangle - Mouse Move",
        description: "Resizing rectangle during drag",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "update",
              id: "rect-001",
              patch: {
                type: "rectangle",
                data: {
                  id: "rect-001",
                  x: 100,
                  y: 50,
                  width: 150,
                  height: 80,
                },
              },
            },
          },
        },
      },
      mouseup: {
        title: "Rectangle - Mouse Up",
        description: "Finalizing rectangle shape",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "finalize",
              id: "rect-001",
            },
          },
        },
      },
    },
    circle: {
      mousedown: {
        title: "Circle - Mouse Down",
        description: "Initial creation of circle shape",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "add",
              shape: {
                type: "circle",
                data: {
                  id: "circle-001",
                  x: 200,
                  y: 150,
                  radius: 0,
                },
              },
            },
          },
        },
      },
      mousemove: {
        title: "Circle - Mouse Move",
        description: "Resizing circle during drag",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "update",
              id: "circle-001",
              patch: {
                type: "circle",
                data: {
                  id: "circle-001",
                  x: 200,
                  y: 150,
                  radius: 75,
                },
              },
            },
          },
        },
      },
      mouseup: {
        title: "Circle - Mouse Up",
        description: "Finalizing circle shape",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "finalize",
              id: "circle-001",
            },
          },
        },
      },
    },
    line: {
      mousedown: {
        title: "Line - Mouse Down",
        description: "Initial creation of line shape",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "add",
              shape: {
                type: "line",
                data: {
                  id: "line-001",
                  x1: 50,
                  y1: 100,
                  x2: 50,
                  y2: 100,
                },
              },
            },
          },
        },
      },
      mousemove: {
        title: "Line - Mouse Move",
        description: "Extending line during drag",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "update",
              id: "line-001",
              patch: {
                type: "line",
                data: {
                  id: "line-001",
                  x1: 50,
                  y1: 100,
                  x2: 200,
                  y2: 250,
                },
              },
            },
          },
        },
      },
      mouseup: {
        title: "Line - Mouse Up",
        description: "Finalizing line shape",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "finalize",
              id: "line-001",
            },
          },
        },
      },
    },
    arrow: {
      mousedown: {
        title: "Arrow - Mouse Down",
        description: "Initial creation of arrow shape",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "add",
              shape: {
                type: "arrow",
                data: {
                  id: "arrow-001",
                  x1: 75,
                  y1: 125,
                  x2: 75,
                  y2: 125,
                },
              },
            },
          },
        },
      },
      mousemove: {
        title: "Arrow - Mouse Move",
        description: "Extending arrow during drag",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "update",
              id: "arrow-001",
              patch: {
                type: "arrow",
                data: {
                  id: "arrow-001",
                  x1: 75,
                  y1: 125,
                  x2: 225,
                  y2: 275,
                },
              },
            },
          },
        },
      },
      mouseup: {
        title: "Arrow - Mouse Up",
        description: "Finalizing arrow shape",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "finalize",
              id: "arrow-001",
            },
          },
        },
      },
    },
    diamond: {
      mousedown: {
        title: "Diamond - Mouse Down",
        description: "Initial creation of diamond shape",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "add",
              shape: {
                type: "diamond",
                data: {
                  id: "diamond-001",
                  x: 300,
                  y: 200,
                  width: 0,
                  height: 0,
                },
              },
            },
          },
        },
      },
      mousemove: {
        title: "Diamond - Mouse Move",
        description: "Resizing diamond during drag",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "update",
              id: "diamond-001",
              patch: {
                type: "diamond",
                data: {
                  id: "diamond-001",
                  x: 300,
                  y: 200,
                  width: 120,
                  height: 80,
                },
              },
            },
          },
        },
      },
      mouseup: {
        title: "Diamond - Mouse Up",
        description: "Finalizing diamond shape",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "finalize",
              id: "diamond-001",
            },
          },
        },
      },
    },
    pen: {
      mousedown: {
        title: "Pen - Mouse Down",
        description: "Initial creation of freehand drawing",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "add",
              shape: {
                type: "pen",
                data: {
                  id: "pen-001",
                  points: [[150, 100]],
                },
              },
            },
          },
        },
      },
      mousemove: {
        title: "Pen - Mouse Move",
        description: "Adding points during freehand drawing",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "update",
              id: "pen-001",
              patch: {
                type: "pen",
                data: {
                  id: "pen-001",
                  points: [
                    [150, 100],
                    [155, 105],
                    [160, 110],
                    [165, 115],
                  ],
                },
              },
            },
          },
        },
      },
      mouseup: {
        title: "Pen - Mouse Up",
        description: "Finalizing freehand drawing",
        payload: {
          draftId: "draft-123",
          draftName: "My Draft",
          requestType: 2,
          content: {
            type: 1,
            details: {
              op: "finalize",
              id: "pen-001",
            },
          },
        },
      },
    },
  };

  const specialOperations = {
    createDraft: {
      title: "Create New Draft",
      description: "Initialize a new whiteboard draft",
      payload: {
        requestType: 1,
        content: {
          type: 1,
          details: {
            op: "creating",
          },
        },
      },
    },
    deleteShapes: {
      title: "Delete Shapes (Eraser)",
      description: "Remove shapes using eraser tool",
      payload: {
        draftId: "draft-123",
        draftName: "My Draft",
        requestType: 2,
        content: {
          type: 1,
          details: {
            op: "delete",
            ids: ["rect-001", "circle-001"],
          },
        },
      },
    },
    panCanvas: {
      title: "Pan Canvas",
      description: "Move the canvas viewport",
      payload: {
        draftId: "draft-123",
        draftName: "My Draft",
        requestType: 2,
        content: {
          type: 1,
          details: {
            op: "pan",
            offset: {
              x: 50,
              y: -25,
            },
          },
        },
      },
    },
  };

  const copyToClipboard = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  const currentPayload = payloadExamples[selectedShape]?.[selectedEvent];

  return (
    <div className="websocket-playground">
      <div className="playground-header">
        <h1>WebSocket Payloads Playground</h1>
        <p>
          Interactive viewer for all WebSocket message payloads sent during
          whiteboard operations
        </p>
      </div>

      <div className="playground-content">
        <div className="controls-section">
          <div className="control-group">
            <label>Shape Type:</label>
            <select
              value={selectedShape}
              onChange={(e) => setSelectedShape(e.target.value)}
              className="shape-selector"
            >
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
              <option value="line">Line</option>
              <option value="arrow">Arrow</option>
              <option value="diamond">Diamond</option>
              <option value="pen">Pen/Freehand</option>
            </select>
          </div>

          <div className="control-group">
            <label>Mouse Event:</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="event-selector"
            >
              <option value="mousedown">Mouse Down</option>
              <option value="mousemove">Mouse Move</option>
              <option value="mouseup">Mouse Up</option>
            </select>
          </div>
        </div>

        {currentPayload && (
          <div className="payload-section">
            <div className="payload-header">
              <h3>{currentPayload.title}</h3>
              <p>{currentPayload.description}</p>
              <button
                onClick={() => copyToClipboard(currentPayload.payload)}
                className="copy-button"
              >
                Copy JSON
              </button>
            </div>
            <pre className="payload-display">
              <code>{JSON.stringify(currentPayload.payload, null, 2)}</code>
            </pre>
          </div>
        )}

        <div className="special-operations">
          <h2>Special Operations</h2>
          <div className="operations-grid">
            {Object.entries(specialOperations).map(([key, operation]) => (
              <div key={key} className="operation-card">
                <div className="operation-header">
                  <h4>{operation.title}</h4>
                  <p>{operation.description}</p>
                  <button
                    onClick={() => copyToClipboard(operation.payload)}
                    className="copy-button"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="operation-payload">
                  <code>{JSON.stringify(operation.payload, null, 2)}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>

        <div className="reference-section">
          <h2>Reference</h2>
          <div className="reference-grid">
            <div className="reference-card">
              <h4>Request Types</h4>
              <ul>
                <li>
                  <code>1</code> = CONNECT (Draft creation)
                </li>
                <li>
                  <code>2</code> = DATA (Shape operations)
                </li>
              </ul>
            </div>
            <div className="reference-card">
              <h4>Operation Types</h4>
              <ul>
                <li>
                  <code>add</code> - Create new shape
                </li>
                <li>
                  <code>update</code> - Modify existing shape
                </li>
                <li>
                  <code>finalize</code> - Complete shape drawing
                </li>
                <li>
                  <code>delete</code> - Remove shapes
                </li>
                <li>
                  <code>creating</code> - Create new draft
                </li>
                <li>
                  <code>pan</code> - Move canvas viewport
                </li>
              </ul>
            </div>
            <div className="reference-card">
              <h4>Shape Mappings</h4>
              <ul>
                <li>
                  <code>rect</code> → rectangle
                </li>
                <li>
                  <code>circle</code> → circle
                </li>
                <li>
                  <code>line</code> → line
                </li>
                <li>
                  <code>arrow</code> → arrow
                </li>
                <li>
                  <code>pen</code> → pen
                </li>
                <li>
                  <code>diam</code> → diamond
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketPlayground;
