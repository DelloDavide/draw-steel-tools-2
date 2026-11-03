import Button from "../../components/ui/Button";
import { cn } from "../../helpers/utils";

export function ContextMenuButton({
  className,
  onClick,
  children,
  disabled = false,
  size = "base",
}: {
  className?: string;
  onClick?: () => void;
  children?: any;
  disabled?: boolean;
  size?: "base" | "xs" | "sm" | "lg" | "icon" | null | undefined;
}) {
  return (
    <Button
      size={size}
      disabled={disabled}
      variant={"secondary"}
      className={cn(
        "bg-mirage-400/30 dark:bg-mirage-500/30 hover:bg-mirage-400/30 hover:dark:bg-mirage-500/30 group overflow-clip p-0 focus-visible:ring-0",
        className,
      )}
      onClick={onClick}
    >
      <div className="group-hover:bg-foreground/7 flex size-full items-center-safe justify-center text-sm duration-150">
        {children}
      </div>
    </Button>
  );
}
