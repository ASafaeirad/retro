import { useMutation } from "convex/react";
import { useState } from "react";
import { BoardColumn } from "#components/BoardColumn.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import type { Session } from "#models/session.ts";
import { groupByCategory, type Ticket } from "#models/ticket.model.ts";
import type { Vote } from "#models/vote.model.ts";

interface VotePhaseProps {
  session: Session;
  tickets: Ticket[];
  myVotes?: Vote[];
  currentUser: string;
}

export function VotePhase({
  session,
  tickets,
  myVotes,
  currentUser,
}: VotePhaseProps) {
  const { improveTickets, wellTickets } = groupByCategory(tickets);
  const votesLeft = (session.voteLimit || 0) - (myVotes?.length || 0);
  const removeVote = useMutation(api.retro.removeVote);
  const castVote = useMutation(api.retro.castVote);

  const handleVote = async (ticketId: Id<"tickets">) => {
    const existingVote = myVotes?.find((vote) => vote.ticketId === ticketId);

    if (existingVote) {
      return removeVote({ voteId: existingVote._id });
    }

    await castVote({
      sessionId: session._id,
      participantName: currentUser,
      ticketId,
    });
  };

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
                  session.voteLimit ? () => handleVote(ticket._id) : undefined
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
                  session.voteLimit ? () => handleVote(ticket._id) : undefined
                }
              />
            );
          })}
        </BoardColumn>
      </div>
    </div>
  );
}
