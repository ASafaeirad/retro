import { useState } from "react";
import { BoardColumn } from "#components/BoardColumn.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import type { Id } from "#convex/models";
import type { Session } from "#models/session.ts";
import { groupByCategory, type Ticket } from "#models/ticket.model.ts";
import type { Vote } from "#models/vote.model.ts";

interface VotePhaseProps {
  session: Session;
  tickets: Ticket[];
  myVotes?: Vote[];
  onVote: (ticketId?: Id<"tickets">, groupId?: Id<"ticketGroups">) => void;
}

export function VotePhase({
  session,
  tickets,
  myVotes,
  onVote,
}: VotePhaseProps) {
  const { improveTickets, wellTickets } = groupByCategory(tickets);
  const votesLeft = (session.voteLimit || 0) - (myVotes?.length || 0);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        <BoardColumn title="What Went Well" category="well">
          {wellTickets.map((ticket) => {
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
        </BoardColumn>
        <BoardColumn title="To Improve" category="improve">
          {improveTickets.map((ticket) => {
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
        </BoardColumn>
      </div>
    </div>
  );
}
