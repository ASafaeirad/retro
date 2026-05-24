import { useNavigate } from "@tanstack/react-router";
import { Button } from "#ui/button.tsx";

interface RetroHeaderProps {
  sprintNumber: number;
  phase: string;
  userName: string;
}

export function RetroHeader({
  sprintNumber,
  phase,
  userName,
}: RetroHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold">Sprint {sprintNumber} Retro</h1>
        <p className="mt-1 text-sm">
          Phase: {phase.replace("_", " ")} • Logged in as: {userName}
        </p>
      </div>

      <Button onClick={() => navigate({ to: "/" })} variant="neutral">
        ← Back
      </Button>
    </div>
  );
}
