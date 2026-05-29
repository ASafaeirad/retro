import { TicketCard } from "#components/TicketCard.tsx";
import type { Ticket } from "#models/ticket.model.ts";

interface Props {
  tickets: Ticket[];
}

export const TicketGroupCard = ({ tickets }: Props) => {
  return (
    <div className="grid">
      {tickets.map((ticket) => (
        <TicketCard key={ticket._id} {...ticket} />
      ))}
    </div>
  );
};
