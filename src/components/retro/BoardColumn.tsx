import { cn } from "#lib/cn";
import type { ReactNode } from "react";

interface BoardColumnProps {
  title: string;
  category: "well" | "improve";
  children: ReactNode;
  className?: string;
}

export function BoardColumn({
  title,
  category,
  children,
  className,
}: BoardColumnProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "mb-4 rounded-lg border-2 px-4 py-3",
          category === "well" &&
            "border-[var(--lagoon-deep)] bg-gradient-to-br from-[var(--hero-a)] to-transparent",
          category === "improve" &&
            "border-[var(--palm)] bg-gradient-to-br from-[var(--hero-b)] to-transparent",
        )}
      >
        <h2 className="text-lg font-semibold text-[var(--sea-ink)]">{title}</h2>
      </div>

      <div className="flex-1 space-y-3">{children}</div>
    </div>
  );
}
