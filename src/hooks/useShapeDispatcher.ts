import { ShapeEventDispatcher } from "apis/resources/ShapeEventDispatcher";
import { WebSocketConnection } from "apis/resources/connection/WebSocketConnection";
import { EventHandlerCoordinator } from "apis/resources/event/EventHandlerCoordinator";
import { ReDrawController } from "main/ReDrawController";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
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
  const eventHandlerRef = useRef<EventHandlerCoordinator | null>(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);

  // Keep navigate ref up to date
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    if (!webSocketConnection) {
      return;
    }

    // Cleanup previous handlers if they exist
    if (eventHandlerRef.current) {
      eventHandlerRef.current.unregister();
      eventHandlerRef.current = null;
    }

    // Create or update dispatcher
    if (!dispatcherRef.current) {
      console.log(
        "Creating dispatcher => connection status: " +
          webSocketConnection.isHealthy(),
      );
      dispatcherRef.current = new ShapeEventDispatcher(webSocketConnection, {
        draftId,
        draftName,
      });
    } else {
      // Update existing dispatcher with new draft info
      dispatcherRef.current.setDraft({
        draftId,
        draftName,
      });
    }

    // Always create new event handler with current draftId
    eventHandlerRef.current = new EventHandlerCoordinator({
      draftId: draftId || "",
      roughCanvas,
      reDrawController,
      onDraftChange: (newDraftId) =>
        navigateRef.current(`/draft/${newDraftId}`),
    });
    eventHandlerRef.current.register(dispatcherRef.current);

    return () => {
      if (eventHandlerRef.current) {
        eventHandlerRef.current.unregister();
      }
    };
  }, [webSocketConnection, draftId, draftName, roughCanvas, reDrawController]);

  return dispatcherRef.current;
}
