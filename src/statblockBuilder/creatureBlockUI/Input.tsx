import BaseInput from "../../components/ui/Input";
import { cn } from "../../helpers/utils";

export function Input(
  props: React.ComponentProps<"input"> & {
    hasFocusHighlight?: boolean;
    children?: React.ReactNode;
  },
): React.ReactNode {
  return (
    <BaseInput {...props} className={cn("h-8 px-2 text-sm", props.className)} />
  );
}
