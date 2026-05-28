import { useMutation, useQuery } from "convex/react";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import type { Participant } from "#models/participant.model.ts";

export function useRetroSession(sessionId: Id<"sessions">, name?: string) {
  const session = useQuery(api.retro.getSession, { sessionId });
  const participants = useQuery(api.retro.getParticipants, {
    sessionId,
  }) as Participant[];
  const tickets = useQuery(api.retro.getTickets, { sessionId });
  const ticketGroups = useQuery(api.retro.getTicketGroups, { sessionId });
  const votes = useQuery(api.retro.getVotes, { sessionId });
  const myVotes = useQuery(
    api.retro.getParticipantVotes,
    name ? { sessionId, participantName: name } : "skip",
  );
  const updatePhase = useMutation(api.retro.updatePhase);
  const toggleReady = useMutation(api.retro.toggleReady);
  const addTicket = useMutation(api.retro.addTicket);
  const updateTicket = useMutation(api.retro.updateTicket);
  const deleteTicket = useMutation(api.retro.deleteTicket);
  const setCurrentPresenter = useMutation(api.retro.setCurrentPresenter);
  const createGroup = useMutation(api.retro.createGroup);
  const addTicketToGroup = useMutation(api.retro.addTicketToGroup);
  const castVote = useMutation(api.retro.castVote);
  const removeVote = useMutation(api.retro.removeVote);
  const setVoteLimit = useMutation(api.retro.setVoteLimit);
  const startTimer = useMutation(api.retro.startTimer);
  const pauseTimer = useMutation(api.retro.pauseTimer);
  const resumeTimer = useMutation(api.retro.resumeTimer);
  const extendTimer = useMutation(api.retro.extendTimer);
  const completeDiscussion = useMutation(api.retro.completeDiscussion);
  const updateHeartbeat = useMutation(api.retro.updateHeartbeat);
  const leaveSession = useMutation(api.retro.leaveSession);

  // Computed values
  const isScrumMaster = session?.createdBy === name;
  const currentParticipant = participants?.find((p) => p.name === name);

  return {
    // Queries
    session,
    participants,
    tickets,
    ticketGroups,
    votes,
    myVotes,
    // Mutations
    updatePhase,
    toggleReady,
    addTicket,
    updateTicket,
    deleteTicket,
    setCurrentPresenter,
    createGroup,
    addTicketToGroup,
    castVote,
    removeVote,
    setVoteLimit,
    startTimer,
    pauseTimer,
    resumeTimer,
    extendTimer,
    completeDiscussion,
    updateHeartbeat,
    leaveSession,
    // Computed
    isScrumMaster,
    currentParticipant,
  };
}
