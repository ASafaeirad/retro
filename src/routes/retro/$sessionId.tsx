import type { DragEndEvent } from "@dnd-kit/react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ActionItemPanel } from "#components/ActionItemPanel.tsx";
import { JoinForm } from "#components/JoinForm.tsx";
import { PhaseControls } from "#components/PhaseControls.tsx";
import { ParticipantList } from "#components/participant-list/ParticipantList.tsx";
import { AddTicketsPhase } from "#components/phases/AddTicketsPhase.tsx";
import { CompletedPhase } from "#components/phases/CompletedPhase.tsx";
import { DiscussPhase } from "#components/phases/DiscussPhase.tsx";
import { GroupPhase } from "#components/phases/GroupPhase.tsx";
import { ImReadyControl } from "#components/phases/ImReadyControl.tsx";
import { PresentPhase } from "#components/phases/PresentPhase.tsx";
import { ReviewActionsPhase } from "#components/phases/ReviewActionsPhase.tsx";
import { VotePhase } from "#components/phases/VotePhase.tsx";
import { RetroHeader } from "#components/retro/components/RetroHeader.tsx";
import { Stepper } from "#components/retro/components/Stepper.tsx";
import { useRetroEffects } from "#components/retro/hooks/useRetroEffects.ts";
import { useRetroSession } from "#components/retro/hooks/useRetroSession.ts";
import type { Id } from "#convex/models";
import type { Phase } from "#models/phase.model.ts";
import type { TicketCategory } from "#models/ticket.model.ts";

export const Route = createFileRoute("/retro/$sessionId")({
  component: RetroBoard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      name: (search.name as string) || undefined,
    };
  },
});

function RetroBoard() {
  const { sessionId } = Route.useParams() as { sessionId: Id<"sessions"> };
  const { name } = useSearch({ from: "/retro/$sessionId" });
  const [selectedParticipant, setSelectedParticipant] = useState<string>();

  const {
    session,
    participants,
    tickets,
    ticketGroups,
    isScrumMaster,
    currentParticipant,
    myVotes,
    startTimer,
    pauseTimer,
    resumeTimer,
    extendTimer,
    completeDiscussion,
    updateHeartbeat,
    updatePhase,
    toggleReady,
    addTicket,
    updateTicket,
    deleteTicket,
    castVote,
    removeVote,
    setVoteLimit,
    mergeTickets,
  } = useRetroSession(sessionId, name);

  useRetroEffects({ sessionId, name, updateHeartbeat });

  const handlePhaseChange = async (phase: Phase) => {
    if (!isScrumMaster || !name) return;
    setSelectedParticipant(undefined);
    await updatePhase({ sessionId, phase, requestedBy: name });
  };

  // Toggle ready status
  const handleToggleReady = async () => {
    if (!name) return;
    await toggleReady({ sessionId, participantName: name });
  };

  // Add ticket
  const handleAddTicket = async (
    text: string,
    category: TicketCategory,
    imageUrl?: string,
  ) => {
    if (!name) return;
    await addTicket({ sessionId, text, author: name, category, imageUrl });
  };

  // Edit ticket
  const handleEditTicket = async (
    ticketId: Id<"tickets">,
    text: string,
    imageUrl?: string,
  ) => {
    if (!name) return;
    try {
      return updateTicket({ ticketId, text, imageUrl, author: name });
    } catch (error) {
      console.error("Failed to edit ticket:", error);
      alert("Failed to edit ticket. Please try again.");
    }
  };

  // Delete ticket
  const handleDeleteTicket = async (ticketId: Id<"tickets">) => {
    if (!name) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?",
    );
    if (!confirmed) return;

    try {
      await deleteTicket({ ticketId, author: name });
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      alert("Failed to delete ticket. Please try again.");
    }
  };

  // Handle drag end for grouping
  const handleDragEnd = async (event: DragEndEvent) => {
    if (event.canceled) return;
    const { source, target } = event.operation;
    if (!source || !target || source.id === target.id) return;

    const sourceTicket = tickets?.find((t) => t._id === source.id);
    const targetTicket = tickets?.find((t) => t._id === target.id);

    if (sourceTicket && targetTicket) {
      await mergeTickets({
        sourceTicketId: sourceTicket._id,
        targetTicketId: targetTicket._id,
      });
    }
  };

  // Handle voting (toggle: vote if not voted, withdraw if already voted)
  const handleVote = async (
    ticketId?: Id<"tickets">,
    groupId?: Id<"ticketGroups">,
  ) => {
    if (!name) return;

    const existingVote = myVotes?.find((vote) =>
      ticketId ? vote.ticketId === ticketId : vote.groupId === groupId,
    );

    if (existingVote) {
      await removeVote({ voteId: existingVote._id });
      return;
    }

    const votesLeft = (session?.voteLimit || 0) - (myVotes?.length || 0);
    if (votesLeft <= 0) {
      alert("You have used all your votes!");
      return;
    }

    await castVote({ sessionId, participantName: name, ticketId, groupId });
  };

  // Set vote count
  const handleSetVoteLimit = async (voteLimit: number) => {
    if (voteLimit > 0) {
      await setVoteLimit({ sessionId, voteLimit });
    }
  };

  // Name entry if not set
  if (!name) {
    return <JoinForm sessionId={sessionId as Id<"sessions">} />;
  }

  if (!session || !participants || !tickets) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading session...</div>
      </div>
    );
  }
  const sessionNumber = session.sprintNumber;

  // Render phase-specific content
  const renderPhaseContent = () => {
    switch (session.phase) {
      case "REVIEW_ACTIONS":
        return (
          <ReviewActionsPhase currentUser={name} sprintNumber={sessionNumber} />
        );

      case "ADD_TICKETS":
        return (
          <AddTicketsPhase
            tickets={tickets}
            currentUserName={name}
            onAddTicket={handleAddTicket}
            onEditTicket={handleEditTicket}
            onDeleteTicket={handleDeleteTicket}
          />
        );

      case "PRESENT":
        return (
          <PresentPhase
            tickets={tickets}
            selectedParticipant={selectedParticipant}
          />
        );

      case "GROUP":
        return <GroupPhase tickets={tickets} onDragEnd={handleDragEnd} />;

      case "VOTE":
        return (
          <VotePhase
            session={session}
            tickets={tickets}
            ticketGroups={ticketGroups}
            myVotes={myVotes}
            isScrumMaster={isScrumMaster}
            onVote={handleVote}
            onSetVoteLimit={handleSetVoteLimit}
          />
        );

      case "DISCUSS":
        return (
          <DiscussPhase
            session={session}
            sessionId={sessionId as Id<"sessions">}
            tickets={tickets}
            ticketGroups={ticketGroups}
            isScrumMaster={isScrumMaster}
            onStartTimer={(duration, ticketId) =>
              startTimer({
                sessionId: sessionId as Id<"sessions">,
                duration,
                ticketId,
              })
            }
            onPauseTimer={() =>
              pauseTimer({ sessionId: sessionId as Id<"sessions"> })
            }
            onResumeTimer={() =>
              resumeTimer({ sessionId: sessionId as Id<"sessions"> })
            }
            onExtendTimer={(time) =>
              extendTimer({
                sessionId: sessionId as Id<"sessions">,
                additionalTime: time,
              })
            }
            onCompleteDiscussion={() =>
              completeDiscussion({ sessionId: sessionId as Id<"sessions"> })
            }
          />
        );

      case "COMPLETED":
        return <CompletedPhase sprintNumber={session.sprintNumber} />;

      default:
        return null;
    }
  };
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Session not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 flex flex-col gap-4 items-center-safe">
      <div className="flex flex-1 gap-6">
        <div className="w-64 flex flex-col gap-4">
          <RetroHeader
            sessionId={sessionId}
            participantName={currentParticipant?.name}
          />
          <ParticipantList
            participants={participants}
            scrumMaster={session.createdBy}
            currentUserName={name}
            sessionId={session._id}
            selectedParticipant={selectedParticipant}
            onSelectPresenter={
              session.phase === "PRESENT"
                ? (name) => {
                    setSelectedParticipant((prev) =>
                      prev === name ? undefined : name,
                    );
                  }
                : undefined
            }
          />

          {session.phase === "ADD_TICKETS" && (
            <ImReadyControl
              onToggleReady={handleToggleReady}
              isReady={currentParticipant?.isReady || false}
            />
          )}

          {isScrumMaster ? (
            <PhaseControls
              currentPhase={session.phase}
              onPhaseChange={handlePhaseChange}
            />
          ) : null}

          {(session.phase === "DISCUSS" || session.phase === "COMPLETED") && (
            <ActionItemPanel currentUser={name} sessionId={session._id} />
          )}
        </div>

        <div className="flex-1 gap-4 flex flex-col">
          <Stepper phase={session.phase} />
          {renderPhaseContent()}
        </div>
      </div>
    </div>
  );
}
