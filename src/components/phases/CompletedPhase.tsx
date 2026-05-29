import { useNavigate } from "@tanstack/react-router";
import { Button } from "#ui/button.tsx";

interface CompletedPhaseProps {
  sprintNumber: number;
}

export function CompletedPhase({ sprintNumber }: CompletedPhaseProps) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="rounded-lg border p-12">
        <h2 className="mb-4 text-3xl font-bold">Retro Completed! 🎉</h2>
        <p className="mb-6">Sprint {sprintNumber} retrospective is complete</p>
        <Button onClick={() => navigate({ to: "/" })}>Back to Sessions</Button>
      </div>
    </div>
  );
}
