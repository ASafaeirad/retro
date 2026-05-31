import { Card } from "#components/ui/card.tsx";
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
  { phase: "VOTE", label: "Vote", description: "Vote on tickets" },
  {
    phase: "DISCUSS",
    label: "Discuss",
    description: "Discuss voted items with timer",
  },
];

export function Stepper({ phase }: { phase: Phase }) {
  const currentIndex = PHASE_FLOW.findIndex((p) => p.phase === phase);

  return (
    <Card className="flex-row p-2 gap-0 justify-start">
      {PHASE_FLOW.map((phaseItem, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;
        const isLast = index === PHASE_FLOW.length - 1;

        return (
          <div key={phaseItem.phase} className="flex items-center flex-0">
            <div className="flex flex-col items-center">
              <h3
                className={cn(
                  "rounded flex items-center gap-2 justify-center py-1 px-2 text-sm transition-all text-nowrap",
                  isCompleted && "bg-primary text-emerald-800",
                  isCurrent && "bg-primary text-primary-foreground",
                  isUpcoming && "text-foreground-muted",
                )}
              >
                <div className="w-2">{isCompleted ? <Check /> : index + 1}</div>
                {phaseItem.label}
              </h3>
            </div>

            {!isLast && (
              <Arrow
                className={cn("w-2 mx-2", {
                  "text-foreground-muted": isUpcoming || isCurrent,
                  "text-emerald-800": isCompleted,
                })}
              />
            )}
          </div>
        );
      })}
    </Card>
  );
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" viewBox="0 0 24 21" fill="currentColor" {...props}>
      <title>Check</title>
      <rect x="12" y="13" width="5" height="5" transform="rotate(90 12 13)" />
      <rect x="17" y="8" width="5" height="5" transform="rotate(90 17 8)" />
      <rect x="22" y="3" width="5" height="5" transform="rotate(90 22 3)" />
      <rect x="7" y="8" width="5" height="5" transform="rotate(90 7 8)" />
    </svg>
  );
}

function Arrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 14 21" fill="currentColor" {...props}>
      <title>Separator</title>
      <rect x="9" y="8" width="5" height="5" />
      <rect x="4" y="3" width="5" height="5" />
      <rect x="4" y="13" width="5" height="5" />
    </svg>
  );
}
