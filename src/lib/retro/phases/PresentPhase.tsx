import { BoardColumn } from "#components/BoardColumn.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import { groupByCategory, type Ticket } from "#models/ticket.model.ts";

interface Props {
  tickets: Ticket[];
  selectedParticipant?: string;
}

export function PresentPhase({ tickets, selectedParticipant }: Props) {
  const { wellTickets, improveTickets } = groupByCategory(tickets);

  return (
    <div className="h-full grid grid-cols-2 gap-6">
      <BoardColumn title="What Went Well" category="well">
        {wellTickets.map((ticket) => (
          <TicketCard
            key={ticket._id}
            {...ticket}
            isDimmed={
              !!selectedParticipant && ticket.author !== selectedParticipant
            }
          />
        ))}
      </BoardColumn>

      <BoardColumn title="To Improve" category="improve">
        {improveTickets.map((ticket) => (
          <TicketCard
            key={ticket._id}
            {...ticket}
            isDimmed={
              selectedParticipant
                ? ticket.author !== selectedParticipant
                : false
            }
          />
        ))}
      </BoardColumn>
    </div>
  );
}
