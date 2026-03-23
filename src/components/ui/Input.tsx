import * as React from "react";
import { cn } from "../../helpers/utils";
import { Slot } from "@radix-ui/react-slot";

export default function Input({
  className,
  type,
  hasFocusHighlight,
  children,
  ...props
}: React.ComponentProps<"input"> & {
  hasFocusHighlight?: boolean;
  children?: React.ReactNode;
}) {
  const Comp = children ? Slot : "input";

  return (
    <Comp
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-foreground/50 border-foreground/20 text-foreground flex h-9 min-w-0 rounded-[8px] border bg-transparent px-3 py-1 text-base shadow-xs transition-colors duration-75 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        { "focus:border-accent focus:border-2": hasFocusHighlight },
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
