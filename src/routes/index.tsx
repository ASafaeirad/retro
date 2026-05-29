import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Logo } from "#components/logo/Logo.tsx";
import { SessionList } from "#components/SessionList.tsx";
import { api } from "#convex/api";
import { Button } from "#ui/button.tsx";
import { generateToken, storeSession } from "../lib/participantAuth.ts";
import { CreateSessionModal } from "../lib/retro/components/CreateSessionModal.tsx";

export const Route = createFileRoute("/")({
  component: RetroSessionsPage,
});

function RetroSessionsPage() {
  const navigate = useNavigate();
  const sessions = useQuery(api.retro.listSessions, { includeCompleted: true });
  const createSession = useMutation(api.retro.createSession);

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async ({
    sprintNumber,
    creatorName,
  }: {
    sprintNumber: string;
    creatorName: string;
  }) => {
    const name = creatorName.trim();
    if (!sprintNumber || !name) return;

    try {
      const token = generateToken();
      const sessionId = await createSession({
        sprintNumber: Number(sprintNumber),
        creatorName: name,
        sessionToken: token,
      });

      storeSession(sessionId, name, token);
      navigate({ to: `/retro/${sessionId}`, search: { name } });
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session. Please try again.");
    }
  };

  if (!sessions) {
    return (
      <div className="grid text-center min-h-screen items-center justify-center]">
        Loading sessions...
      </div>
    );
  }

  const activeSessions = sessions.filter((s) => s.isActive);
  const completedSessions = sessions.filter((s) => !s.isActive);

  return (
    <div className="min-h-screen border-x-2 border-border mx-auto max-w-4xl">
      <header className="flex p-2 justify-center">
        <Logo className="h-20 w-auto" />
      </header>
      <hr className="border-t-0 border-b-2" />

      <div className="px-6">
        {isCreating && (
          <CreateSessionModal
            onClose={() => setIsCreating(false)}
            onCreate={handleCreateSession}
          />
        )}
      </div>

      <SessionList sessions={activeSessions} title="Active Sessions">
        <Button size="sm" onClick={() => setIsCreating(true)}>
          + Create
        </Button>
      </SessionList>
      <SessionList sessions={completedSessions} title="Completed Sessions" />

      {sessions.length === 0 && (
        <div>
          <div className="flex flex-col items-center gap-4 content-center p-6">
            <p className="text-center">
              No sessions yet. Create your first retro session to get started!
            </p>
            <Button onClick={() => setIsCreating(true)}>+ Create</Button>
          </div>
          <hr className="border-t-0 border-b-2" />
        </div>
      )}
      <div className="text-center font-bold text-foreground-muted py-4">
        Made with Keyboard (Mostly)
      </div>
    </div>
  );
}
