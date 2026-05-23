import { cn } from "#lib/cn";
import type { Id } from "../../../convex/_generated/dataModel";

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
        "relative rounded-lg border-2 bg-[var(--surface)] p-4 shadow-sm transition-all",
        "hover:shadow-md",
        isHighlighted && "ring-2 ring-[var(--lagoon)] border-[var(--lagoon)]",
        isDimmed && "opacity-40",
        isGrouped && "border-[var(--palm)]",
        category === "well" && "border-[var(--lagoon-deep)]",
        category === "improve" && "border-[var(--palm)]",
        onClick && "cursor-pointer",
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
        <div className="absolute -right-1 -top-1 flex gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lagoon)] text-white shadow-sm transition-colors hover:bg-[var(--lagoon-deep)]"
              title="Edit ticket"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-3 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--palm)] text-white shadow-sm transition-colors hover:bg-red-600"
              title="Delete ticket"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-3 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
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
      <p className="mb-3 text-[var(--sea-ink)] text-sm leading-relaxed">
        {text}
      </p>

      {/* Author and actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--sea-ink-soft)] font-medium">
          {author}
        </span>

        {onVote && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVote();
            }}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium text-white transition-colors",
              hasVoted
                ? "bg-[var(--palm)] hover:bg-red-600"
                : "bg-[var(--lagoon)] hover:bg-[var(--lagoon-deep)]",
            )}
          >
            {hasVoted ? "Withdraw" : "Vote"}
          </button>
        )}
      </div>
    </div>
  );
}
