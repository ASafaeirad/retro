import { useDraggable, useDroppable } from '@dnd-kit/react'
import { TicketCard } from './TicketCard'
import type { Id } from '../../../convex/_generated/dataModel'

interface DraggableTicketCardProps {
  id: Id<'tickets'>
  text: string
  author: string
  imageUrl?: string
  voteLimit: number
  category: 'well' | 'improve'
  isHighlighted?: boolean
  isDimmed?: boolean
  isGrouped?: boolean
  onClick?: () => void
  onVote?: () => void
  className?: string
}

export function DraggableTicketCard(props: DraggableTicketCardProps) {
  const { ref: draggableRef } = useDraggable({
    id: props.id,
  })

  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: props.id,
  })

  // Combine refs by calling both on the same element
  const setRefs = (element: HTMLDivElement | null) => {
    draggableRef(element)
    droppableRef(element)
  }

  return (
    <div ref={setRefs}>
      <TicketCard
        {...props}
        className={isDropTarget ? 'ring-2 ring-[var(--lagoon)]' : props.className}
      />
    </div>
  )
}
