import { useMutation, useQuery } from "convex/react";
import { Check } from "lucide-react";
import { useState } from "react";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface ActionItem {
  _id: Id<"actionItems">;
  text: string;
  assignee?: string;
  completed: boolean;
  completedAt?: number;
}

interface ActionItemPanelProps {
  className?: string;
  sessionId: Id<"sessions">;
  children?: React.ReactNode;
}

export function ActionItemPanel({
  sessionId,
  className,
  children,
}: ActionItemPanelProps) {
  const actionItems = useQuery(api.retro.getActionItems, { sessionId });
  const createActionItem = useMutation(api.retro.createActionItem);

  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState("");

  const handleCreate = () => {
    if (newText.trim()) {
      createActionItem({
        text: newText.trim(),
        assignee: undefined,
        createdInSession: sessionId,
      });
      setNewText("");
      setIsAdding(false);
    }
  };

  return (
    <Card className={cn("pt-2 pb-4 gap-2", className)}>
      <CardHeader>
        <h3 className="text-sm font-semibold">
          Action Items ({actionItems?.length ?? 0})
        </h3>
        {children}
      </CardHeader>

      <CardContent className="gap-4">
        {actionItems?.map((item) => (
          <Card key={item._id} variant="main" className={cn("p-3 h-40")}>
            <p className={cn("text-sm")}>{item.text}</p>
          </Card>
        ))}

        {actionItems?.length === 0 && !isAdding && (
          <p className="text-sm text-center text-foreground-muted py-4">
            No action items yet
          </p>
        )}

        {isAdding && (
          <Card variant="main">
            <CardContent className="gap-3">
              <Textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Action item description..."
                rows={2}
                autoFocus
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={!newText.trim()}
                  size="sm"
                  className="flex-1"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false);
                    setNewText("");
                  }}
                  variant="neutral"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} full size="sm">
            + Add
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
