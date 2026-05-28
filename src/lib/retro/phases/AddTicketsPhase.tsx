import { BoardColumn } from "#components/BoardColumn.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import type { Id } from "#convex/models";

interface AddTicketsPhaseProps {
  tickets: any[];
  currentUserName: string;
  onAddTicket: (
    text: string,
    category: "well" | "improve",
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
}: AddTicketsPhaseProps) {
  const wellTickets = tickets.filter((t) => t.category === "well");
  const improveTickets = tickets.filter((t) => t.category === "improve");

  const handleAddTicket = async (category: "well" | "improve") => {
    await onAddTicket("", category);
  };

  return (
    <div className="h-full grid grid-cols-2 gap-6">
      <BoardColumn
        title="What Went Well"
        category="well"
        onAdd={() => handleAddTicket("well")}
      >
        {wellTickets.map((ticket) => (
          <TicketCard
            id={ticket._id}
            key={ticket._id}
            {...ticket}
            currentUserName={currentUserName}
            onEdit={(text) => {
              return onEditTicket(ticket._id, text, ticket.imageUrl);
            }}
            onDelete={() => onDeleteTicket(ticket._id)}
          />
        ))}
      </BoardColumn>

      <BoardColumn
        title="To Improve"
        category="improve"
        onAdd={() => handleAddTicket("improve")}
      >
        {improveTickets.map((ticket) => (
          <TicketCard
            id={ticket._id}
            key={ticket._id}
            {...ticket}
            currentUserName={currentUserName}
            onEdit={(text) => {
              console.log("YO? Or not");

              return onEditTicket(ticket._id, text, ticket.imageUrl);
            }}
            onDelete={() => onDeleteTicket(ticket._id)}
          />
        ))}
      </BoardColumn>
    </div>
  );
}
