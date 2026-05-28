import type { Id } from "#convex/models";

export type TicketCategory = "well" | "improve";
export interface Ticket {
  _id: Id<"tickets">;
  text: string;
  author?: string;
  imageUrl?: string;
  category: TicketCategory;
  groupId?: Id<"ticketGroups">;
}
