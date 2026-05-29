import { useMutation } from "convex/react";
import { Crosshair } from "lucide-react";
import { Badge } from "#components/ui/badge.tsx";
import { Card, CardContent, CardHeader } from "#components/ui/card.tsx";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import { cn } from "#lib/cn";
import { toMood } from "#models/mood.model.tsx";
import {
  isParticipantActive,
  type Participant,
} from "#models/participant.model.ts";
import { Button } from "#ui/button.tsx";
import { ParticipantMood } from "./ParticipantMood";

interface Props {
  participants: Participant[];
  scrumMaster: string;
  currentUserName?: string;
  sessionId: Id<"sessions">;
  onSelectPresenter?: (name: string) => void;
  selectedParticipant?: string;
}

export function ParticipantList({
  participants,
  scrumMaster,
  currentUserName,
  sessionId,
  onSelectPresenter,
  selectedParticipant,
}: Props) {
  const updateMood = useMutation(api.retro.updateParticipantMood);
  const removeParticipantMutation = useMutation(api.retro.removeParticipant);
  const isScrumMaster = currentUserName === scrumMaster;

  const kick = async (participantId: Id<"participants">) => {
    if (!isScrumMaster) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this participant?",
    );
    if (!confirmed) return;

    try {
      await removeParticipantMutation({
        participantId,
        requestedBy: currentUserName,
      });
    } catch (error) {
      console.error("Failed to remove participant:", error);
      alert("Failed to remove participant. Please try again.");
    }
  };

  const handleMoodChange = async (participantName: string, mood?: string) => {
    try {
      await updateMood({ sessionId, participantName, mood });
    } catch (error) {
      console.error("Failed to update mood:", error);
    }
  };

  return (
    <Card space="compact">
      <CardHeader>
        <h3>Participants</h3>
      </CardHeader>
      <CardContent>
        <div className="border rounded">
          {participants.map((participant) => {
            const isActive = isParticipantActive(participant.lastActiveAt);
            const mood = toMood(participant.mood);
            const isFocused = participant.name === selectedParticipant;
            const canKick = isScrumMaster && !isFocused && !isActive;
            const isMe = participant.name === currentUserName;

            return (
              // biome-ignore lint/a11y/useSemanticElements: We have a nested button
              <div
                role="button"
                key={participant._id}
                onClick={() => onSelectPresenter?.(participant.name)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectPresenter?.(participant.name);
                  }
                }}
                className={cn("py-2 px-3 flex", {
                  "cursor-pointer": onSelectPresenter,
                  "bg-secondary-background": onSelectPresenter && isFocused,
                  "border-b border-b-border ":
                    participant._id !==
                    participants[participants.length - 1]._id,
                })}
              >
                <div className={cn("flex flex-1 gap-2 items-center")}>
                  <ParticipantMood
                    isInactive={!isActive}
                    mood={mood}
                    disabled={!isMe}
                    onSelect={(newMood) =>
                      handleMoodChange(participant.name, newMood)
                    }
                  />
                  <span
                    className={cn("text-sm", {
                      "text-foreground-muted": !isActive,
                    })}
                  >
                    {participant.name}
                  </span>
                  {participant.name === scrumMaster && (
                    <Badge variant="secondary" title="Scrum Master" size="xs">
                      SM
                    </Badge>
                  )}
                </div>

                {canKick && (
                  <Button
                    onClick={() => kick(participant._id)}
                    variant="danger"
                    shadow="reverse"
                    size="icon"
                    title="Remove participant"
                  >
                    <Crosshair />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs">
          {participants.filter((p) => p.isReady).length} / {participants.length}{" "}
          ready
        </div>
      </CardContent>
    </Card>
  );
}
