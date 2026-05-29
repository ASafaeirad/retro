import { cva, type VariantProps } from "class-variance-authority";
import { Label, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cn, join } from "#lib/cn";

export function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

const radioGroupItemVariant = cva(
  join(
    "flex rounded-full items-center justify-center text-main-foreground bg-white border-2 border-border shadow-shadow transition-all transition-200 cursor-pointer",
    "data-[state=checked]:translate-x-boxShadowX data-[state=checked]:translate-y-boxShadowY data-[state=checked]:shadow-none data-[state=checked]:bg-main",
    "focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-hidden",
  ),
  {
    variants: {
      size: {
        md: "size-12",
        sm: "size-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export function RadioGroupItem({
  className,
  children,
  size,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof radioGroupItemVariant>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariant({ size }), className)}
      {...props}
    >
      <Label.Label>{children}</Label.Label>
    </RadioGroupPrimitive.Item>
  );
}
