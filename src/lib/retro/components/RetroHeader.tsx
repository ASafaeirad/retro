import { Card } from "#components/ui/card.tsx";
import { cn } from "#lib/cn";

export function RetroHeader() {
  return (
    <Card className="flex flex-row p-2 gap-0 items-center justify-start w-full">
      <h3 className={cn("py-1 px-2 text-sm text-nowrap")}>
        Sprint Retrospective
      </h3>
    </Card>
  );
}
