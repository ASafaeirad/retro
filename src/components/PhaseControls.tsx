import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import { Card, CardContent, CardHeader } from "./ui/card";

type Phase =
  | "REVIEW_ACTIONS"
  | "ADD_TICKETS"
  | "PRESENT"
  | "GROUP"
  | "VOTE"
  | "DISCUSS";

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
    <Card className={cn("gap-2 py-2 pb-4", className)}>
      <CardHeader>
        <h3 className="text-sm">Workflow Control</h3>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="rounded-md bg-muted/50 p-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Current Phase
          </div>
          <div className="text-sm font-semibold">
            {PHASE_FLOW[currentIndex].label}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {PHASE_FLOW[currentIndex].description}
          </div>
        </div>

        <div className="flex gap-2">
          {prevPhase && (
            <Button
              onClick={() => onPhaseChange(prevPhase.phase)}
              variant="neutral"
              size="sm"
              className="flex-1"
            >
              ← Back
            </Button>
          )}

          {nextPhase && (
            <Button
              onClick={() => onPhaseChange(nextPhase.phase)}
              disabled={!canAdvance}
              size="sm"
              className="flex-1"
            >
              {nextPhase.label} →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
