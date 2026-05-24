import type { Id } from "#convex/models";
import type { Mood } from "./mood.model";

export interface Participant {
  _id: Id<"participants">;
  name: string;
  isReady: boolean;
  lastActiveAt: number;
  mood?: Mood;
}

const INACTIVE_THRESHOLD = 2 * 60 * 1000; // 2 minutes in milliseconds

export function isParticipantActive(lastActiveAt: number): boolean {
  return Date.now() - lastActiveAt < INACTIVE_THRESHOLD;
}
