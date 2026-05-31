import { useMutation } from "convex/react";
import { BoardColumn } from "#components/BoardColumn.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import { Button } from "#components/ui/button.tsx";
import { api } from "#convex/api";
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
}: Props) {
  const wellTickets = tickets.filter((t) => t.category === "well");
  const improveTickets = tickets.filter((t) => t.category === "improve");
  const deleteTicket = useMutation(api.retro.deleteTicket);

  const handleAddTicket = async (category: "well" | "improve") => {
    await onAddTicket("", category);
  };

  const handleDeleteTicket = async (ticketId: Id<"tickets">) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?",
    );
    if (!confirmed) return;

    try {
      await deleteTicket({ ticketId, author: currentUserName });
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      alert("Failed to delete ticket. Please try again.");
    }
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
            onDelete={() => handleDeleteTicket(ticket._id)}
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
            onDelete={() => handleDeleteTicket(ticket._id)}
            hideVotes
          />
        ))}
      </BoardColumn>
    </div>
  );
}
