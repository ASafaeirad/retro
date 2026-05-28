import { debounce } from "@fullstacksjs/toolbox";
import { ThumbsUp, Trash } from "lucide-react";
import { useState } from "react";
import type { Id } from "#convex/models";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface TicketCardProps {
  id: Id<"tickets">;
  text: string;
  author: string;
  imageUrl?: string;
  voteLimit: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  hasVoted?: boolean; // Whether the current user has voted on this ticket
  onClick?: () => void;
  onVote?: () => void;
  onEdit?: (text: string) => void;
  onDelete?: () => void;
  currentUserName?: string;
  className?: string;
}

export function TicketCard({
  text,
  author,
  imageUrl,
  voteLimit,
  isHighlighted = false,
  isDimmed = false,
  hasVoted = false,
  onClick,
  onVote,
  onEdit,
  onDelete,
  currentUserName,
  className,
}: TicketCardProps) {
  const isAuthor = currentUserName && currentUserName === author;
  const [optimisticText, setOptimisticText] = useState(text);
  const [debouncedFn] = useState(() =>
    debounce({ delay: 1000 }, (text: string) => onEdit?.(text)),
  );

  return (
    <Card
      variant="main"
      onClick={onClick}
      space="compact"
      className={cn(
        "relative py-2 px-1",
        {
          "ring-2": isHighlighted,
          "opacity-40": isDimmed,
          "cursor-pointer": onClick,
        },
        className,
      )}
    >
      <CardContent className="px-1">
        {isAuthor && onDelete && (
          <div className="absolute right-2 top-2 flex gap-1">
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

        {/* {imageUrl && (
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
      )} */}

        <Textarea
          value={optimisticText}
          onChange={(e) => {
            setOptimisticText(e.target.value);
            debouncedFn(e.target.value);
          }}
          placeholder="Action item description..."
          rows={2}
          autoFocus
        />
      </CardContent>
      <CardFooter className="absolute bottom-1 left-1 flex items-center justify-between px-1">
        <span className="text-xs font-medium">{author}</span>

        {onVote && (
          <div>
            <Button
              onClick={onVote}
              size="xs"
              shadow={hasVoted ? "reverse" : "default"}
            >
              <ThumbsUp />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
