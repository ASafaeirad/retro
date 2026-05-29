import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { BoardColumn } from "#components/BoardColumn.tsx";
import { DraggableTicketCard } from "#components/DraggableTicketCard.tsx";
import { groupByCategory, type Ticket } from "#models/ticket.model.ts";

interface GroupPhaseProps {
  tickets: Ticket[];
  onDragEnd: (event: DragEndEvent) => void;
}

export function GroupPhase({ tickets, onDragEnd }: GroupPhaseProps) {
  const { wellTickets, improveTickets } = groupByCategory(tickets);

  return (
    <DragDropProvider onDragEnd={onDragEnd}>
      <div className="h-full grid grid-cols-2 gap-6">
        <BoardColumn title="What Went Well" category="well">
          {wellTickets.map((ticket) => (
            <DraggableTicketCard key={ticket._id} id={ticket._id} {...ticket} />
          ))}
        </BoardColumn>

        <BoardColumn title="To Improve" category="improve">
          {improveTickets.map((ticket) => (
            <DraggableTicketCard key={ticket._id} id={ticket._id} {...ticket} />
          ))}
        </BoardColumn>
      </div>
    </DragDropProvider>
  );
}
