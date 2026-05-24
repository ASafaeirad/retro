import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { MoodPicker } from "#components/MoodPicker.tsx";
import { Card, CardContent, CardHeader } from "#components/ui/card.tsx";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import type { Mood } from "#models/mood.model.tsx";
import { Button } from "#ui/button.tsx";
import {
  generateToken,
  getStoredSession,
  storeSession,
} from "../lib/participantAuth";

export function JoinForm({ sessionId }: { sessionId: Id<"sessions"> }) {
  const navigate = useNavigate();
  const joinSession = useMutation(api.retro.joinSession);
  const [name, setName] = useState("");
  const [mood, setMood] = useState<Mood>();
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isJoining) return;

    setIsJoining(true);
    try {
      // Check for stored session token (for rejoin scenario) or generate new one
      const stored = getStoredSession(sessionId);
      const token = stored?.token || generateToken();

      // Call joinSession mutation with token and mood
      await joinSession({
        sessionId,
        name: name.trim(),
        sessionToken: token,
        mood,
      });

      // Store session credentials in localStorage
      storeSession(sessionId, name.trim(), token, mood);

      // Navigate to the session
      navigate({
        to: `/retro/${sessionId}`,
        search: { name: name.trim() },
      });
    } catch (error) {
      console.error("Failed to join session:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to join session. Name might already be taken.",
      );
      setIsJoining(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card variant="main">
        <CardHeader className="justify-start">
          <h2>Enter Your Name</h2>
          <p className="text-sm">
            Please enter your name to join this retro session
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mb-4 w-full rounded-md border  bg-white dark: px-4 py-3 text-sm  placeholder: focus: focus:outline-none focus:ring-1 focus:"
              autoFocus
              required
            />
            <MoodPicker value={mood} onChange={setMood} />
            <Button
              type="submit"
              disabled={!name.trim() || isJoining}
              className="w-full"
            >
              {isJoining ? "Joining..." : "Join Session"}
            </Button>
          </form>

          <Button
            onClick={() => navigate({ to: "/" })}
            variant="neutral"
            className="mt-4 w-full"
          >
            Back to Sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
