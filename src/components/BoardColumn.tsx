import type { ReactNode } from "react";
import { cn } from "#lib/cn";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";

interface BoardColumnProps {
  title: string;
  category: "well" | "improve";
  children: ReactNode;
  className?: string;
  onAdd?: () => void;
}

export function BoardColumn({
  title,
  category,
  children,
  onAdd,
}: BoardColumnProps) {
  return (
    <Card
      space="compact"
      className={cn("h-full", {
        "bg-column-1": category === "well",
        "bg-column-2": category === "improve",
      })}
    >
      <CardHeader>
        <h2>{title}</h2>
      </CardHeader>

      <CardContent className="gap-4">{children}</CardContent>
    </Card>
  );
}
