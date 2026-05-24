import type { Id } from "#convex/models";
import type { Mood } from "./mood.model";

export interface Participant {
  _id: Id<"participants">;
  name: string;
  isReady: boolean;
  lastActiveAt: number;
  mood?: Mood;
}
