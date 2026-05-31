import { useMemo } from "react";
import { BoardColumn } from "#components/BoardColumn.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import { Timer } from "#components/Timer.tsx";
import type { Id } from "#convex/models";
import type { Session } from "#models/session.ts";
import { groupByCategory, type Ticket } from "#models/ticket.model.ts";

interface DiscussPhaseProps {
  session: Session;
  tickets: Ticket[];
  onStartTimer: (duration: number, ticketId?: Id<"tickets">) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onExtendTimer: (time: number) => void;
  onCompleteDiscussion: () => void;
}

export function DiscussPhase({
  session,
  tickets,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onExtendTimer,
  onCompleteDiscussion,
}: DiscussPhaseProps) {
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
      {session.timerState && (
        <div className="mb-6">
          <Timer
            {...session.timerState}
            onPause={onPauseTimer}
            onResume={onResumeTimer}
            onExtend={onExtendTimer}
            onComplete={onCompleteDiscussion}
          />
        </div>
      )}

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
