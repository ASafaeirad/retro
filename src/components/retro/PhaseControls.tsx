import { cn } from "#lib/cn";

type Phase =
  | "REVIEW_ACTIONS"
  | "ADD_TICKETS"
  | "PRESENT"
  | "GROUP"
  | "VOTE"
  | "DISCUSS"
  | "COMPLETED";

interface PhaseControlsProps {
  currentPhase: Phase;
  onPhaseChange: (phase: Phase) => void;
  canAdvance?: boolean;
  className?: string;
}

const PHASE_FLOW: { phase: Phase; label: string; description: string }[] = [
  {
    phase: "REVIEW_ACTIONS",
    label: "Review Actions",
    description: "Review previous sprint action items",
  },
  {
    phase: "ADD_TICKETS",
    label: "Add Tickets",
    description: "Add tickets to the board",
  },
  {
    phase: "PRESENT",
    label: "Present",
    description: "Present tickets one by one",
  },
  { phase: "GROUP", label: "Group", description: "Group related tickets" },
  { phase: "VOTE", label: "Vote", description: "Vote on tickets and groups" },
  {
    phase: "DISCUSS",
    label: "Discuss",
    description: "Discuss voted items with timer",
  },
  {
    phase: "COMPLETED",
    label: "Complete",
    description: "Mark retro as completed",
  },
];

export function PhaseControls({
  currentPhase,
  onPhaseChange,
  canAdvance = true,
  className,
}: PhaseControlsProps) {
  const currentIndex = PHASE_FLOW.findIndex((p) => p.phase === currentPhase);
  const nextPhase = PHASE_FLOW[currentIndex + 1];
  const prevPhase = PHASE_FLOW[currentIndex - 1];

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4",
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--sea-ink)]">
          Workflow Control
        </h3>
        <p className="text-xs text-[var(--sea-ink-soft)] mt-1">
          Scrum Master Only
        </p>
      </div>

      {/* Current phase */}
      <div className="mb-4 rounded-md border-2 border-[var(--lagoon)] bg-[var(--chip-bg)] p-3">
        <div className="text-xs text-[var(--kicker)] font-medium mb-1">
          Current Phase
        </div>
        <div className="text-sm font-semibold text-[var(--sea-ink)]">
          {PHASE_FLOW[currentIndex].label}
        </div>
        <div className="text-xs text-[var(--sea-ink-soft)] mt-1">
          {PHASE_FLOW[currentIndex].description}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2">
        {prevPhase && (
          <button
            onClick={() => onPhaseChange(prevPhase.phase)}
            className="flex-1 rounded-md border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 text-xs font-medium text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]"
          >
            ← Back
          </button>
        )}

        {nextPhase && (
          <button
            onClick={() => onPhaseChange(nextPhase.phase)}
            disabled={!canAdvance}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-xs font-medium text-white transition-colors",
              canAdvance
                ? "bg-[var(--lagoon)] hover:bg-[var(--lagoon-deep)]"
                : "bg-[var(--line)] cursor-not-allowed",
            )}
          >
            {nextPhase.label} →
          </button>
        )}
      </div>

      {/* Phase progress */}
      <div className="mt-4 space-y-1">
        {PHASE_FLOW.map((phase, index) => (
          <div
            key={phase.phase}
            className={cn(
              "flex items-center gap-2 text-xs",
              index === currentIndex && "font-medium text-[var(--lagoon)]",
              index < currentIndex && "text-[var(--sea-ink-soft)] line-through",
              index > currentIndex && "text-[var(--sea-ink-soft)]",
            )}
          >
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                index === currentIndex && "bg-[var(--lagoon)]",
                index < currentIndex && "bg-[var(--palm)]",
                index > currentIndex && "bg-[var(--line)]",
              )}
            />
            <span>{phase.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
