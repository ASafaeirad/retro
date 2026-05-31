import { callAll } from "@fullstacksjs/toolbox";
import type { VariantProps } from "class-variance-authority";
import { Switch } from "radix-ui";
import { useState } from "react";
import { buttonVariants } from "./button";

export const Toggle = ({
  className,
  size,
  ...props
}: React.ComponentProps<typeof Switch.Root> &
  Pick<VariantProps<typeof buttonVariants>, "size">) => {
  const [value, setValue] = useState(props.defaultChecked);

  return (
    <Switch.Root
      checked={value}
      onCheckedChange={callAll(setValue, props.onCheckedChange)}
      className={buttonVariants({
        variant: value ? "default" : "neutral",
        shadow: value ? "none" : "fixed",
        size,
      })}
      {...props}
    ></Switch.Root>
  );
};
