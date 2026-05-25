import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Crosshair, LogOut } from "lucide-react";
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
import { clearSession } from "../../lib/participantAuth";
import { ParticipantMood } from "./ParticipantMood";

interface Props {
  participants: Participant[];
  scrumMaster: string;
  currentUserName?: string;
  sessionId: Id<"sessions">;
  onSelectPresenter?: (name: string) => void;
  className?: string;
  title: string;
}

export function ParticipantList({
  title,
  participants,
  scrumMaster,
  currentUserName,
  sessionId,
  onSelectPresenter,
  className,
}: Props) {
  const updateMood = useMutation(api.retro.updateParticipantMood);
  const leaveSessionMutation = useMutation(api.retro.leaveSession);
  const removeParticipantMutation = useMutation(api.retro.removeParticipant);
  const navigate = useNavigate();
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

  const leaveSession = async (name: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this session? You can rejoin later with the same name.",
    );
    if (!confirmed) return;

    try {
      await leaveSessionMutation({ sessionId, participantName: name });
      clearSession(sessionId);
      navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to leave session:", error);
      alert("Failed to leave session. Please try again.");
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
    <Card className={cn("gap-2 py-2", className)}>
      <CardHeader>
        <h3 className="text-sm font-semibold">{title}</h3>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="border rounded">
          {participants.map((participant) => {
            const isActive = isParticipantActive(participant.lastActiveAt);
            const mood = toMood(participant.mood);
            const isCurrentUser = participant.name === currentUserName;
            const canKick = isScrumMaster && !isCurrentUser && !isActive;

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
                  "ring-2": onSelectPresenter && isCurrentUser,
                  "opacity-50": onSelectPresenter,
                  "border-b border-b-border ":
                    participant._id !==
                    participants[participants.length - 1]._id,
                })}
              >
                <div className={cn("flex flex-1 gap-2 items-center")}>
                  <ParticipantMood
                    isInactive={!isActive}
                    mood={mood}
                    disabled={!isCurrentUser}
                    onSelect={(newMood) => {
                      handleMoodChange(participant.name, newMood);
                    }}
                  />
                  <span
                    className={cn("text-sm", {
                      "text-foreground-muted": !isActive,
                    })}
                  >
                    {participant.name}
                  </span>
                  {participant.name === scrumMaster && (
                    <Badge variant="secondary" title="Scrum Master" size="sm">
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
                {isCurrentUser && (
                  <Button
                    size="icon"
                    onClick={() => leaveSession(participant.name)}
                    variant="danger"
                    shadow="reverse"
                    title="Leave session"
                  >
                    <LogOut />
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
