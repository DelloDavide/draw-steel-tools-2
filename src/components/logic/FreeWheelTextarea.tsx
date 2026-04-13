import { useEffect, useState } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onUpdate: (target: HTMLTextAreaElement) => void;
  ref?: React.Ref<HTMLTextAreaElement> | undefined;
  handleLengthChange?: (length: number) => void;
}

/** Textarea with on confirm method that encapsulates the logic for stat textareas in the context menu */
export default function FreeWheelTextarea({
  value,
  onUpdate,
  className,
  ref,
  handleLengthChange,
  ...textareaProps
}: TextareaProps): React.JSX.Element {
  const [textareaContent, setTextareaContent] = useState<string>(value);

  // Update textareaContent when the value state changes in parent
  const [textareaContentUpdateFlag, setTextareaContentUpdateFlag] =
    useState(false);
  if (textareaContentUpdateFlag) {
    setTextareaContent(value);
    setTextareaContentUpdateFlag(false);
  }
  useEffect(() => setTextareaContentUpdateFlag(true), [value]);

  // Run on user confirm handler
  const runOnConfirm = (
    e:
      | React.FocusEvent<HTMLTextAreaElement, Element>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    onUpdate(e.target as HTMLTextAreaElement);
    setTextareaContentUpdateFlag(true);
  };

  return (
    <textarea
      {...textareaProps}
      ref={ref}
      value={textareaContent}
      onChange={(e) => {
        if (textareaProps.onChange) textareaProps.onChange(e);
        setTextareaContent(e.target.value);
      }}
      onBlur={(e) => {
        if (textareaProps.onBlur) textareaProps.onBlur(e);
        runOnConfirm(e);
      }}
      onFocus={(e) => {
        if (textareaProps.onFocus) textareaProps.onFocus(e);
      }}
      className={className}
      autoComplete="off"
      spellCheck="false"
    />
  );
}
