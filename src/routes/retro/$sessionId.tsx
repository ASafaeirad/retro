import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
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
import { VoteControl } from "#components/phases/VoteControl.tsx";
import { VotePhase } from "#components/phases/VotePhase.tsx";
import { RetroHeader } from "#components/retro/components/RetroHeader.tsx";
import { Stepper } from "#components/retro/components/Stepper.tsx";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import { getStoredSession } from "#lib/auth";
import type { Participant } from "#models/participant.model.ts";
import type { Phase } from "#models/phase.model.ts";
import type { Session } from "#models/session.ts";
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
  const setCurrentPresenter = useMutation(api.retro.setCurrentPresenter);
  const navigate = useNavigate();
  const session = useQuery(api.retro.getSession, { sessionId }) as
    | Session
    | undefined;
  const participants = useQuery(api.retro.getParticipants, {
    sessionId,
  }) as Participant[];
  const tickets = useQuery(api.retro.getTickets, { sessionId });
  const myVotes = useQuery(
    api.retro.getParticipantVotes,
    name ? { sessionId, participantName: name } : "skip",
  );
  const updatePhase = useMutation(api.retro.updatePhase);
  const toggleReady = useMutation(api.retro.toggleReady);
  const addTicket = useMutation(api.retro.addTicket);
  const updateTicket = useMutation(api.retro.updateTicket);
  const updateHeartbeat = useMutation(api.retro.updateHeartbeat);
  const isScrumMaster = session?.createdBy === name;
  const currentParticipant = participants?.find((p) => p.name === name);

  // Auto-rejoin logic: If no name in URL, check localStorage for stored session
  useEffect(() => {
    if (!name) {
      const stored = getStoredSession(sessionId);
      if (stored) {
        navigate({
          to: `/retro/${sessionId}`,
          search: { name: stored.name },
          replace: true,
        });
      }
    }
  }, [name, sessionId, navigate]);

  // Heartbeat system: Send heartbeat every 30 seconds to update lastActiveAt
  useEffect(() => {
    if (!name) return;

    // Send initial heartbeat
    updateHeartbeat({ sessionId, participantName: name }).catch(
      (error: Error) => {
        console.error("Failed to send heartbeat:", error);
      },
    );

    // Set up interval for periodic heartbeats
    const heartbeatInterval = setInterval(() => {
      updateHeartbeat({ sessionId, participantName: name }).catch(
        (error: Error) => {
          console.error("Failed to send heartbeat:", error);
        },
      );
    }, 30000); // 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [name, sessionId, updateHeartbeat]);

  const handlePhaseChange = async (phase: Phase) => {
    if (!isScrumMaster || !name) return;
    await setCurrentPresenter({ sessionId, presenterName: undefined });
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
          />
        );

      case "PRESENT":
        return (
          <PresentPhase
            tickets={tickets}
            selectedParticipant={session.currentPresenter}
          />
        );

      case "GROUP":
        return <GroupPhase tickets={tickets} />;

      case "VOTE":
        return (
          <VotePhase
            session={session}
            tickets={tickets}
            myVotes={myVotes}
            currentUser={name}
          />
        );

      case "DISCUSS":
        return <DiscussPhase tickets={tickets} />;

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
            selectedParticipant={session.currentPresenter}
            onSelectPresenter={
              session.phase === "PRESENT"
                ? (name) =>
                    setCurrentPresenter({ sessionId, presenterName: name })
                : undefined
            }
          />

          {session.phase === "ADD_TICKETS" && (
            <ImReadyControl
              onToggleReady={handleToggleReady}
              isReady={currentParticipant?.isReady || false}
            />
          )}
          {session.phase === "VOTE" && (
            <VoteControl session={session} disabled={!isScrumMaster} />
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
