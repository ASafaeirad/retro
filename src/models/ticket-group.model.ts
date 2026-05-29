import type { Id } from "#convex/models";
import type { Ticket } from "./ticket.model";

export interface TicketGroup {
  _id: Id<"ticketGroups">;
  voteLimit?: number;
  tickets: Ticket[];
}
