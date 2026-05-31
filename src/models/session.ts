import type { Id } from "#convex/models";
import type { Phase } from "./phase.model";

export interface TimerState {
  startedAt: number;
  duration: number; // milliseconds
  isPaused: boolean;
  pausedAt?: number;
}
export interface Session {
  _id: Id<"sessions">;
  sprintNumber: number;
  phase: Phase;
  participantCount: number;
  createdBy: string;
  isActive: boolean;
  voteLimit?: number;
  timerState: TimerState;
}
