import { ShapeEventDispatcher } from "apis/resources/ShapeEventDispatcher";
import { WebSocketConnection } from "apis/resources/connection/SocketConnection";
import { ShapeEventHandler } from "apis/resources/event/ShapeEventHandler";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ReDrawController } from "main/ReDrawController";
import { RoughCanvas } from "roughjs/bin/canvas";

interface UseShapeDispatcherProps {
  webSocketConnection: WebSocketConnection | null;
  draftId: string | undefined;
  draftName: string | undefined;
  roughCanvas: RoughCanvas | undefined;
  reDrawController: ReDrawController;
}

export function useShapeDispatcher({
  webSocketConnection,
  draftId,
  draftName,
  roughCanvas,
  reDrawController,
}: UseShapeDispatcherProps) {
  const dispatcherRef = useRef<ShapeEventDispatcher | null>(null);
  const eventHandlerRef = useRef<ShapeEventHandler | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!webSocketConnection || dispatcherRef.current || !draftId || !draftName) {
      return;
    }

    console.log("Creating dispatcher");
    dispatcherRef.current = new ShapeEventDispatcher(webSocketConnection, {
      draftId,
      draftName,
    });

    eventHandlerRef.current = new ShapeEventHandler({
      draftId,
      roughCanvas,
      reDrawController,
      onDraftChange: (newDraftId) => navigate(`/draft/${newDraftId}`),
    });

    // Register observers BEFORE checking connection health
    // This ensures observers are ready when connection opens
    eventHandlerRef.current.setupHandlers(dispatcherRef.current);

    // No manual fallback needed - ConnectionReadySubject will replay if already connected
    // The observer pattern handles both cases:
    // 1. Connection opens later -> observer gets notified via onopen event
    // 2. Connection already open -> observer gets notified immediately via replay

    return () => {
      if (eventHandlerRef.current) {
        eventHandlerRef.current.cleanup();
      }
    };
  }, [webSocketConnection, draftId, draftName, navigate, roughCanvas, reDrawController]);

  return dispatcherRef;
}
