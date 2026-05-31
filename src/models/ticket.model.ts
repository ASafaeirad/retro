import type { Id } from "#convex/models";

export type TicketCategory = "well" | "improve";
export interface Ticket {
  _id: Id<"tickets">;
  text: string;
  author?: string;
  imageUrl?: string;
  category: TicketCategory;
  votes: number;
}

export const groupByCategory = (tickets: Ticket[]) => {
  const grouped = Object.groupBy(tickets, (ticket) => ticket.category);
  return {
    wellTickets: grouped["well"] ?? [],
    improveTickets: grouped["improve"] ?? [],
  };
};
