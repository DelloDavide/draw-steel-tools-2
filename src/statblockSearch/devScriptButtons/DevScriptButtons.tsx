import { useState } from "react";
import type { IndexBundle } from "../../types/monsterDataBundlesZod";
import { generateIndex } from "./helpers/generateMonsterIndex";
import { generateDynamicTerrainIndex } from "../devScripts/generateDynamicTerrainIndex";
import { validateResources } from "./helpers/validateResources";
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
  const [terrainIndexDownload, setTerrainIndexDownload] = useState<{
    href: string;
    download: string;
  }>();

  return (
    <div className="space-y-3 p-4">
      <div className="font-bold">Actions (See Console for Output)</div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={async () => setIndexDownload(await generateIndex())}>
          Generate Monster Index
        </Button>

        {indexDownload && (
          <Button asChild>
            <a {...indexDownload}>Download Monster Index</a>
          </Button>
        )}

        <Button
          onClick={async () =>
            setTerrainIndexDownload(await generateDynamicTerrainIndex())
          }
        >
          Generate Dynamic Terrain Index
        </Button>

        {terrainIndexDownload && (
          <Button asChild>
            <a {...terrainIndexDownload}>Download Dynamic Terrain Index</a>
          </Button>
        )}

        <Button onClick={() => validateResources(monsterIndex)}>
          Validate Statblocks
        </Button>

        <Button
          onClick={() => {
            const set = new Set(
              monsterIndex
                .filter((val) => val.type === "statblock")
                .flatMap((val) => val.ancestry),
            );
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
                  .filter((val) => val.type === "statblock")
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
