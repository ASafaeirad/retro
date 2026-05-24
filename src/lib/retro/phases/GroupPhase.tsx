import {
  DragDropProvider,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/react";
import type { ReactNode } from "react";
import { DraggableTicketCard } from "#components/DraggableTicketCard.tsx";
import { cn } from "#lib/cn";

interface GroupPhaseProps {
  tickets: any[];
  ticketGroups?: any[];
  onDragEnd: (event: DragEndEvent) => void;
}

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

export function GroupPhase({
  tickets,
  ticketGroups,
  onDragEnd,
}: GroupPhaseProps) {
  return (
    <DragDropProvider onDragEnd={onDragEnd}>
      <div>
        <div className="mb-6 rounded-lg border p-6">
          <h2 className="mb-2 text-2xl font-bold">Group Tickets</h2>
          <p>Drag and drop related tickets together to create groups</p>
        </div>

        {/* Groups */}
        {ticketGroups && ticketGroups.length > 0 && (
          <div className="mb-6 space-y-4">
            {ticketGroups.map((group) => (
              <div key={group._id} className="rounded-lg border-2 p-4">
                <div className="mb-3 text-sm font-semibold">
                  Group ({group.tickets.length} tickets)
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {group.tickets.map((ticket: any) => (
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
          <div className="mb-3 text-sm font-semibold">Ungrouped Tickets</div>
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
}
