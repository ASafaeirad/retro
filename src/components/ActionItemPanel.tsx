import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "#convex/api";
import type { Id } from "#convex/models";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import { TicketCard } from "./TicketCard";
import { Card, CardContent, CardHeader } from "./ui/card";

interface Props {
  className?: string;
  sessionId: Id<"sessions">;
  children?: React.ReactNode;
  currentUser: string;
}

export function ActionItemPanel({
  currentUser,
  sessionId,
  className,
  children,
}: Props) {
  const actionItems = useQuery(api.retro.getActionItems, { sessionId });
  const createActionItem = useMutation(api.retro.createActionItem);
  const deleteActionItem = useMutation(api.retro.deleteActionItem);

  const handleCreate = () => {
    createActionItem({
      text: "",
      assignee: undefined,
      createdInSession: sessionId,
    });
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
        <Button onClick={() => handleCreate()} full size="sm">
          + Add
        </Button>

        {actionItems?.map((item) => (
          <TicketCard
            key={item._id}
            text={item.text}
            author={currentUser}
            currentUserName={currentUser}
            voteLimit={0}
            isDimmed={item.completed}
            onDelete={() => deleteActionItem({ actionItemId: item._id })}
            onClick={() => {}}
          />
        ))}

        {actionItems?.length === 0 && (
          <p className="text-sm text-center text-foreground-muted py-4">
            No action items yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
