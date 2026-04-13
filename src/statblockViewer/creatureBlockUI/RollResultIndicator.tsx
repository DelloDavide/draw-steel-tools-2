import { ArrowRightIcon, LoaderCircleIcon } from "lucide-react";
import { Badge } from "../../components/ui/badge";

export function RollResultIndicator({
  rollText,
  rollResult,
}: {
  rollText: string | undefined;
  rollResult: number | undefined;
}) {
  return (
    <div className="pt-2">
      <div className="bg-mirage-199 flex h-9 items-center rounded-full px-2 py-2 font-bold">
        {rollResult ? (
          <div className="flex items-center gap-2">
            {rollText && (
              <Badge className="bg-black" text={`Roll: ${rollText}`} />
            )}
            {rollText && <ArrowRightIcon />}
            <Badge className="bg-black" text={`Total: ${rollResult}`} />
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-4">
            <LoaderCircleIcon className="animate-spin text-black" />
            <div className="font-normal">Rolling Dice</div>
          </div>
        )}
      </div>
    </div>
  );
}
