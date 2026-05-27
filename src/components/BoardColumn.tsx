import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";

interface BoardColumnProps {
  title: string;
  category: "well" | "improve";
  children: ReactNode;
  className?: string;
}

export function BoardColumn({ title, category, children }: BoardColumnProps) {
  return (
    <Card
      space="compact"
      className={category === "well" ? "bg-column-1" : "bg-column-2"}
    >
      <CardHeader>
        <h2>{title}</h2>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}
