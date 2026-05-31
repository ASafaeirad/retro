import { useDraggable, useDroppable } from "@dnd-kit/react";
import type { Id } from "#convex/models";
import { TicketCard } from "./TicketCard";

type DraggableTicketCardProps = React.ComponentProps<typeof TicketCard> & {
  id: Id<"tickets">;
};

export function DraggableTicketCard(props: DraggableTicketCardProps) {
  const { ref: draggableRef, isDragging } = useDraggable({
    id: props.id,
  });

  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: props.id,
  });

  const setRefs = (element: HTMLDivElement | null) => {
    draggableRef(element);
    droppableRef(element);
  };

  return (
    <div
      ref={setRefs}
      className={`relative cursor-grab active:cursor-grabbing touch-none ${isDropTarget ? "ring-2 rounded-lg" : ""} ${isDragging ? "opacity-50" : ""}`}
    >
      <TicketCard {...props} />
      <div className="absolute inset-0" />
    </div>
  );
}
