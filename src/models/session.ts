import type { Id } from "#convex/models";
import type { Phase } from "./phase.model";

export interface Session {
  _id: Id<"sessions">;
  sprintNumber: number;
  phase: Phase;
  participantCount: number;
  createdBy: string;
  isActive: boolean;
  voteLimit?: number;
}
