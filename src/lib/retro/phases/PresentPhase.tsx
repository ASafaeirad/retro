import { BoardColumn } from "#components/BoardColumn.tsx";
import { TicketCard } from "#components/TicketCard.tsx";

interface PresentPhaseProps {
  tickets: any[];
  selectedParticipantFilter: string | null;
}

export function PresentPhase({
  tickets,
  selectedParticipantFilter,
}: PresentPhaseProps) {
  const wellTickets = tickets.filter((t) => t.category === "well");
  const improveTickets = tickets.filter((t) => t.category === "improve");

  return (
    <div>
      <div className="mb-6 rounded-lg border p-6">
        <h2 className="mb-2 text-2xl font-bold">Present Tickets</h2>
        <p>
          {selectedParticipantFilter
            ? `Focusing on ${selectedParticipantFilter}'s tickets`
            : "Select a participant to focus on their tickets"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <BoardColumn title="What Went Well" category="well">
          {wellTickets.map((ticket) => (
            <TicketCard
              id={ticket._id}
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

        <BoardColumn title="To Improve" category="improve">
          {improveTickets.map((ticket) => (
            <TicketCard
              id={ticket._id}
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
    </div>
  );
}
