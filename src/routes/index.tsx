import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "#convex/api";
import { Badge } from "#ui/badge.tsx";
import { Button } from "#ui/button.tsx";
import { Card, CardAction, CardContent, CardHeader } from "#ui/card.tsx";
import type { Id } from "../../convex/_generated/dataModel";
import { Logo } from "../components/Logo.tsx";
import { generateToken, storeSession } from "../lib/participantAuth";

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
    <div className="min-h-screen py-6 px-4 mx-auto max-w-4xl">
      <header className="mb-8 flex justify-center">
        <Logo className="h-10 w-auto" />
      </header>
      <hr className="mb-8" />

      {isCreating && (
        <CreateSessionModal
          onClose={() => setIsCreating(false)}
          onCreate={handleCreateSession}
        />
      )}

      {/* Active sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl">Active Sessions</h2>
            <Button type="button" onClick={() => setIsCreating(true)}>
              + Create New Session
            </Button>
          </div>

          <div className="space-y-3">
            {activeSessions.map((session) => (
              <SessionCard key={session._id} session={session} />
            ))}
          </div>
        </div>
      )}
      <hr className="mb-8" />
      {/* Completed sessions */}
      {completedSessions.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-[var(--sea-ink)]">
            Completed Sessions
          </h2>
          <div className="space-y-3">
            {completedSessions.map((session) => (
              <div
                key={session._id}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--sea-ink)]">
                      Sprint {session.sprintNumber}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                      Completed • {session.participantCount} participants
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate({ to: `/retro/${session._id}` })}
                    variant="neutral"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

export const SessionCard = ({
  session,
}: {
  session: {
    _id: string;
    sprintNumber: number;
    phase: string;
    participantCount: number;
    createdBy: string;
  };
}) => {
  const joinSession = useMutation(api.retro.joinSession);
  const navigate = useNavigate();

  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);

  const handleJoinSession = async (sessionId: string, name: string) => {
    if (!name) return;

    try {
      const token = generateToken();
      await joinSession({
        sessionId: sessionId as Id<"sessions">,
        name,
        sessionToken: token,
      });

      storeSession(sessionId as Id<"sessions">, name, token);
      navigate({ to: `/retro/${sessionId}`, search: { name } });
    } catch (error) {
      console.error("Failed to join session:", error);
      alert("Failed to join session. Name might already be taken.");
    }
  };

  const isJoiningSession = joiningSessionId === session._id;

  return (
    <Card className="py-3" key={session._id}>
      <CardContent className="flex justify-between items-center">
        <h3 className="flex-1">Sprint {session.sprintNumber}</h3>
        <CardAction>
          <Button
            shadow="reverse"
            onClick={() => setJoiningSessionId(session._id)}
          >
            Join Session
          </Button>
        </CardAction>
        {isJoiningSession && (
          <QuickJoinForm
            onClose={() => setJoiningSessionId(null)}
            onJoin={(name) => handleJoinSession(session._id, name)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export const QuickJoinForm = ({
  onJoin,
  onClose,
}: {
  onJoin?: (name: string) => void;
  onClose?: () => void;
}) => {
  const [name, setName] = useState("");

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value.trim())}
        placeholder="Your name"
        className="rounded-md border border-[var(--line)] bg-white dark:bg-[var(--foam)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-1 focus:ring-[var(--lagoon)]"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onJoin?.(name.trim());
          }
        }}
      />
      <Button onClick={() => onJoin?.(name.trim())} disabled={!name.trim()}>
        Join
      </Button>
      <Button
        onClick={() => {
          setName("");
          onClose?.();
        }}
        variant="neutral"
      >
        Cancel
      </Button>
    </div>
  );
};
