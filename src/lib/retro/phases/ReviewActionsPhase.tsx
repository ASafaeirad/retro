import { ActionItemPanel } from "#components/ActionItemPanel.tsx";
import type { Id } from "#convex/models";

interface ReviewActionsPhaseProps {
  sprintNumber: number;
  actionItems?: any[];
  participants: any[];
  onToggleComplete: (id: Id<"actionItems">) => void;
}

export function ReviewActionsPhase({
  sprintNumber,
  actionItems,
  participants,
  onToggleComplete,
}: ReviewActionsPhaseProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 rounded-lg border p-6">
        <h2 className="mb-2 text-2xl font-bold">Review Action Items</h2>
        <p>Review action items from Sprint {sprintNumber - 1}</p>
      </div>

      {actionItems && actionItems.length > 0 ? (
        <ActionItemPanel
          actionItems={actionItems}
          participants={participants}
          onToggleComplete={onToggleComplete}
        />
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <p>No action items from previous sprint</p>
        </div>
      )}
    </div>
  );
}
