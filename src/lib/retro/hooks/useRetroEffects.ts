import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import type { Id } from "#convex/models";
import { getStoredSession } from "../../participantAuth";

interface UseRetroEffectsProps {
  sessionId: Id<"sessions">;
  name?: string;
  updateHeartbeat: any;
}

export function useRetroEffects(props: UseRetroEffectsProps) {
  const { sessionId, name, updateHeartbeat } = props;
  const navigate = useNavigate();

  // Auto-rejoin logic: If no name in URL, check localStorage for stored session
  useEffect(() => {
    if (!name) {
      const stored = getStoredSession(sessionId);
      if (stored) {
        navigate({
          to: `/retro/${sessionId}`,
          search: { name: stored.name },
          replace: true,
        });
      }
    }
  }, [name, sessionId, navigate]);

  // Heartbeat system: Send heartbeat every 30 seconds to update lastActiveAt
  useEffect(() => {
    if (!name) return;

    // Send initial heartbeat
    updateHeartbeat({ sessionId, participantName: name }).catch(
      (error: Error) => {
        console.error("Failed to send heartbeat:", error);
      },
    );

    // Set up interval for periodic heartbeats
    const heartbeatInterval = setInterval(() => {
      updateHeartbeat({ sessionId, participantName: name }).catch(
        (error: Error) => {
          console.error("Failed to send heartbeat:", error);
        },
      );
    }, 30000); // 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [name, sessionId, updateHeartbeat]);
}
