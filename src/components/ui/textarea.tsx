import { cn } from "#lib/cn";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full  read-only:cursor-default rounded-base border-border selection:bg-main selection:text-main-foreground text-sm font-base text-foreground placeholder:text-foreground/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 field-sizing-content",
        className,
      )}
      {...props}
    />
  );
}
