import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "#convex/api";
import { cn } from "#lib/cn";

export const Route = createFileRoute("/retro/")({
  component: RetroSessionsPage,
});

function RetroSessionsPage() {
  const navigate = useNavigate();
  const sessions = useQuery(api.retro.listSessions, { includeCompleted: true });
  const createSession = useMutation(api.retro.createSession);
  const joinSession = useMutation(api.retro.joinSession);

  const [isCreating, setIsCreating] = useState(false);
  const [sprintNumber, setSprintNumber] = useState("");
  const [creatorName, setCreatorName] = useState("");

  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  const [joinName, setJoinName] = useState("");

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintNumber || !creatorName.trim()) return;

    try {
      const sessionId = await createSession({
        sprintNumber: Number(sprintNumber),
        creatorName: creatorName.trim(),
      });

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

  const handleJoinSession = async (sessionId: string) => {
    if (!joinName.trim()) return;

    try {
      await joinSession({
        sessionId: sessionId as any,
        name: joinName.trim(),
      });

      // Navigate to the session
      navigate({
        to: `/retro/${sessionId}`,
        search: { name: joinName.trim() },
      });
    } catch (error) {
      console.error("Failed to join session:", error);
      alert("Failed to join session. Name might already be taken.");
    }
  };

  if (sessions === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="text-[var(--sea-ink)]">Loading sessions...</div>
      </div>
    );
  }

  const activeSessions = sessions.filter((s) => s.isActive);
  const completedSessions = sessions.filter((s) => !s.isActive);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--sea-ink)]">
            Retro Board
          </h1>
          <p className="mt-2 text-[var(--sea-ink-soft)]">
            Create or join a retrospective session
          </p>
        </div>

        {/* Create new session */}
        <div className="mb-8 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
          {!isCreating ? (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full rounded-md bg-[var(--lagoon)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--lagoon-deep)]"
            >
              + Create New Session
            </button>
          ) : (
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label
                  htmlFor="sprintNumber"
                  className="block text-sm font-medium text-[var(--sea-ink)] mb-2"
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
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-[var(--lagoon)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--lagoon-deep)]"
                >
                  Create Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setSprintNumber("");
                    setCreatorName("");
                  }}
                  className="rounded-md border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-medium text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Active sessions */}
        {activeSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-[var(--sea-ink)]">
              Active Sessions
            </h2>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session._id}
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--sea-ink)]">
                        Sprint {session.sprintNumber}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                        Phase: {session.phase.replace("_", " ")} •{" "}
                        {session.participantCount} participants
                      </p>
                      <p className="text-xs text-[var(--sea-ink-soft)] mt-1">
                        Scrum Master: {session.createdBy}
                      </p>
                    </div>

                    {joiningSessionId === session._id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={joinName}
                          onChange={(e) => setJoinName(e.target.value)}
                          placeholder="Your name"
                          className="rounded-md border border-[var(--line)] bg-white dark:bg-[var(--foam)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-1 focus:ring-[var(--lagoon)]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleJoinSession(session._id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleJoinSession(session._id)}
                          disabled={!joinName.trim()}
                          className={cn(
                            "rounded-md px-4 py-2 text-sm font-medium text-white transition-colors",
                            joinName.trim()
                              ? "bg-[var(--lagoon)] hover:bg-[var(--lagoon-deep)]"
                              : "bg-[var(--line)] cursor-not-allowed",
                          )}
                        >
                          Join
                        </button>
                        <button
                          onClick={() => {
                            setJoiningSessionId(null);
                            setJoinName("");
                          }}
                          className="rounded-md border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 text-sm font-medium text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setJoiningSessionId(session._id)}
                        className="rounded-md bg-[var(--lagoon)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--lagoon-deep)]"
                      >
                        Join Session
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

                    <button
                      onClick={() => navigate({ to: `/retro/${session._id}` })}
                      className="rounded-md border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-medium text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]"
                    >
                      View
                    </button>
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
    </div>
  );
}
