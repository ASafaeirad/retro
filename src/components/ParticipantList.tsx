import { useConvexMutation } from "@convex-dev/react-query";
import { Crosshair } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "#components/ui/avatar.tsx";
import { Badge } from "#components/ui/badge.tsx";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import { cn } from "#lib/cn";
import { allMoods, type Mood, moodEmojis, toMood } from "#models/mood.model.ts";
import { Button } from "#ui/button.tsx";

interface Participant {
  _id: Id<"participants">;
  name: string;
  isReady: boolean;
  lastActiveAt: number;
  mood?: Mood;
}

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
  const isScrumMaster = currentUserName === scrumMaster;
  const updateMood = useConvexMutation(api.retro.updateParticipantMood);
  const [editingMoodFor, setEditingMoodFor] = useState<string | null>(null);

  const handleMoodChange = async (participantName: string, mood?: string) => {
    try {
      await updateMood({ sessionId, participantName, mood });
      setEditingMoodFor(null);
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
              {isCurrentUser && editingMoodFor === participant.name ? (
                <div className="flex gap-1">
                  {allMoods.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={() => handleMoodChange(participant.name, option)}
                      title={option}
                    >
                      {moodEmojis[option]}
                    </Button>
                  ))}
                  {participant.mood && (
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={() =>
                        handleMoodChange(participant.name, undefined)
                      }
                      title="Remove mood"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 gap-2 items-center">
                  <Avatar
                    className={cn({ "cursor-pointer": isCurrentUser })}
                    onClick={() => {
                      if (!isCurrentUser) return;
                      setEditingMoodFor(participant.name);
                    }}
                    title={
                      isCurrentUser
                        ? "Click to change mood"
                        : "Previous sprint mood"
                    }
                  >
                    <AvatarFallback>{moodEmojis[mood]}</AvatarFallback>
                  </Avatar>
                  <span className={cn("text-sm")}>{participant.name}</span>
                  {participant.name === scrumMaster && (
                    <Badge size="xs">SM</Badge>
                  )}
                </div>
              )}
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
