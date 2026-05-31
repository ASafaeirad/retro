import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn, join } from "#lib/cn";

export const buttonVariants = cva(
  join(
    "inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-base cursor-pointer",
    "ring-offset-white transition-all gap-2",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:bg-muted disabled:shadow-none disabled:border-foreground-muted disabled:text-foreground-muted",
  ),
  {
    variants: {
      full: {
        true: "w-full",
      },
      variant: {
        default:
          "text-main-foreground bg-main border-2 border-border cursor-pointer",
        neutral: "bg-white text-foreground border-2 border-border",
        secondary:
          "bg-secondary-background text-foreground border-2 border-border",
        danger: "bg-danger border-2 border-border",
      },
      shadow: {
        default:
          "shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none",
        reverse:
          "hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:shadow-shadow",
        none: "shadow-none",
        fixed: "shadow-shadow",
      },
      size: {
        default: "h-9 px-3 py-2",
        xs: "h-6 px-1 text-xs",
        sm: "h-6 px-2 py-3",
        lg: "h-11 px-8",
        icon: "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shadow: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  shadow,
  full,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Slot : "button";

  return (
    <Comp
      data-slot="button"
      type="button"
      className={cn(buttonVariants({ variant, size, shadow, className, full }))}
      {...props}
    />
  );
}
