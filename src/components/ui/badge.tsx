import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, join } from "#lib/cn";

const badgeVariants = cva(
  join(
    "inline-flex items-center justify-center font-base w-fit whitespace-nowrap shrink-0 overflow-hidden",
    "rounded-sm border-2 border-border",
    "[&>svg]:size-3 gap-1 [&>svg]:pointer-events-none",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  ),
  {
    variants: {
      variant: {
        default: "bg-main text-main-foreground",
        secondary: "bg-secondary-background",
        neutral: "bg-secondary-background text-foreground",
      },
      size: {
        default: "text-sm px-2.5 py-0.5",
        sm: "text-xs px-1.5 py-0.5",
        xs: "text-xs px-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}
