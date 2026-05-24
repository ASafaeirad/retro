import { useConvexMutation } from "@convex-dev/react-query";
import { Crosshair } from "lucide-react";
import { useState } from "react";
import { Badge } from "#components/ui/badge.tsx";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import { cn } from "#lib/cn";
import { toMood } from "#models/mood.model.tsx";
import type { Participant } from "#models/participant.ts";
import { Button } from "#ui/button.tsx";
import { ParticipantMood } from "./ParticipantMood";

interface ParticipantListProps {
  participants: Participant[];
  scrumMaster: string;
  currentPresenter?: string;
  currentUserName?: string;
  sessionId: Id<"sessions">;
  onSelectPresenter?: (name: string) => void;
  onLeaveSession?: () => void;
  onRemoveParticipant?: (participantId: Id<"participants">) => void;
  className?: string;
}

const INACTIVE_THRESHOLD = 2 * 60 * 1000; // 2 minutes in milliseconds

function isParticipantActive(lastActiveAt: number): boolean {
  return Date.now() - lastActiveAt < INACTIVE_THRESHOLD;
}

export function ParticipantList({
  participants,
  scrumMaster,
  currentPresenter,
  currentUserName,
  sessionId,
  onSelectPresenter,
  onLeaveSession,
  onRemoveParticipant,
  className,
}: ParticipantListProps) {
  const updateMood = useConvexMutation(api.retro.updateParticipantMood);
  const [editingMoodFor, setEditingMoodFor] = useState<string>();

  const handleMoodChange = async (participantName: string, mood?: string) => {
    try {
      await updateMood({ sessionId, participantName, mood });
      setEditingMoodFor(undefined);
    } catch (error) {
      console.error("Failed to update mood:", error);
    }
  };

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3 className="mb-3 text-sm font-semibold">Participants</h3>

      <div className="space-y-2">
        {participants.map((participant) => {
          const isActive = isParticipantActive(participant.lastActiveAt);
          const isCurrentUser = participant.name === currentUserName;
          const mood = toMood(participant.mood);

          const isScrumMaster = participant.name === scrumMaster;
          return (
            <div
              key={participant._id}
              onClick={() => onSelectPresenter?.(participant.name)}
              className={cn(
                "rounded border py-2 px-3 flex items-center gap-2",
                {
                  "cursor-pointer": onSelectPresenter,
                  "ring-2": onSelectPresenter && isCurrentUser,
                  "opacity-50": onSelectPresenter,
                },
              )}
            >
              <div className="flex flex-1 gap-2 items-center">
                <ParticipantMood
                  mood={mood}
                  disabled={!isCurrentUser}
                  onSelect={(newMood) => {
                    handleMoodChange(participant.name, newMood);
                  }}
                />
                <span className="text-sm">{participant.name}</span>
                {isScrumMaster && (
                  <Badge variant="secondary" title="Scrum Master" size="sm">
                    SM
                  </Badge>
                )}
              </div>

              {isScrumMaster && !isCurrentUser && !isActive && (
                <Button
                  onClick={() => {
                    onRemoveParticipant?.(participant._id);
                  }}
                  variant="danger"
                  shadow="reverse"
                  size="xs"
                  title="Remove participant"
                >
                  <Crosshair />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {participants.length > 0 && (
        <div className="mt-4 text-xs">
          {participants.filter((p) => p.isReady).length} / {participants.length}{" "}
          ready
        </div>
      )}

      {/* Leave session button */}
      {onLeaveSession && (
        <Button
          type="button"
          onClick={onLeaveSession}
          variant="neutral"
          className="mt-4 w-full"
        >
          Leave Session
        </Button>
      )}
    </div>
  );
}
