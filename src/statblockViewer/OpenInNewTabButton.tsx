import { ExternalLinkIcon } from "lucide-react";
import Button from "../components/ui/Button";

export function OpenInNewTab({
  resourceId,
  statblockName,
}: {
  readonly resourceId?: string;
  readonly statblockName?: string;
}) {
  if (!resourceId && !statblockName) return <></>;

  const url = new URL("/statblockViewer", window.location.origin);
  if (resourceId) url.searchParams.set("resourceId", resourceId);
  if (statblockName) url.searchParams.set("statblockName", statblockName);
  url.searchParams.delete("obrref");

  return (
    <Button variant={"secondary"} size={"icon"} className="grow" asChild>
      <a href={url.toString()} target="_blank" rel="noopener noreferrer">
        <ExternalLinkIcon />
      </a>
    </Button>
  );
}
