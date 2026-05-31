import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "#components/ui/card.tsx";
import { Button } from "#ui/button.tsx";

interface CompletedPhaseProps {
  sprintNumber: number;
}

export function CompletedPhase({ sprintNumber }: CompletedPhaseProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <h2>Retro Completed! 🎉</h2>
      </CardHeader>
      <CardContent>
        <p>Sprint {sprintNumber} retrospective is complete</p>
        <Button onClick={() => navigate({ to: "/" })}>Back to Sessions</Button>
      </CardContent>
    </Card>
  );
}
