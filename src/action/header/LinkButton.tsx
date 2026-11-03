import Button from "../../components/ui/Button";
import { cn } from "../../helpers/utils";

export default function LinkButton({
  name,
  icon,
  href,
  className,
}: {
  readonly name: string;
  readonly icon: React.JSX.Element;
  readonly href: string;
  readonly className?: string;
}): React.JSX.Element {
  return (
    <Button
      asChild
      variant={"ghost"}
      className="h-10 items-center justify-start gap-4 rounded-none px-4 active:rounded-none"
    >
      <a
        className={cn(
          "fill-black stroke-black dark:fill-white dark:stroke-white",
          className,
        )}
        target="_blank"
        rel="noreferrer noopener"
        href={href}
      >
        <div className="grid size-6 place-items-center">{icon}</div>
        {name}
      </a>
    </Button>
  );
}
