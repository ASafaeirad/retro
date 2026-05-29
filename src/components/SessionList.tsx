import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { api } from "#convex/api";
import type { Session } from "#models/session.ts";
import { Button } from "#ui/button.tsx";
import { Card, CardAction, CardContent } from "#ui/card.tsx";

type Props = {
  sessions: Session[];
  children?: React.ReactNode;
  title: string;
};

export const SessionList = ({ sessions, children, title }: Props) => {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="bg-secondary-background">
      <div className="flex justify-between mx-6 py-4">
        <h2 className="text-xl uppercase">{title}</h2>
        {children}
      </div>
      <hr className="border-border-muted" />

      <div className="flex flex-col gap-3 py-6 mx-6">
        {sessions.map((session) => (
          <SessionCard key={session._id} session={session} />
        ))}
      </div>
      <hr className="border-t-0 border-b-2" />
    </div>
  );
};

export const SessionCard = ({ session }: { session: Session }) => {
  const navigate = useNavigate();
  const deleteSessionMutation = useMutation(api.retro.deleteSession);

  const handleJoinSession = async () => {
    try {
      navigate({ to: `/retro/${session._id}` });
    } catch (error) {
      console.error("Failed to join session:", error);
      alert("Failed to join session. Name might already be taken.");
    }
  };

  const handleDeleteSession = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this session? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteSessionMutation({ sessionId: session._id });
      console.log("deleted");
    } catch (error) {
      console.error("Failed to delete session:", error);
      alert("Failed to delete session. Please try again.");
    }
  };

  return (
    <Card className="py-3" key={session._id}>
      <CardContent className="justify-between flex-row items-center">
        <h3 className="flex-1">Sprint {session.sprintNumber}</h3>
        <CardAction className="flex gap-1">
          <Button
            variant="danger"
            size="sm"
            shadow="reverse"
            onClick={handleDeleteSession}
          >
            <Trash2 />
          </Button>
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
