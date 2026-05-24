import type { Id } from "#convex/models";
import type { Mood } from "#models/mood.model.ts";

interface StoredSession {
  name: string;
  token: string;
  joinedAt: number;
  mood?: Mood;
}

export function generateToken(): string {
  return crypto.randomUUID();
}

export function getStoredSession(
  sessionId: Id<"sessions">,
): StoredSession | null {
  try {
    const key = `retro_session_${sessionId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredSession;
    return parsed;
  } catch (error) {
    console.error("Failed to retrieve stored session:", error);
    return null;
  }
}

/**
 * Store session credentials in localStorage for a specific session
 */
export function storeSession(
  sessionId: Id<"sessions">,
  name: string,
  token: string,
  mood?: Mood,
): void {
  try {
    const key = `retro_session_${sessionId}`;
    const data: StoredSession = {
      name,
      token,
      joinedAt: Date.now(),
      mood,
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to store session:", error);
  }
}

/**
 * Clear stored session credentials from localStorage for a specific session
 */
export function clearSession(sessionId: Id<"sessions">): void {
  try {
    const key = `retro_session_${sessionId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear session:", error);
  }
}
