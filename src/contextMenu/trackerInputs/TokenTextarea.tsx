import React, { useState, type Ref } from "react";
import { cn } from "../../helpers/utils";
import FreeWheelTextarea from "../../components/logic/FreeWheelTextarea";

export default function Textarea({
  ref,
  parentValue,
  updateHandler,
  textareaProps,
  label,
  characterLimit,
}: {
  ref?: Ref<HTMLTextAreaElement>;
  parentValue: string;
  updateHandler: (value: string) => void;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  label: string;
  characterLimit?: number;
}): React.JSX.Element {
  const [charCount, setCharCount] = useState(parentValue.length);

  return (
    <div className="group text-foreground flex size-full flex-col">
      <div className="text-foreground flex justify-between text-xs">
        <div>{label}</div>
        {characterLimit && <div>{`${charCount}/${characterLimit}`}</div>}
      </div>

      <FreeWheelTextarea
        {...textareaProps}
        ref={ref}
        value={parentValue}
        onUpdate={(target) => {
          const value = target.value.substring(0, characterLimit);
          updateHandler(value);
          setCharCount(value.length);
        }}
        onChange={(event) => setCharCount(event.target.value.length)}
        className={cn(
          "bg-mirage-400/30 dark:bg-mirage-500/30 block w-full grow resize-none rounded-lg p-2 outline-hidden",
          textareaProps?.className,
        )}
      />
    </div>
  );
}
