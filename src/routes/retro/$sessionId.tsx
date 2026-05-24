import {
  DragDropProvider,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/react";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ActionItemPanel } from "#components/ActionItemPanel.tsx";
import { AddTicketForm } from "#components/AddTicketForm.tsx";
import { BoardColumn } from "#components/BoardColumn.tsx";
import { DraggableTicketCard } from "#components/DraggableTicketCard.tsx";
import { EditTicketForm } from "#components/EditTicketForm.tsx";
import { JoinForm } from "#components/JoinForm.tsx";
import { ParticipantList } from "#components/ParticipantList.tsx";
import { PhaseControls } from "#components/PhaseControls.tsx";
import { TicketCard } from "#components/TicketCard.tsx";
import { Timer } from "#components/Timer.tsx";
import { Input } from "#components/ui/input.tsx";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import { clearSession, getStoredSession } from "../../lib/participantAuth";

export const Route = createFileRoute("/retro/$sessionId")({
  component: RetroBoard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      name: (search.name as string) || undefined,
    };
  },
});

// Droppable zone for ungrouped tickets
function UngroupedZone({ children }: { children: ReactNode }) {
  const { ref, isDropTarget } = useDroppable({
    id: "ungrouped-zone",
  });

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-4 gap-3 rounded-lg p-4 transition-colors min-h-[200px]",
        isDropTarget && " ring-2 ",
      )}
    >
      {children}
    </div>
  );
}

function RetroBoard() {
  const { sessionId } = Route.useParams();
  const { name } = useSearch({ from: "/retro/$sessionId" });
  const navigate = useNavigate();

  const session = useQuery(api.retro.getSession, {
    sessionId: sessionId as Id<"sessions">,
  });
  const participants = useQuery(api.retro.getParticipants, {
    sessionId: sessionId as Id<"sessions">,
  });
  const tickets = useQuery(api.retro.getTickets, {
    sessionId: sessionId as Id<"sessions">,
  });
  const ticketGroups = useQuery(api.retro.getTicketGroups, {
    sessionId: sessionId as Id<"sessions">,
  });
  const votes = useQuery(api.retro.getVotes, {
    sessionId: sessionId as Id<"sessions">,
  });
  const myVotes = useQuery(
    api.retro.getParticipantVotes,
    name
      ? { sessionId: sessionId as Id<"sessions">, participantName: name }
      : "skip",
  );
  const actionItems = useQuery(
    api.retro.getActionItems,
    session ? { sprintNumber: session.sprintNumber - 1 } : "skip",
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
  const setvoteLimit = useMutation(api.retro.setvoteLimit);
  const startTimer = useMutation(api.retro.startTimer);
  const pauseTimer = useMutation(api.retro.pauseTimer);
  const resumeTimer = useMutation(api.retro.resumeTimer);
  const extendTimer = useMutation(api.retro.extendTimer);
  const completeDiscussion = useMutation(api.retro.completeDiscussion);
  const createActionItem = useMutation(api.retro.createActionItem);
  const toggleActionItemComplete = useMutation(
    api.retro.toggleActionItemComplete,
  );
  const updateHeartbeat = useMutation(api.retro.updateHeartbeat);
  const leaveSession = useMutation(api.retro.leaveSession);
  const removeParticipant = useMutation(api.retro.removeParticipant);

  const [addingTicketCategory, setAddingTicketCategory] = useState<
    "well" | "improve" | null
  >(null);
  const [editingTicketId, setEditingTicketId] = useState<Id<"tickets"> | null>(
    null,
  );
  const [newVoteLimit, setNewVoteLimit] = useState("");
  const [selectedParticipantFilter, setSelectedParticipantFilter] = useState<
    string | null
  >(null);

  // Get tickets sorted by votes (must be before early returns to satisfy Rules of Hooks)
  const ticketsByVotes = useMemo(() => {
    if (!tickets || !ticketGroups) return [];

    // Combine tickets and groups
    const items = [
      ...tickets
        .filter((t) => !t.groupId)
        .map((t) => ({ ...t, type: "ticket" as const })),
      ...ticketGroups.map((g) => ({ ...g, type: "group" as const })),
    ];

    return items.sort((a, b) => (b.voteLimit || 0) - (a.voteLimit || 0));
  }, [tickets, ticketGroups]);

  // Auto-rejoin logic: If no name in URL, check localStorage for stored session
  useEffect(() => {
    if (!name) {
      const stored = getStoredSession(sessionId as Id<"sessions">);
      if (stored) {
        // Auto-navigate with stored name
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
    updateHeartbeat({
      sessionId: sessionId as Id<"sessions">,
      participantName: name,
    }).catch((error) => {
      console.error("Failed to send heartbeat:", error);
    });

    // Set up interval for periodic heartbeats
    const heartbeatInterval = setInterval(() => {
      updateHeartbeat({
        sessionId: sessionId as Id<"sessions">,
        participantName: name,
      }).catch((error) => {
        console.error("Failed to send heartbeat:", error);
      });
    }, 30000); // 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [name, sessionId, updateHeartbeat]);

  // Check if current user is scrum master
  const isScrumMaster = session?.createdBy === name;

  // Get current user's participant data
  const currentParticipant = participants?.find((p) => p.name === name);

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

  // Handle phase change
  const handlePhaseChange = async (phase: typeof session.phase) => {
    if (!isScrumMaster || !name) return;
    await updatePhase({
      sessionId: sessionId as Id<"sessions">,
      phase,
      requestedBy: name,
    });
  };

  // Toggle ready status
  const handleToggleReady = async () => {
    if (!name) return;
    await toggleReady({
      sessionId: sessionId as Id<"sessions">,
      participantName: name,
    });
  };

  // Add ticket
  const handleAddTicket = async (text: string, imageUrl?: string) => {
    if (!name || !addingTicketCategory) return;
    await addTicket({
      sessionId: sessionId as Id<"sessions">,
      text,
      author: name,
      category: addingTicketCategory,
      imageUrl,
    });
    setAddingTicketCategory(null);
  };

  // Edit ticket
  const handleEditTicket = async (text: string, imageUrl?: string) => {
    if (!name || !editingTicketId) return;
    try {
      await updateTicket({
        ticketId: editingTicketId,
        text,
        imageUrl,
        author: name,
      });
      setEditingTicketId(null);
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
      await deleteTicket({
        ticketId,
        author: name,
      });
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
      await leaveSession({
        sessionId: sessionId as Id<"sessions">,
        participantName: name,
      });

      // Clear stored session from localStorage
      clearSession(sessionId as Id<"sessions">);

      // Navigate back to session list
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
      await removeParticipant({
        participantId,
        requestedBy: name,
      });
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

    const draggedTicket = tickets.find((t) => t._id === source.id);

    // Check if dropped on the ungrouped zone
    if (target.id === "ungrouped-zone" && draggedTicket) {
      // Remove ticket from its group
      await addTicketToGroup({
        ticketId: draggedTicket._id,
        groupId: undefined,
      });
      return;
    }

    // Dragging a ticket onto another ticket to create/add to group
    const targetTicket = tickets.find((t) => t._id === target.id);

    if (draggedTicket && targetTicket) {
      // If target has a group, add dragged to that group
      if (targetTicket.groupId) {
        await addTicketToGroup({
          ticketId: draggedTicket._id,
          groupId: targetTicket.groupId,
        });
      } else {
        // Create a new group with both tickets
        const groupId = await createGroup({
          sessionId: sessionId as Id<"sessions">,
        });
        await addTicketToGroup({
          ticketId: targetTicket._id,
          groupId,
        });
        await addTicketToGroup({
          ticketId: draggedTicket._id,
          groupId,
        });
      }
    }
  };

  // Handle voting (toggle: vote if not voted, withdraw if already voted)
  const handleVote = async (
    ticketId?: Id<"tickets">,
    groupId?: Id<"ticketGroups">,
  ) => {
    if (!name) return;

    // Check if user has already voted on this ticket/group
    const existingVote = myVotes?.find((vote) =>
      ticketId ? vote.ticketId === ticketId : vote.groupId === groupId,
    );

    if (existingVote) {
      // Withdraw vote
      await removeVote({ voteId: existingVote._id });
      return;
    }

    // Check vote limit before casting new vote
    const votesLeft = (session.voteLimit || 0) - (myVotes?.length || 0);
    if (votesLeft <= 0) {
      alert("You have used all your votes!");
      return;
    }

    // Cast new vote
    await castVote({
      sessionId: sessionId as Id<"sessions">,
      participantName: name,
      ticketId,
      groupId,
    });
  };

  // Set vote count
  const handleSetvoteLimit = async () => {
    const count = Number(newVoteLimit);
    if (count > 0) {
      await setvoteLimit({
        sessionId: sessionId as Id<"sessions">,
        voteLimit: count,
      });
      setNewVoteLimit("");
    }
  };

  // Render phase-specific content
  const renderPhaseContent = () => {
    switch (session.phase) {
      case "REVIEW_ACTIONS":
        return (
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 rounded-lg border   p-6">
              <h2 className="mb-2 text-2xl font-bold ">Review Action Items</h2>
              <p className="">
                Review action items from Sprint {session.sprintNumber - 1}
              </p>
            </div>

            {actionItems && actionItems.length > 0 ? (
              <ActionItemPanel
                actionItems={actionItems}
                participants={participants}
                onToggleComplete={(id) =>
                  toggleActionItemComplete({ actionItemId: id })
                }
              />
            ) : (
              <div className="rounded-lg border   p-8 text-center">
                <p className="">No action items from previous sprint</p>
              </div>
            )}
          </div>
        );

      case "ADD_TICKETS": {
        const wellTickets = tickets.filter((t) => t.category === "well");
        const improveTickets = tickets.filter((t) => t.category === "improve");

        return (
          <div>
            <div className="mb-6 rounded-lg border   p-6">
              <h2 className="mb-2 text-2xl font-bold ">Add Tickets</h2>
              <p className="">
                Add tickets to the board. Mark yourself as ready when done.
              </p>

              {currentParticipant && (
                <Button
                  onClick={handleToggleReady}
                  shadow={currentParticipant.isReady ? "reverse" : "default"}
                  className="mt-4"
                >
                  {currentParticipant.isReady ? "✓ Ready" : "Mark as Ready"}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <BoardColumn title="What Went Well" category="well">
                {wellTickets.map((ticket) =>
                  editingTicketId === ticket._id ? (
                    <EditTicketForm
                      key={ticket._id}
                      initialText={ticket.text}
                      initialImageUrl={ticket.imageUrl}
                      category="well"
                      onSubmit={handleEditTicket}
                      onCancel={() => setEditingTicketId(null)}
                    />
                  ) : (
                    <TicketCard
                      id={ticket._id}
                      key={ticket._id}
                      {...ticket}
                      currentUserName={name}
                      onEdit={() => setEditingTicketId(ticket._id)}
                      onDelete={() => handleDeleteTicket(ticket._id)}
                    />
                  ),
                )}

                {addingTicketCategory === "well" ? (
                  <AddTicketForm
                    category="well"
                    onSubmit={handleAddTicket}
                    onCancel={() => setAddingTicketCategory(null)}
                  />
                ) : (
                  <Button
                    onClick={() => setAddingTicketCategory("well")}
                    variant="neutral"
                    className="w-full"
                  >
                    + Add Ticket
                  </Button>
                )}
              </BoardColumn>

              <BoardColumn title="To Improve" category="improve">
                {improveTickets.map((ticket) =>
                  editingTicketId === ticket._id ? (
                    <EditTicketForm
                      key={ticket._id}
                      initialText={ticket.text}
                      initialImageUrl={ticket.imageUrl}
                      category="improve"
                      onSubmit={handleEditTicket}
                      onCancel={() => setEditingTicketId(null)}
                    />
                  ) : (
                    <TicketCard
                      id={ticket._id}
                      key={ticket._id}
                      {...ticket}
                      currentUserName={name}
                      onEdit={() => setEditingTicketId(ticket._id)}
                      onDelete={() => handleDeleteTicket(ticket._id)}
                    />
                  ),
                )}

                {addingTicketCategory === "improve" ? (
                  <AddTicketForm
                    category="improve"
                    onSubmit={handleAddTicket}
                    onCancel={() => setAddingTicketCategory(null)}
                  />
                ) : (
                  <Button
                    onClick={() => setAddingTicketCategory("improve")}
                    variant="neutral"
                    className="w-full"
                  >
                    + Add Ticket
                  </Button>
                )}
              </BoardColumn>
            </div>
          </div>
        );
      }

      case "PRESENT": {
        const wellTickets = tickets.filter((t) => t.category === "well");
        const improveTickets = tickets.filter((t) => t.category === "improve");

        return (
          <div>
            <div className="mb-6 rounded-lg border   p-6">
              <h2 className="mb-2 text-2xl font-bold ">Present Tickets</h2>
              <p className="">
                {selectedParticipantFilter
                  ? `Focusing on ${selectedParticipantFilter}'s tickets`
                  : "Select a participant to focus on their tickets"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <BoardColumn title="What Went Well" category="well">
                {wellTickets.map((ticket) => (
                  <TicketCard
                    id={ticket._id}
                    key={ticket._id}
                    {...ticket}
                    isHighlighted={
                      selectedParticipantFilter
                        ? ticket.author === selectedParticipantFilter
                        : false
                    }
                    isDimmed={
                      selectedParticipantFilter
                        ? ticket.author !== selectedParticipantFilter
                        : false
                    }
                  />
                ))}
              </BoardColumn>

              <BoardColumn title="To Improve" category="improve">
                {improveTickets.map((ticket) => (
                  <TicketCard
                    id={ticket._id}
                    key={ticket._id}
                    {...ticket}
                    isHighlighted={
                      selectedParticipantFilter
                        ? ticket.author === selectedParticipantFilter
                        : false
                    }
                    isDimmed={
                      selectedParticipantFilter
                        ? ticket.author !== selectedParticipantFilter
                        : false
                    }
                  />
                ))}
              </BoardColumn>
            </div>
          </div>
        );
      }

      case "GROUP":
        return (
          <DragDropProvider onDragEnd={handleDragEnd}>
            <div>
              <div className="mb-6 rounded-lg border p-6">
                <h2 className="mb-2 text-2xl font-bold ">Group Tickets</h2>
                <p className="">
                  Drag and drop related tickets together to create groups
                </p>
              </div>

              {/* Groups */}
              {ticketGroups && ticketGroups.length > 0 && (
                <div className="mb-6 space-y-4">
                  {ticketGroups.map((group) => (
                    <div key={group._id} className="rounded-lg border-2 p-4">
                      <div className="mb-3 text-sm font-semibold ">
                        Group ({group.tickets.length} tickets)
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {group.tickets.map((ticket) => (
                          <DraggableTicketCard
                            key={ticket._id}
                            id={ticket._id}
                            voteLimit={group.voteLimit}
                            {...ticket}
                            isGrouped
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ungrouped tickets */}
              <div>
                <div className="mb-3 text-sm font-semibold ">
                  Ungrouped Tickets
                </div>
                <UngroupedZone>
                  {tickets
                    .filter((t) => !t.groupId)
                    .map((ticket) => (
                      <DraggableTicketCard
                        key={ticket._id}
                        id={ticket._id}
                        {...ticket}
                      />
                    ))}
                </UngroupedZone>
              </div>
            </div>
          </DragDropProvider>
        );

      case "VOTE": {
        const votesLeft = (session.voteLimit || 0) - (myVotes?.length || 0);

        return (
          <div>
            <div className="mb-6 rounded-lg border p-6">
              <h2 className="mb-2 text-2xl font-bold ">Vote on Tickets</h2>
              <p className="">
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
                  <Button onClick={handleSetvoteLimit} disabled={!newVoteLimit}>
                    Set Vote Count
                  </Button>
                </div>
              )}
            </div>

            {/* Groups with votes */}
            {ticketGroups && ticketGroups.length > 0 && (
              <div className="mb-6 space-y-4">
                {ticketGroups.map((group) => {
                  const hasVoted = myVotes?.some(
                    (vote) => vote.groupId === group._id,
                  );
                  return (
                    <div key={group._id} className="rounded-lg border-2   p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-semibold ">
                          Group ({group.tickets.length} tickets)
                        </div>
                        {session.voteLimit && (
                          <Button
                            type="button"
                            onClick={() => handleVote(undefined, group._id)}
                            size="sm"
                            shadow={hasVoted ? "reverse" : "default"}
                          >
                            {hasVoted ? "Withdraw" : "Vote"} ({group.voteLimit})
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {group.tickets.map((ticket) => (
                          <TicketCard
                            id={ticket._id}
                            key={ticket._id}
                            {...ticket}
                            voteLimit={group.voteLimit}
                            isGrouped
                          />
                        ))}
                      </div>
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
                      id={ticket._id}
                      hasVoted={hasVoted}
                      onVote={
                        session.voteLimit
                          ? () => handleVote(ticket._id)
                          : undefined
                      }
                    />
                  );
                })}
            </div>
          </div>
        );
      }

      case "DISCUSS":
        return (
          <div>
            <div className="mb-6 rounded-lg border   p-6">
              <h2 className="mb-2 text-2xl font-bold ">
                Discuss & Create Action Items
              </h2>
              <p className="">
                Discuss tickets sorted by votes and create action items
              </p>
            </div>

            {session.timerState && (
              <div className="mb-6">
                <Timer
                  {...session.timerState}
                  onPause={() =>
                    pauseTimer({ sessionId: sessionId as Id<"sessions"> })
                  }
                  onResume={() =>
                    resumeTimer({ sessionId: sessionId as Id<"sessions"> })
                  }
                  onExtend={(time) =>
                    extendTimer({
                      sessionId: sessionId as Id<"sessions">,
                      additionalTime: time,
                    })
                  }
                  onComplete={() =>
                    completeDiscussion({
                      sessionId: sessionId as Id<"sessions">,
                    })
                  }
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
                        <div className="text-sm font-semibold ">
                          Group ({item.tickets?.length || 0} tickets) •{" "}
                          {item.voteLimit} votes
                        </div>
                        {isScrumMaster && !session.timerState && (
                          <Button
                            type="button"
                            onClick={() =>
                              startTimer({
                                sessionId: sessionId as Id<"sessions">,
                                duration: 300000, // 5 minutes
                              })
                            }
                            size="sm"
                          >
                            Start Timer
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {item.tickets?.map((ticket) => (
                          <TicketCard
                            id={ticket._id}
                            key={ticket._id}
                            {...ticket}
                            isGrouped
                            voteLimit={0}
                          />
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
                            startTimer({
                              sessionId: sessionId as Id<"sessions">,
                              duration: 300000, // 5 minutes
                              ticketId: item._id as Id<"tickets">,
                            })
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

      case "COMPLETED":
        return (
          <div className="mx-auto max-w-4xl text-center">
            <div className="rounded-lg border   p-12">
              <h2 className="mb-4 text-3xl font-bold ">Retro Completed! 🎉</h2>
              <p className="mb-6 ">
                Sprint {session.sprintNumber} retrospective is complete
              </p>
              <Button onClick={() => navigate({ to: "/" })}>
                Back to Sessions
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen  py-8 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold ">
              Sprint {session.sprintNumber} Retro
            </h1>
            <p className="mt-1 text-sm ">
              Phase: {session.phase.replace("_", " ")} • Logged in as: {name}
            </p>
          </div>

          <Button onClick={() => navigate({ to: "/" })} variant="neutral">
            ← Back
          </Button>
        </div>

        {/* Main content with sidebar */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 shrink-0 space-y-4">
            <ParticipantList
              participants={participants}
              scrumMaster={session.createdBy}
              currentPresenter={selectedParticipantFilter || undefined}
              currentUserName={name}
              sessionId={sessionId as Id<"sessions">}
              onSelectPresenter={
                session.phase === "PRESENT"
                  ? (name) => {
                      setSelectedParticipantFilter((prev) =>
                        prev === name ? null : name,
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

          {/* Main content */}
          <div className="flex-1">{renderPhaseContent()}</div>
        </div>
      </div>
    </div>
  );
}

// Name entry screen component
