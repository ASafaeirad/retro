import type { Id } from "#convex/models";

export interface Session {
  _id: Id<"sessions">;
  sprintNumber: number;
  phase: string;
  participantCount: number;
  createdBy: string;
  isActive: boolean;
  voteLimit?: number;
}
