import { Check } from "lucide-react";
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
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <h3 className="text-sm">Workflow Control</h3>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-md bg-muted/50 p-3">
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

export const Stepper = ({ currentIndex }: { currentIndex: number }) => {
  return (
    <div className="flex border-border border-2 p-2 rounded bg-card items-center justify-between">
      {PHASE_FLOW.map((phaseItem, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;
        const isLast = index === PHASE_FLOW.length - 1;

        return (
          <div key={phaseItem.phase} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "rounded flex items-center justify-center font-semibold text-sm transition-all",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground",
                  isUpcoming && "text-foreground-muted",
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="px-2">{index + 1}</span>
                )}
                <span className="text-nowrap">{phaseItem.label}</span>
              </div>
            </div>

            {!isLast && (
              <svg
                viewBox="0 0 14 21"
                fill="currentColor"
                className={cn("w-2 mx-2", {
                  "text-foreground-muted": isUpcoming || isCurrent,
                })}
              >
                <rect x="9" y="8" width="5" height="5" />
                <rect x="4" y="3" width="5" height="5" />
                <rect x="4" y="13" width="5" height="5" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};
