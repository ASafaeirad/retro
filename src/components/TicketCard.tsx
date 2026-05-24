import { Edit, Trash } from "lucide-react";
import type { Id } from "#convex/models";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";

interface TicketCardProps {
  id: Id<"tickets">;
  text: string;
  author: string;
  imageUrl?: string;
  voteLimit: number;
  category: "well" | "improve";
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isGrouped?: boolean;
  hasVoted?: boolean; // Whether the current user has voted on this ticket
  onClick?: () => void;
  onVote?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  currentUserName?: string;
  className?: string;
}

export function TicketCard({
  text,
  author,
  imageUrl,
  voteLimit,
  category,
  isHighlighted = false,
  isDimmed = false,
  isGrouped = false,
  hasVoted = false,
  onClick,
  onVote,
  onEdit,
  onDelete,
  currentUserName,
  className,
}: TicketCardProps) {
  const isAuthor = currentUserName && currentUserName === author;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-lg border-2 p-4 shadow-sm transition-all",
        {
          "ring-2": isHighlighted,
          "opacity-40": isDimmed,
          "cursor-pointer": onClick,
        },
        className,
      )}
    >
      {/* Vote count badge */}
      {voteLimit > 0 && (
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lagoon)] text-sm font-bold text-white shadow-md">
          {voteLimit}
        </div>
      )}

      {/* Edit/Delete buttons for author */}
      {isAuthor && (onEdit || onDelete) && (
        <div className="absolute right-2 top-2 flex gap-1">
          {onEdit && (
            <Button
              onClick={onEdit}
              size="icon"
              variant="neutral"
              shadow="reverse"
              title="Edit ticket"
            >
              <Edit />
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              size="icon"
              variant="danger"
              shadow="reverse"
              title="Delete ticket"
            >
              <Trash />
            </Button>
          )}
        </div>
      )}

      {/* Image if provided */}
      {imageUrl && (
        <div className="mb-3 overflow-hidden rounded-md">
          <img
            src={imageUrl}
            alt=""
            className="h-32 w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Ticket text */}
      <p className="mb-3 text-sm leading-relaxed">{text}</p>

      {/* Author and actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{author}</span>

        {onVote && (
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVote();
            }}
            size="sm"
            shadow={hasVoted ? "reverse" : "default"}
          >
            {hasVoted ? "Withdraw" : "Vote"}
          </Button>
        )}
      </div>
    </div>
  );
}
