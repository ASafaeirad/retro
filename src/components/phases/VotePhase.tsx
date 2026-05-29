import { isNullOrEmptyArray } from "@fullstacksjs/toolbox";
import { useState } from "react";
import { TicketCard } from "#components/TicketCard.tsx";
import { Input } from "#components/ui/input.tsx";
import type { Id } from "#convex/models";
import type { Session } from "#models/session.ts";
import type { Ticket } from "#models/ticket.model.ts";
import type { TicketGroup } from "#models/ticket-group.model.ts";
import { Button } from "#ui/button.tsx";
import { TicketGroupCard } from "./TicketGroupCard";

interface VotePhaseProps {
  session: Session;
  tickets: Ticket[];
  ticketGroups?: TicketGroup[];
  myVotes?: any[];
  isScrumMaster: boolean;
  onVote: (ticketId?: Id<"tickets">, groupId?: Id<"ticketGroups">) => void;
  onSetVoteLimit: (voteLimit: number) => void;
}

export function VotePhase({
  session,
  tickets,
  ticketGroups,
  myVotes,
  isScrumMaster,
  onVote,
  onSetVoteLimit,
}: VotePhaseProps) {
  const [newVoteLimit, setNewVoteLimit] = useState("");
  const votesLeft = (session.voteLimit || 0) - (myVotes?.length || 0);

  const handleSetVoteLimit = () => {
    const count = Number(newVoteLimit);
    if (count > 0) {
      onSetVoteLimit(count);
      setNewVoteLimit("");
    }
  };

  return (
    <div>
      <div className="mb-6 rounded-lg border p-6">
        <h2 className="mb-2 text-2xl font-bold">Vote on Tickets</h2>
        <p>
          {session.voteLimit
            ? `You have ${votesLeft} votes remaining`
            : "Waiting for scrum master to set vote count"}
        </p>

        {isScrumMaster && !session.voteLimit && (
          <div className="mt-4 flex gap-2">
            <Input
              type="number"
              value={newVoteLimit}
              onChange={(e) => setNewVoteLimit(e.target.value)}
              placeholder="Votes per person"
              min="1"
            />
            <Button onClick={handleSetVoteLimit} disabled={!newVoteLimit}>
              Set Vote Count
            </Button>
          </div>
        )}
      </div>

      {/* Groups with votes */}
      {!isNullOrEmptyArray(ticketGroups) && (
        <div className="mb-6 space-y-4">
          {ticketGroups.map((group) => {
            const hasVoted = myVotes?.some(
              (vote) => vote.groupId === group._id,
            );
            return (
              <div key={group._id} className="rounded-lg border-2 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    Group ({group.tickets.length} tickets)
                  </div>
                  {session.voteLimit && (
                    <Button
                      type="button"
                      onClick={() => onVote(undefined, group._id)}
                      size="sm"
                      shadow={hasVoted ? "reverse" : "default"}
                    >
                      {hasVoted ? "Withdraw" : "Vote"} ({group.voteLimit})
                    </Button>
                  )}
                </div>
                <TicketGroupCard tickets={group.tickets} />
              </div>
            );
          })}
        </div>
      )}

      {/* Individual tickets */}
      <div className="grid grid-cols-4 gap-3">
        {tickets
          .filter((t) => !t.groupId)
          .map((ticket) => {
            const hasVoted = myVotes?.some(
              (vote) => vote.ticketId === ticket._id,
            );
            return (
              <TicketCard
                key={ticket._id}
                {...ticket}
                hasVoted={hasVoted}
                onVote={
                  session.voteLimit ? () => onVote(ticket._id) : undefined
                }
              />
            );
          })}
      </div>
    </div>
  );
}
