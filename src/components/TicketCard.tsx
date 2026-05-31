import { debounce } from "@fullstacksjs/toolbox";
import { ThumbsUp, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Toggle } from "./ui/toggle";

interface TicketCardProps {
  text: string;
  author?: string;
  imageUrl?: string;
  isDimmed?: boolean;
  hasVoted?: boolean; // Whether the current user has voted on this ticket
  onClick?: () => void;
  onVote?: () => void;
  onEdit?: (text: string) => void;
  onDelete?: () => void;
  currentUserName?: string;
  readonly?: boolean;
}

export function TicketCard({
  text,
  author,
  imageUrl,
  isDimmed = false,
  hasVoted = false,
  onClick,
  onVote,
  onEdit,
  onDelete,
  currentUserName,
  readonly,
}: TicketCardProps) {
  const isAuthor = currentUserName && currentUserName === author;
  const [optimisticText, setOptimisticText] = useState(text);
  const [debouncedFn] = useState(() =>
    debounce({ delay: 1000 }, (text: string) => onEdit?.(text)),
  );
  useEffect(() => {
    setOptimisticText(text);
  }, [text]);

  return (
    <Card
      variant="main"
      onClick={onClick}
      space="compact"
      shadow={isDimmed ? "none" : "default"}
      className={cn("relative py-2 px-1 transition-all", {
        "opacity-70 bg-muted": isDimmed,
      })}
    >
      <CardContent className="px-1">
        {((isAuthor && onDelete) || onVote) && (
          <div className="absolute right-2 top-2 flex gap-1">
            {isAuthor && onDelete && (
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
            {onVote && (
              <div>
                <Toggle onClick={onVote} size="xs">
                  <ThumbsUp />
                </Toggle>
              </div>
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
          readOnly={readonly || !onEdit || !isAuthor}
          onChange={(e) => {
            setOptimisticText(e.target.value);
            debouncedFn(e.target.value);
          }}
          placeholder="Action item description..."
          className="pb-2"
          autoFocus
        />
      </CardContent>
      <CardFooter className="absolute w-full bottom-1 left-1 flex items-center justify-between pl-1">
        <span className="text-xs text-foreground-muted">{author}</span>
      </CardFooter>
    </Card>
  );
}
