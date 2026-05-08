import { useState } from "react";
import type { IndexBundle } from "../../types/monsterDataBundlesZod";
import { generateIndex } from "../devScripts/generateMonsterIndex";
import { validateMalice } from "../devScripts/validatemalice";
import { validateStatblocks } from "../devScripts/validateStatblocks";
import Button from "../../components/ui/Button";

export function DevActionButtons({
  monsterIndex,
}: {
  monsterIndex: IndexBundle[];
}) {
  const [indexDownload, setIndexDownload] = useState<{
    href: string;
    download: string;
  }>();

  return (
    <div className="space-y-3 p-4">
      <div className="font-bold">Actions (See Console for Output)</div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={async () => setIndexDownload(await generateIndex())}>
          Generate Index
        </Button>

        {indexDownload && (
          <Button asChild>
            <a {...indexDownload}>Download Index</a>
          </Button>
        )}

        <Button onClick={() => validateStatblocks(monsterIndex)}>
          Validate Statblocks
        </Button>

        <Button onClick={() => validateMalice(monsterIndex)}>
          Validate Malice
        </Button>

        <Button
          onClick={() => {
            const set = new Set(monsterIndex.flatMap((val) => val.ancestry));
            console.log([...set].sort((a, b) => a.localeCompare(b)));
          }}
        >
          Generate Keywords List
        </Button>

        <Button
          onClick={() => {
            console.log(
              Math.max(
                ...monsterIndex
                  .map((val) => {
                    if (Number.isNaN(parseFloat(val.ev))) console.log(val.name);
                    return parseFloat(val.ev);
                  })
                  .filter((val) => !Number.isNaN(val)),
              ),
            );
          }}
        >
          Find Highest EV
        </Button>
      </div>
    </div>
  );
}
