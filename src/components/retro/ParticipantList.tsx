import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import type { Id } from "../../../convex/_generated/dataModel";

interface Participant {
  _id: Id<"participants">;
  name: string;
  isReady: boolean;
  lastActiveAt: number;
}

interface ParticipantListProps {
  participants: Participant[];
  scrumMaster: string;
  currentPresenter?: string;
  currentUserName?: string;
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
  onSelectPresenter,
  onLeaveSession,
  onRemoveParticipant,
  className,
}: ParticipantListProps) {
  const isScrumMaster = currentUserName === scrumMaster;

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4",
        className,
      )}
    >
      <h3 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">
        Participants ({participants.length})
      </h3>

      <div className="space-y-2">
        {participants.map((participant) => {
          const isActive = isParticipantActive(participant.lastActiveAt);
          const isCurrentUser = participant.name === currentUserName;

          return (
            <div
              key={participant._id}
              onClick={() => onSelectPresenter?.(participant.name)}
              className={cn(
                "flex items-center justify-between rounded-md border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 transition-colors",
                onSelectPresenter &&
                  "cursor-pointer hover:bg-[var(--link-bg-hover)]",
                currentPresenter === participant.name &&
                  "ring-2 ring-[var(--lagoon)] border-[var(--lagoon)]",
                !isActive && "opacity-50",
              )}
            >
              <div className="flex items-center gap-2">
                {/* Active/Ready status indicator */}
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    !isActive
                      ? "bg-[var(--sand)]" // Inactive (gray)
                      : participant.isReady
                        ? "bg-[var(--lagoon)]" // Ready (blue)
                        : "bg-[var(--palm)]", // Active but not ready (green)
                  )}
                />

                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm",
                      isActive
                        ? "text-[var(--sea-ink)]"
                        : "text-[var(--sea-ink-soft)]",
                    )}
                  >
                    {participant.name}
                    {participant.name === scrumMaster && (
                      <span className="ml-2 text-xs text-[var(--kicker)] font-medium">
                        (SM)
                      </span>
                    )}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-[var(--sea-ink-soft)] font-medium">
                        (You)
                      </span>
                    )}
                  </span>
                  {!isActive && (
                    <span className="text-xs text-[var(--sea-ink-soft)]">
                      Disconnected
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {participant.isReady && isActive && (
                  <span className="text-xs text-[var(--lagoon)] font-medium">
                    Ready
                  </span>
                )}

                {/* Remove button for scrum master */}
                {isScrumMaster &&
                  !isCurrentUser &&
                  onRemoveParticipant &&
                  !isActive && (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveParticipant(participant._id);
                      }}
                      variant="neutral"
                      size="sm"
                      title="Remove participant"
                    >
                      Remove
                    </Button>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {participants.length > 0 && (
        <div className="mt-4 text-xs text-[var(--sea-ink-soft)]">
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
          size="sm"
          className="mt-4 w-full"
        >
          Leave Session
        </Button>
      )}
    </div>
  );
}
