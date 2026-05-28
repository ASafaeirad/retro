import { useState } from "react";
import { AddTicketForm } from "#components/AddTicketForm.tsx";
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
  ) => Promise<void>;
  onDeleteTicket: (ticketId: Id<"tickets">) => void;
  onEditTicket: (
    ticketId: Id<"tickets">,
    text: string,
    imageUrl?: string,
  ) => Promise<void>;
}

export function AddTicketsPhase({
  tickets,
  currentUserName,
  onAddTicket,
  onEditTicket,
  onDeleteTicket,
}: AddTicketsPhaseProps) {
  const [addingTicketCategory, setAddingTicketCategory] = useState<
    "well" | "improve"
  >();

  const wellTickets = tickets.filter((t) => t.category === "well");
  const improveTickets = tickets.filter((t) => t.category === "improve");

  const handleAddTicket = async (text: string, imageUrl?: string) => {
    if (!addingTicketCategory) return;
    await onAddTicket(text, addingTicketCategory, imageUrl);
    setAddingTicketCategory(undefined);
  };

  return (
    <div className="h-full grid grid-cols-2 gap-6">
      <BoardColumn
        title="What Went Well"
        category="well"
        onAdd={() => setAddingTicketCategory("well")}
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

        {addingTicketCategory === "well" ? (
          <AddTicketForm
            category="well"
            onSubmit={handleAddTicket}
            onCancel={() => setAddingTicketCategory(undefined)}
          />
        ) : null}
      </BoardColumn>

      <BoardColumn
        title="To Improve"
        category="improve"
        onAdd={() => {
          () => setAddingTicketCategory("improve");
        }}
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

        {addingTicketCategory === "improve" ? (
          <AddTicketForm
            category="improve"
            onSubmit={handleAddTicket}
            onCancel={() => setAddingTicketCategory(undefined)}
          />
        ) : null}
      </BoardColumn>
    </div>
  );
}
