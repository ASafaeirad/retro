import type { Phase } from "#models/phase.model.ts";
import { Button } from "#ui/button.tsx";
import { Card, CardBlock, CardContent, CardHeader } from "./ui/card";

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
}: PhaseControlsProps) {
  const currentIndex = PHASE_FLOW.findIndex((p) => p.phase === currentPhase);
  const nextPhase = PHASE_FLOW[currentIndex + 1];
  const prevPhase = PHASE_FLOW[currentIndex - 1];

  return (
    <Card space="compact">
      <CardHeader>
        <h3>Workflow Control</h3>
      </CardHeader>
      <CardContent>
        <CardBlock>
          <div className="text-xs font-medium text-muted-foreground">
            Current Phase
          </div>
          <div className="text-sm font-semibold">
            {PHASE_FLOW[currentIndex].label}
          </div>
          <div className="text-xs text-muted-foreground">
            {PHASE_FLOW[currentIndex].description}
          </div>
        </CardBlock>

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
