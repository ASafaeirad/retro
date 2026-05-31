import { BoardColumn } from "#components/BoardColumn.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import { Button } from "#components/ui/button.tsx";
import type { Id } from "#convex/models";
import type { Ticket, TicketCategory } from "#models/ticket.model.ts";

interface Props {
  tickets: Ticket[];
  currentUserName: string;
  onAddTicket: (
    text: string,
    category: TicketCategory,
    imageUrl?: string,
  ) => Promise<unknown>;
  onDeleteTicket: (ticketId: Id<"tickets">) => void;
  onEditTicket: (
    ticketId: Id<"tickets">,
    text: string,
    imageUrl?: string,
  ) => Promise<unknown>;
}

export function AddTicketsPhase({
  tickets,
  currentUserName,
  onAddTicket,
  onEditTicket,
  onDeleteTicket,
}: Props) {
  const wellTickets = tickets.filter((t) => t.category === "well");
  const improveTickets = tickets.filter((t) => t.category === "improve");

  const handleAddTicket = async (category: "well" | "improve") => {
    await onAddTicket("", category);
  };

  return (
    <div className="h-full grid grid-cols-2 gap-6">
      <BoardColumn title="What Went Well" category="well">
        <Button
          onClick={() => handleAddTicket("well")}
          variant="neutral"
          className="w-full"
        >
          + Add Ticket
        </Button>
        {wellTickets.map((ticket) => (
          <TicketCard
            key={ticket._id}
            {...ticket}
            currentUserName={currentUserName}
            onEdit={(text) => {
              return onEditTicket(ticket._id, text, ticket.imageUrl);
            }}
            onDelete={() => onDeleteTicket(ticket._id)}
            hideVotes
          />
        ))}
      </BoardColumn>

      <BoardColumn title="To Improve" category="improve">
        <Button
          onClick={() => handleAddTicket("improve")}
          variant="neutral"
          className="w-full"
        >
          + Add Ticket
        </Button>
        {improveTickets.map((ticket) => (
          <TicketCard
            key={ticket._id}
            {...ticket}
            currentUserName={currentUserName}
            onEdit={(text) => onEditTicket(ticket._id, text, ticket.imageUrl)}
            onDelete={() => onDeleteTicket(ticket._id)}
            hideVotes
          />
        ))}
      </BoardColumn>
    </div>
  );
}
