import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useState } from "react";
import { MoodPicker } from "#components/MoodPicker.tsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "#components/ui/card.tsx";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import type { Mood } from "#models/mood.model.tsx";
import { Button } from "#ui/button.tsx";
import { generateToken, getStoredSession, storeSession } from "../lib/auth";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function JoinForm({ sessionId }: { sessionId: Id<"sessions"> }) {
  const navigate = useNavigate();
  const joinSession = useMutation(api.retro.joinSession);
  const [name, setName] = useState("");
  const [mood, setMood] = useState<Mood>();
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name || isJoining) return;

    setIsJoining(true);
    try {
      const stored = getStoredSession(sessionId);
      const token = stored?.token || generateToken();

      await joinSession({ sessionId, name, sessionToken: token, mood });
      storeSession(sessionId, name.trim(), token, mood);
      navigate({ to: `/retro/${sessionId}`, search: { name } });
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
          <h2 className="text-xl">Enter Your Name</h2>
          <p className="text-sm">
            Please enter your name to join this retro session
          </p>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <Label className="flex flex-col gap-2">
              <span>Your Name</span>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.trim())}
                placeholder="Your name"
                autoFocus
                required
              />
            </Label>
            <MoodPicker value={mood} onChange={setMood} />
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={!name || isJoining}
                className="w-full"
              >
                {isJoining ? "Joining..." : "Join Session"}
              </Button>
              <Button
                onClick={() => navigate({ to: "/" })}
                variant="neutral"
                full
              >
                Back to Sessions
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
