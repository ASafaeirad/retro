import { BoardColumn } from "#components/BoardColumn.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import { groupByCategory, type Ticket } from "#models/ticket.model.ts";

interface Props {
  tickets: Ticket[];
  selectedParticipantFilter: string | null;
}

export function PresentPhase({ tickets, selectedParticipantFilter }: Props) {
  const { wellTickets, improveTickets } = groupByCategory(tickets);

  return (
    <div className="h-full grid grid-cols-2 gap-6">
      <BoardColumn title="What Went Well" category="well">
        {wellTickets.map((ticket) => (
          <TicketCard
            key={ticket._id}
            {...ticket}
            isDimmed={
              !!selectedParticipantFilter &&
              ticket.author !== selectedParticipantFilter
            }
          />
        ))}
      </BoardColumn>

      <BoardColumn title="To Improve" category="improve">
        {improveTickets.map((ticket) => (
          <TicketCard
            key={ticket._id}
            {...ticket}
            isHighlighted={
              selectedParticipantFilter
                ? ticket.author === selectedParticipantFilter
                : false
            }
            isDimmed={
              selectedParticipantFilter
                ? ticket.author !== selectedParticipantFilter
                : false
            }
          />
        ))}
      </BoardColumn>
    </div>
  );
}
