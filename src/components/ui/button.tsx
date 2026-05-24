import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, join } from "#lib/cn";

const buttonVariants = cva(
  join(
    "inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-base",
    "ring-offset-white transition-all gap-2",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ),
  {
    variants: {
      variant: {
        default:
          "text-main-foreground bg-main border-2 border-border cursor-pointer",
        neutral:
          "bg-secondary-background text-foreground border-2 border-border ",
        danger: "bg-danger border-2 border-border",
      },
      shadow: {
        default:
          "shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none",
        reverse:
          "hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:shadow-shadow",
        none: "shadow-none",
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
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      type="button"
      className={cn(buttonVariants({ variant, size, shadow, className }))}
      {...props}
    />
  );
}
