import { useState } from "react";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import type { Id } from "../../../convex/_generated/dataModel";

interface ActionItem {
  _id: Id<"actionItems">;
  text: string;
  assignee?: string;
  completed: boolean;
  completedAt?: number;
}

interface ActionItemPanelProps {
  actionItems: ActionItem[];
  participants: { name: string }[];
  onToggleComplete?: (id: Id<"actionItems">) => void;
  onCreateActionItem?: (text: string, assignee?: string) => void;
  isCreating?: boolean;
  className?: string;
}

export function ActionItemPanel({
  actionItems,
  participants,
  onToggleComplete,
  onCreateActionItem,
  isCreating = false,
  className,
}: ActionItemPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAssignee, setNewAssignee] = useState("");

  const handleCreate = () => {
    if (newText.trim() && onCreateActionItem) {
      onCreateActionItem(newText.trim(), newAssignee || undefined);
      setNewText("");
      setNewAssignee("");
      setIsAdding(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--sea-ink)]">
          Action Items ({actionItems.length})
        </h3>

        {onCreateActionItem && !isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            + Add
          </Button>
        )}
      </div>

      {/* Action items list */}
      <div className="space-y-2">
        {actionItems.map((item) => (
          <div
            key={item._id}
            className={cn(
              "rounded-md border border-[var(--line)] bg-[var(--chip-bg)] p-3 transition-colors",
              item.completed && "opacity-60",
            )}
          >
            <div className="flex items-start gap-2">
              {onToggleComplete && (
                <Button
                  onClick={() => onToggleComplete(item._id)}
                  variant="noShadow"
                  size="icon"
                  className={cn(
                    "mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2 transition-colors",
                    item.completed
                      ? "border-[var(--lagoon)] bg-[var(--lagoon)]"
                      : "border-[var(--line)] bg-transparent",
                  )}
                >
                  {item.completed && (
                    <svg
                      className="h-full w-full text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </Button>
              )}

              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm text-[var(--sea-ink)]",
                    item.completed && "line-through",
                  )}
                >
                  {item.text}
                </p>
                {item.assignee && (
                  <span className="mt-1 inline-block text-xs text-[var(--sea-ink-soft)]">
                    Assigned to: {item.assignee}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {actionItems.length === 0 && !isAdding && (
          <p className="text-sm text-[var(--sea-ink-soft)] text-center py-4">
            No action items yet
          </p>
        )}
      </div>

      {/* Add new action item form */}
      {isAdding && (
        <div className="mt-3 space-y-2 rounded-md border-2 border-[var(--lagoon)] bg-[var(--chip-bg)] p-3">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Action item description..."
            className="w-full resize-none rounded-md border border-[var(--line)] bg-white dark:bg-[var(--foam)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-1 focus:ring-[var(--lagoon)]"
            rows={2}
            autoFocus
          />

          <select
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            className="w-full rounded-md border border-[var(--line)] bg-white dark:bg-[var(--foam)] px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-1 focus:ring-[var(--lagoon)]"
          >
            <option value="">Assign to... (optional)</option>
            {participants.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              disabled={!newText.trim() || isCreating}
              size="sm"
              className="flex-1"
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewText("");
                setNewAssignee("");
              }}
              variant="neutral"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
