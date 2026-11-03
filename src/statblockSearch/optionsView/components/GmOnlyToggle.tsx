import { useId } from "react";
import Label from "../../../components/ui/Label";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../components/ui/toggleGroup";

export function GmOnlyToggle({
  playerRole,
  gmOnly,
  onGmOnlyChange,
}: {
  playerRole: "PLAYER" | "GM";
  gmOnly: boolean;
  onGmOnlyChange: (value: boolean) => void;
}) {
  const id = useId();

  return (
    <div className="bg-mirage-99 dark:bg-mirage-901 space-y-4 rounded-2xl p-4">
      <Label htmlFor={id} className="mb-2">
        Access
      </Label>
      <ToggleGroup
        id={id}
        className="w-74"
        variant={"outline"}
        type="single"
        disabled={playerRole === "PLAYER" && !gmOnly}
        value={gmOnly.toString()}
        onValueChange={(value) => onGmOnlyChange(value === "true")}
      >
        <ToggleGroupItem value="false">Shared</ToggleGroupItem>
        <ToggleGroupItem value="true">Director Only</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
