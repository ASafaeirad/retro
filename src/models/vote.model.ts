import type { Id } from "#convex/models";

export interface Vote {
  _id: Id<"votes">;
  ticketId?: Id<"tickets">;
  groupId?: Id<"ticketGroups">;
}
