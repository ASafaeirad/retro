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
  onClick?: () => void;
  onVote?: () => void;
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
  onClick,
  onVote,
  className,
}: TicketCardProps) {
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
            onClick={(e) => {
              e.stopPropagation();
              onVote();
            }}
            className="rounded-md bg-[var(--lagoon)] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[var(--lagoon-deep)]"
          >
            Vote
          </button>
        )}
      </div>
    </div>
  );
}
