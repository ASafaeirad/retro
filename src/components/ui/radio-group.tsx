import { Label } from "@radix-ui/react-label";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import type * as React from "react";
import { cn } from "#lib/cn";

function RadioGroup({
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

function RadioGroupItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "flex rounded-full text-main-foreground bg-white border-2 border-border shadow-shadow transition-all transition-200 flex-1 cursor-pointer",
        "data-[state=checked]:translate-x-boxShadowX data-[state=checked]:translate-y-boxShadowY data-[state=checked]:shadow-none data-[state=checked]:bg-main",
        "size-12",
        "focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-hidden",
        className,
      )}
      {...props}
    >
      <Label>{children}</Label>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
