import { Check } from "lucide-react";
import { cn } from "#lib/cn";
import type { Phase } from "#models/phase.model.ts";

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

export function RetroHeader() {
  return (
    <header className="flex gap-4 items-center">
      <Stepper currentIndex={0} />
    </header>
  );
}

const Stepper = ({ currentIndex }: { currentIndex: number }) => {
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
                <title>{`Transition to ${PHASE_FLOW[index + 1].label}`}</title>
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
