import { useMemo } from "react";
import { BoardColumn } from "#components/BoardColumn.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import { groupByCategory, type Ticket } from "#models/ticket.model.ts";

interface DiscussPhaseProps {
  tickets: Ticket[];
}

export function DiscussPhase({ tickets }: DiscussPhaseProps) {
  const { wellTickets, improveTickets } = groupByCategory(tickets);
  const sortedWellTickets = useMemo(
    () => wellTickets.toSorted((a, b) => b.votes - a.votes),
    [wellTickets],
  );
  const sortedImproveTickets = useMemo(
    () => improveTickets.toSorted((a, b) => b.votes - a.votes),
    [improveTickets],
  );

  return (
    <div>
      <div className="h-full grid grid-cols-2 gap-6">
        <BoardColumn title="What Went Well" category="well">
          {sortedWellTickets.map((item) => (
            <TicketCard isDimmed={item.votes === 0} key={item._id} {...item} />
          ))}
        </BoardColumn>
        <BoardColumn title="To Improve" category="improve">
          {sortedImproveTickets.map((item) => (
            <TicketCard isDimmed={item.votes === 0} key={item._id} {...item} />
          ))}
        </BoardColumn>
      </div>
    </div>
  );
}
