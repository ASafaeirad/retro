import type { DragEndEvent } from "@dnd-kit/react";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import { ActionItemPanel } from "#components/ActionItemPanel.tsx";
import { JoinForm } from "#components/JoinForm.tsx";
import { ParticipantList } from "#components/ParticipantList.tsx";
import { PhaseControls } from "#components/PhaseControls.tsx";
import type { Id } from "#convex/models";
import { clearSession } from "../../lib/participantAuth";
import { RetroHeader } from "../../lib/retro/components/RetroHeader";
import { useRetroEffects } from "../../lib/retro/hooks/useRetroEffects";
import { useRetroSession } from "../../lib/retro/hooks/useRetroSession";
import { AddTicketsPhase } from "../../lib/retro/phases/AddTicketsPhase";
import { CompletedPhase } from "../../lib/retro/phases/CompletedPhase";
import { DiscussPhase } from "../../lib/retro/phases/DiscussPhase";
import { GroupPhase } from "../../lib/retro/phases/GroupPhase";
import { PresentPhase } from "../../lib/retro/phases/PresentPhase";
import { ReviewActionsPhase } from "../../lib/retro/phases/ReviewActionsPhase";
import { VotePhase } from "../../lib/retro/phases/VotePhase";

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
  const [selectedParticipantFilter, setSelectedParticipantFilter] =
    useState<string>();

  const {
    session,
    participants,
    tickets,
    ticketGroups,
    actionItems,
    isScrumMaster,
    currentParticipant,
    myVotes,
    toggleActionItemComplete,
    createActionItem,
    startTimer,
    pauseTimer,
    resumeTimer,
    extendTimer,
    completeDiscussion,
    updateHeartbeat,
    leaveSession,
    removeParticipant,
    updatePhase,
    toggleReady,
    addTicket,
    updateTicket,
    deleteTicket,
    setCurrentPresenter,
    addTicketToGroup,
    castVote,
    removeVote,
    setVoteLimit,
    createGroup,
    votes,
  } = useRetroSession(sessionId, name);

  useRetroEffects({
    sessionId: sessionId,
    name,
    updateHeartbeat: updateHeartbeat,
  });

  const navigate = useNavigate();

  // Handle phase change
  const handlePhaseChange = async (phase: any) => {
    if (!isScrumMaster || !name) return;
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
    category: "well" | "improve",
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
      await updateTicket({ ticketId, text, imageUrl, author: name });
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

  // Leave session
  const handleLeaveSession = async () => {
    if (!name) return;

    const confirmed = window.confirm(
      "Are you sure you want to leave this session? You can rejoin later with the same name.",
    );
    if (!confirmed) return;

    try {
      await leaveSession({ sessionId, participantName: name });
      clearSession(sessionId);
      navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to leave session:", error);
      alert("Failed to leave session. Please try again.");
    }
  };

  // Remove participant (scrum master only)
  const handleRemoveParticipant = async (participantId: Id<"participants">) => {
    if (!isScrumMaster || !name) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this participant?",
    );
    if (!confirmed) return;

    try {
      await removeParticipant({ participantId, requestedBy: name });
    } catch (error) {
      console.error("Failed to remove participant:", error);
      alert("Failed to remove participant. Please try again.");
    }
  };

  // Handle drag end for grouping
  const handleDragEnd = async (event: DragEndEvent) => {
    if (event.canceled) return;

    const { source, target } = event.operation;
    if (!source || !target || source.id === target.id) return;

    const draggedTicket = tickets?.find((t) => t._id === source.id);

    // Check if dropped on the ungrouped zone
    if (target.id === "ungrouped-zone" && draggedTicket) {
      await addTicketToGroup({
        ticketId: draggedTicket._id,
        groupId: undefined,
      });
      return;
    }

    // Dragging a ticket onto another ticket to create/add to group
    const targetTicket = tickets?.find((t) => t._id === target.id);

    if (draggedTicket && targetTicket) {
      if (targetTicket.groupId) {
        await addTicketToGroup({
          ticketId: draggedTicket._id,
          groupId: targetTicket.groupId,
        });
      } else {
        const groupId = await createGroup({ sessionId });
        await addTicketToGroup({ ticketId: targetTicket._id, groupId });
        await addTicketToGroup({ ticketId: draggedTicket._id, groupId });
      }
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

  // Render phase-specific content
  const renderPhaseContent = () => {
    switch (session.phase) {
      case "REVIEW_ACTIONS":
        return (
          <ReviewActionsPhase
            sprintNumber={session.sprintNumber}
            actionItems={actionItems}
            participants={participants}
            onToggleComplete={(id) =>
              toggleActionItemComplete({ actionItemId: id })
            }
          />
        );

      case "ADD_TICKETS":
        return (
          <AddTicketsPhase
            tickets={tickets}
            currentParticipant={currentParticipant}
            currentUserName={name}
            onToggleReady={handleToggleReady}
            onAddTicket={handleAddTicket}
            onEditTicket={handleEditTicket}
            onDeleteTicket={handleDeleteTicket}
          />
        );

      case "PRESENT":
        return (
          <PresentPhase
            tickets={tickets}
            selectedParticipantFilter={selectedParticipantFilter}
          />
        );

      case "GROUP":
        return (
          <GroupPhase
            tickets={tickets}
            ticketGroups={ticketGroups}
            onDragEnd={handleDragEnd}
          />
        );

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

  return (
    <div className="min-h-screen py-8 px-4">
      <div>
        <RetroHeader sprintNumber={session.sprintNumber} />

        <div className="w-64 shrink-0 space-y-4">
          <ParticipantList
            participants={participants}
            scrumMaster={session.createdBy}
            currentPresenter={selectedParticipantFilter || undefined}
            currentUserName={name}
            sessionId={session._id}
            onSelectPresenter={
              session.phase === "PRESENT"
                ? (name) => {
                    setSelectedParticipantFilter((prev) =>
                      prev === name ? undefined : name,
                    );
                  }
                : undefined
            }
            onLeaveSession={handleLeaveSession}
            onRemoveParticipant={
              isScrumMaster ? handleRemoveParticipant : undefined
            }
          />

          {isScrumMaster && (
            <PhaseControls
              currentPhase={session.phase}
              onPhaseChange={handlePhaseChange}
            />
          )}

          {(session.phase === "DISCUSS" || session.phase === "COMPLETED") && (
            <ActionItemPanel
              actionItems={
                actionItems?.filter(
                  (ai) => ai.createdInSprint === session.sprintNumber,
                ) || []
              }
              participants={participants}
              onCreateActionItem={
                isScrumMaster
                  ? (text, assignee) =>
                      createActionItem({
                        text,
                        assignee,
                        createdInSprint: session.sprintNumber,
                      })
                  : undefined
              }
            />
          )}
        </div>

        <div className="flex gap-6">
          <div className="flex-1">{renderPhaseContent()}</div>
        </div>
      </div>
    </div>
  );
}
