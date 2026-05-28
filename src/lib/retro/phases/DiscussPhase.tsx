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
  ticketGroups?: any[];
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
  ticketGroups,
  isScrumMaster,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onExtendTimer,
  onCompleteDiscussion,
}: DiscussPhaseProps) {
  // Get tickets sorted by votes
  const ticketsByVotes = useMemo(() => {
    if (!tickets || !ticketGroups) return [];

    const items = [
      ...tickets
        .filter((t) => !t.groupId)
        .map((t) => ({ ...t, type: "ticket" as const })),
      ...ticketGroups.map((g) => ({ ...g, type: "group" as const })),
    ];

    return items.sort((a, b) => (b.voteLimit || 0) - (a.voteLimit || 0));
  }, [tickets, ticketGroups]);

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
        {ticketsByVotes.map((item) => (
          <div
            key={item._id}
            className={cn(
              "rounded-lg border-2 p-4",
              session.currentDiscussionTicket === item._id ? " " : " ",
            )}
          >
            {item.type === "group" && ticketGroups ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    Group ({item.tickets?.length || 0} tickets) •{" "}
                    {item.voteLimit} votes
                  </div>
                  {isScrumMaster && !session.timerState && (
                    <Button
                      type="button"
                      onClick={() => onStartTimer(300000)}
                      size="sm"
                    >
                      Start Timer
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {item.tickets?.map((ticket: Ticket) => (
                    <TicketCard key={ticket._id} {...ticket} />
                  ))}
                </div>
              </div>
            ) : item.type === "ticket" ? (
              <div className="flex items-start justify-between">
                <TicketCard
                  id={item._id as Id<"tickets">}
                  {...item}
                  className="flex-1"
                />
                {isScrumMaster && !session.timerState && (
                  <Button
                    type="button"
                    onClick={() =>
                      onStartTimer(300000, item._id as Id<"tickets">)
                    }
                    size="sm"
                    className="ml-4"
                  >
                    Start Timer
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
