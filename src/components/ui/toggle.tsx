import { cva, type VariantProps } from "class-variance-authority";
import { Switch } from "radix-ui";
import { join } from "#lib/cn";

export const buttonVariants = cva(
  join(
    "inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-base cursor-pointer",
    "ring-offset-white transition-all gap-2",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:bg-muted disabled:shadow-none disabled:border-foreground-muted disabled:text-foreground-muted",
    "shadow-shadow data-[state=checked]:shadow-none",
  ),
  {
    variants: {
      variant: {
        default:
          "text-main-foreground bg-main border-2 border-border cursor-pointer",
        neutral: "bg-white text-foreground border-2 border-border",
        secondary:
          "bg-secondary-background text-foreground border-2 border-border",
        danger: "bg-danger border-2 border-border",
      },
      size: {
        default: "h-9 px-3 py-2  [&_svg]:size-4",
        xs: "h-6 px-1 text-xs [&_svg]:size-3",
        sm: "h-6 px-2 py-3 [&_svg]:size-4",
        icon: "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export const Toggle = ({
  className,
  size,
  ...props
}: React.ComponentProps<typeof Switch.Root> &
  Pick<VariantProps<typeof buttonVariants>, "size">) => {
  return (
    <Switch.Root className={buttonVariants({ size })} {...props}></Switch.Root>
  );
};
