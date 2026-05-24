import { ActionItemPanel } from "#components/ActionItemPanel.tsx";
import { ParticipantList } from "#components/ParticipantList.tsx";
import { PhaseControls } from "#components/PhaseControls.tsx";
import type { Id } from "#convex/models";
import type { Session } from "#models/session.ts";

interface RetroSidebarProps {
  sessionId: Id<"sessions">;
  session: Session;
  participants: any[];
  actionItems?: any[];
  currentUserName: string;
  isScrumMaster: boolean;
  selectedParticipantFilter?: string | null;
  onSelectPresenter?: (name: string) => void;
  onLeaveSession: () => void;
  onRemoveParticipant?: (participantId: Id<"participants">) => void;
  onPhaseChange: (phase: any) => void;
  onCreateActionItem?: (text: string, assignee: string) => void;
}

export function RetroSidebar({
  sessionId,
  session,
  participants,
  actionItems,
  currentUserName,
  isScrumMaster,
  selectedParticipantFilter,
  onSelectPresenter,
  onLeaveSession,
  onRemoveParticipant,
  onPhaseChange,
  onCreateActionItem,
}: RetroSidebarProps) {
  return (
    <div className="w-64 shrink-0 space-y-4">
      <ParticipantList
        participants={participants}
        scrumMaster={session.createdBy}
        currentPresenter={selectedParticipantFilter || undefined}
        currentUserName={currentUserName}
        sessionId={sessionId}
        onSelectPresenter={onSelectPresenter}
        onLeaveSession={onLeaveSession}
        onRemoveParticipant={onRemoveParticipant}
      />

      {isScrumMaster && (
        <PhaseControls
          currentPhase={session.phase}
          onPhaseChange={onPhaseChange}
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
          onCreateActionItem={onCreateActionItem}
        />
      )}
    </div>
  );
}
