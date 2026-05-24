import { useNavigate } from "@tanstack/react-router";
import type { Session } from "#models/session.ts";

import { Button } from "#ui/button.tsx";
import { Card, CardAction, CardContent } from "#ui/card.tsx";
export const SessionList = ({
  sessions,
  children,
  title,
}: {
  sessions: Session[];
  children?: React.ReactNode;
  title: string;
}) => {
  return (
    <div>
      <div className="flex justify-between mx-6 py-4">
        <h2 className="text-xl uppercase">{title}</h2>
        {children}
      </div>
      <hr className="border-muted" />

      <div className="gap-3 py-6 mx-6">
        {sessions.map((session) => (
          <SessionCard key={session._id} session={session} />
        ))}
      </div>
    </div>
  );
};

export const SessionCard = ({ session }: { session: Session }) => {
  const navigate = useNavigate();

  const handleJoinSession = async () => {
    try {
      navigate({ to: `/retro/${session._id}` });
    } catch (error) {
      console.error("Failed to join session:", error);
      alert("Failed to join session. Name might already be taken.");
    }
  };

  return (
    <Card className="py-3" key={session._id}>
      <CardContent className="flex justify-between items-center">
        <h3 className="flex-1">Sprint {session.sprintNumber}</h3>
        <CardAction>
          <Button
            variant={!session.isActive ? "neutral" : "default"}
            size="sm"
            shadow="reverse"
            onClick={handleJoinSession}
          >
            Join
          </Button>
        </CardAction>
      </CardContent>
    </Card>
  );
};
