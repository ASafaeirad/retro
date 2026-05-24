import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { SessionList } from "#components/SessionList.tsx";
import { api } from "#convex/api";
import { Button } from "#ui/button.tsx";
import { Logo } from "../components/Logo.tsx";
import { generateToken, storeSession } from "../lib/participantAuth.ts";

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
    if (!sprintNumber || !creatorName.trim()) return;

    try {
      const token = generateToken();
      const sessionId = await createSession({
        sprintNumber: Number(sprintNumber),
        creatorName: creatorName.trim(),
        sessionToken: token,
      });

      // Store session credentials in localStorage
      storeSession(sessionId, creatorName.trim(), token);

      // Navigate to the new session
      navigate({
        to: `/retro/${sessionId}`,
        search: { name: creatorName.trim() },
      });
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
        <Logo className="h-10 w-auto" />
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

      {activeSessions.length > 0 && (
        <SessionList sessions={activeSessions} title="Active Sessions">
          <Button size="sm" onClick={() => setIsCreating(true)}>
            + Create
          </Button>
        </SessionList>
      )}
      <hr className="border-t-0 border-b-2" />
      <SessionList sessions={completedSessions} title="Completed Sessions" />

      {sessions.length === 0 && (
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
          <p className="text-[var(--sea-ink-soft)]">
            No sessions yet. Create your first retro session to get started!
          </p>
        </div>
      )}
    </div>
  );
}

export const CreateSessionModal = ({
  onClose,
  onCreate,
}: {
  onClose?: () => void;
  onCreate?: ({
    sprintNumber,
    creatorName,
  }: {
    sprintNumber: string;
    creatorName: string;
  }) => void;
}) => {
  const [sprintNumber, setSprintNumber] = useState("");
  const [creatorName, setCreatorName] = useState("");

  return (
    <form
      onSubmit={() => onCreate?.({ sprintNumber, creatorName })}
      className="space-y-4 mb-8"
    >
      <div>
        <label
          htmlFor="sprintNumber"
          className="block text-sm font-medium mb-2"
        >
          Sprint Number
        </label>
        <input
          id="sprintNumber"
          type="number"
          value={sprintNumber}
          onChange={(e) => setSprintNumber(e.target.value)}
          placeholder="e.g., 42"
          className="w-full rounded-md border border-[var(--line)] bg-white dark:bg-[var(--foam)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-1 focus:ring-[var(--lagoon)]"
          required
          autoFocus
        />
      </div>

      <div>
        <label
          htmlFor="creatorName"
          className="block text-sm font-medium text-[var(--sea-ink)] mb-2"
        >
          Your Name (you'll be the Scrum Master)
        </label>
        <input
          id="creatorName"
          type="text"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-md border border-[var(--line)] bg-white dark:bg-[var(--foam)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-1 focus:ring-[var(--lagoon)]"
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Create Session
        </Button>
        <Button
          onClick={() => {
            setSprintNumber("");
            setCreatorName("");
            onClose?.();
          }}
          variant="neutral"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
