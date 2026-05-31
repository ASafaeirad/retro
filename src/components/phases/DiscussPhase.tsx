import { useMemo } from "react";
import { TicketCard } from "#components/TicketCard.tsx";
import { Timer } from "#components/Timer.tsx";
import type { Id } from "#convex/models";
import { cn } from "#lib/cn";
import type { Ticket } from "#models/ticket.model.ts";
import { Button } from "#ui/button.tsx";

interface DiscussPhaseProps {
  session: any;
  sessionId: Id<"sessions">;
  tickets: Ticket[];
  isScrumMaster: boolean;
  onStartTimer: (duration: number, ticketId?: Id<"tickets">) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onExtendTimer: (time: number) => void;
  onCompleteDiscussion: () => void;
}

export function DiscussPhase({
  session,
  sessionId,
  tickets,
  isScrumMaster,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onExtendTimer,
  onCompleteDiscussion,
}: DiscussPhaseProps) {
  const sortedTickets = useMemo(() => tickets.toSorted(), [tickets]);

  return (
    <div>
      <div className="mb-6 rounded-lg border p-6">
        <h2 className="mb-2 text-2xl font-bold">
          Discuss & Create Action Items
        </h2>
        <p>Discuss tickets sorted by votes and create action items</p>
      </div>

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

      <div className="space-y-4">
        {sortedTickets.map((item) => (
          <TicketCard key={item._id} {...item} />
        ))}
      </div>
    </div>
  );
}
