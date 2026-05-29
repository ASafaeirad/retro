import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { LogOut } from "lucide-react";
import { Card } from "#components/ui/card.tsx";
import {
  AlertDialog,
  AlertDialogTrigger,
  Confirm,
} from "#components/ui/confirm.tsx";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import { clearSession } from "../../participantAuth";

type Props = {
  sessionId: Id<"sessions">;
  participantName?: string;
};

export function RetroHeader({ sessionId, participantName }: Props) {
  const navigate = useNavigate();
  const leaveSessionMutation = useMutation(api.retro.leaveSession);
  const leaveSession = async (name: string) => {
    try {
      await leaveSessionMutation({ sessionId, participantName: name });
      clearSession(sessionId);
      navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to leave session:", error);
      alert("Failed to leave session. Please try again.");
    }
  };

  return (
    <Card className="flex flex-row p-2 gap-0 items-center justify-between w-full">
      <h3 className={cn("py-1 px-2 text-sm text-nowrap")}>
        Sprint Retrospective
      </h3>

      {participantName && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="danger"
              shadow="reverse"
              title="Leave session"
            >
              <LogOut />
            </Button>
          </AlertDialogTrigger>
          <Confirm
            title="Leave session"
            description="Are you sure you want to leave this session? You can rejoin later with the same name."
            onConfirm={() => leaveSession(participantName)}
          />
        </AlertDialog>
      )}
    </Card>
  );
}
