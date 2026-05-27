import { useMutation, useQuery } from "convex/react";
import { ActionItemPanel } from "#components/ActionItemPanel.tsx";
import { api } from "#convex/api";

interface ReviewActionsPhaseProps {
  sprintNumber: number;
}

export function ReviewActionsPhase({ sprintNumber }: ReviewActionsPhaseProps) {
  const prevSprint = useQuery(api.retro.getSessionBySprintId, {
    sprintNumber: sprintNumber - 1,
  });
  const toggleActionItemComplete = useMutation(
    api.retro.toggleActionItemComplete,
  );

  return prevSprint ? (
    <ActionItemPanel
      sessionId={prevSprint._id}
      // onToggleComplete={toggleActionItemComplete}
    >
      <p className="text-sm text-foreground-muted">
        Review action items from Sprint {sprintNumber - 1}
      </p>
    </ActionItemPanel>
  ) : null;
}
