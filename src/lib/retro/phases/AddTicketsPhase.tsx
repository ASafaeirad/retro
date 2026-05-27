import { useState } from "react";
import { AddTicketForm } from "#components/AddTicketForm.tsx";
import { BoardColumn } from "#components/BoardColumn.tsx";
import { EditTicketForm } from "#components/EditTicketForm.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import type { Id } from "#convex/models";
import { Button } from "#ui/button.tsx";

interface AddTicketsPhaseProps {
  tickets: any[];
  currentUserName: string;
  onAddTicket: (
    text: string,
    category: "well" | "improve",
    imageUrl?: string,
  ) => Promise<void>;
  onEditTicket: (
    ticketId: Id<"tickets">,
    text: string,
    imageUrl?: string,
  ) => Promise<void>;
  onDeleteTicket: (ticketId: Id<"tickets">) => void;
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
  const [editingTicketId, setEditingTicketId] = useState<Id<"tickets">>();

  const wellTickets = tickets.filter((t) => t.category === "well");
  const improveTickets = tickets.filter((t) => t.category === "improve");

  const handleAddTicket = async (text: string, imageUrl?: string) => {
    if (!addingTicketCategory) return;
    await onAddTicket(text, addingTicketCategory, imageUrl);
    setAddingTicketCategory(undefined);
  };

  const handleEditTicket = async (text: string, imageUrl?: string) => {
    if (!editingTicketId) return;
    await onEditTicket(editingTicketId, text, imageUrl);
    setEditingTicketId(undefined);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-6">
        <BoardColumn title="What Went Well" category="well">
          {wellTickets.map((ticket) =>
            editingTicketId === ticket._id ? (
              <EditTicketForm
                key={ticket._id}
                initialText={ticket.text}
                initialImageUrl={ticket.imageUrl}
                category="well"
                onSubmit={handleEditTicket}
                onCancel={() => setEditingTicketId(undefined)}
              />
            ) : (
              <TicketCard
                id={ticket._id}
                key={ticket._id}
                {...ticket}
                currentUserName={currentUserName}
                onEdit={() => setEditingTicketId(ticket._id)}
                onDelete={() => onDeleteTicket(ticket._id)}
              />
            ),
          )}

          {addingTicketCategory === "well" ? (
            <AddTicketForm
              category="well"
              onSubmit={handleAddTicket}
              onCancel={() => setAddingTicketCategory(undefined)}
            />
          ) : (
            <Button
              onClick={() => setAddingTicketCategory("well")}
              variant="neutral"
              className="w-full"
            >
              + Add Ticket
            </Button>
          )}
        </BoardColumn>

        <BoardColumn title="To Improve" category="improve">
          {improveTickets.map((ticket) =>
            editingTicketId === ticket._id ? (
              <EditTicketForm
                key={ticket._id}
                initialText={ticket.text}
                initialImageUrl={ticket.imageUrl}
                category="improve"
                onSubmit={handleEditTicket}
                onCancel={() => setEditingTicketId(undefined)}
              />
            ) : (
              <TicketCard
                id={ticket._id}
                key={ticket._id}
                {...ticket}
                currentUserName={currentUserName}
                onEdit={() => setEditingTicketId(ticket._id)}
                onDelete={() => onDeleteTicket(ticket._id)}
              />
            ),
          )}

          {addingTicketCategory === "improve" ? (
            <AddTicketForm
              category="improve"
              onSubmit={handleAddTicket}
              onCancel={() => setAddingTicketCategory(undefined)}
            />
          ) : (
            <Button
              onClick={() => setAddingTicketCategory("improve")}
              variant="neutral"
              className="w-full"
            >
              + Add Ticket
            </Button>
          )}
        </BoardColumn>
      </div>
    </div>
  );
}
