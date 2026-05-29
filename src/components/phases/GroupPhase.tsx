import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { BoardColumn } from "#components/BoardColumn.tsx";
import { DraggableTicketCard } from "#components/DraggableTicketCard.tsx";
import { groupByCategory, type Ticket } from "#models/ticket.model.ts";

interface TicketGroup {
  _id: string;
  voteLimit?: number;
  tickets: Ticket[];
}

interface GroupPhaseProps {
  tickets: Ticket[];
  ticketGroups?: TicketGroup[];
  onDragEnd: (event: DragEndEvent) => void;
}

export function GroupPhase({
  tickets,
  ticketGroups,
  onDragEnd,
}: GroupPhaseProps) {
  const { wellTickets, improveTickets } = groupByCategory(tickets);

  return (
    <DragDropProvider onDragEnd={onDragEnd}>
      <div className="h-full grid grid-cols-2 gap-6">
        <BoardColumn title="What Went Well" category="well">
          {ticketGroups
            ?.filter((g) =>
              g.tickets.some((t: Ticket) => t.category === "well"),
            )
            .map((group) => (
              <div
                key={group._id}
                className="rounded-lg border-2 p-3 space-y-2"
              >
                <div className="text-xs font-semibold text-foreground-muted">
                  Group ({group.tickets.length} tickets)
                </div>
                {group.tickets
                  .filter((t: Ticket) => t.category === "well")
                  .map((ticket: Ticket) => (
                    <DraggableTicketCard
                      key={ticket._id}
                      id={ticket._id}
                      voteLimit={group.voteLimit}
                      {...ticket}
                      isGrouped
                    />
                  ))}
              </div>
            ))}
          {wellTickets
            .filter((t) => !t.groupId)
            .map((ticket) => (
              <DraggableTicketCard
                key={ticket._id}
                id={ticket._id}
                {...ticket}
              />
            ))}
        </BoardColumn>

        <BoardColumn title="To Improve" category="improve">
          {ticketGroups
            ?.filter((g) =>
              g.tickets.some((t: Ticket) => t.category === "improve"),
            )
            .map((group) => (
              <div
                key={group._id}
                className="rounded-lg border-2 p-3 space-y-2"
              >
                <div className="text-xs font-semibold text-foreground-muted">
                  Group ({group.tickets.length} tickets)
                </div>
                {group.tickets
                  .filter((t: Ticket) => t.category === "improve")
                  .map((ticket: Ticket) => (
                    <DraggableTicketCard
                      key={ticket._id}
                      id={ticket._id}
                      voteLimit={group.voteLimit}
                      {...ticket}
                      isGrouped
                    />
                  ))}
              </div>
            ))}
          {improveTickets
            .filter((t) => !t.groupId)
            .map((ticket) => (
              <DraggableTicketCard
                key={ticket._id}
                id={ticket._id}
                {...ticket}
              />
            ))}
        </BoardColumn>
      </div>
    </DragDropProvider>
  );
}
