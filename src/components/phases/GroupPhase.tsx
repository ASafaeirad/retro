import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useMutation } from "convex/react";
import { BoardColumn } from "#components/BoardColumn.tsx";
import { DraggableTicketCard } from "#components/DraggableTicketCard.tsx";
import { api } from "#convex/api";
import { groupByCategory, type Ticket } from "#models/ticket.model.ts";

interface GroupPhaseProps {
  tickets: Ticket[];
}

export function GroupPhase({ tickets }: GroupPhaseProps) {
  const { wellTickets, improveTickets } = groupByCategory(tickets);
  const mergeTickets = useMutation(api.retro.mergeTickets);

  const merge = async (event: DragEndEvent) => {
    if (event.canceled) return;
    const { source, target } = event.operation;
    if (!source || !target || source.id === target.id) return;

    const sourceTicket = tickets?.find((t) => t._id === source.id);
    const targetTicket = tickets?.find((t) => t._id === target.id);

    if (sourceTicket && targetTicket) {
      await mergeTickets({
        sourceTicketId: sourceTicket._id,
        targetTicketId: targetTicket._id,
      });
    }
  };

  return (
    <DragDropProvider onDragEnd={merge}>
      <div className="h-full grid grid-cols-2 gap-6">
        <BoardColumn title="What Went Well" category="well">
          {wellTickets.map((ticket) => (
            <DraggableTicketCard
              key={ticket._id}
              id={ticket._id}
              {...ticket}
              hideVotes
            />
          ))}
        </BoardColumn>

        <BoardColumn title="To Improve" category="improve">
          {improveTickets.map((ticket) => (
            <DraggableTicketCard
              key={ticket._id}
              id={ticket._id}
              {...ticket}
              hideVotes
            />
          ))}
        </BoardColumn>
      </div>
    </DragDropProvider>
  );
}
