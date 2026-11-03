import { useState } from "react";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
} from "../../../components/ui/collapsible";
import { Slider } from "../../../components/ui/slider";
import Label from "../../../components/ui/Label";
import { statblockKeywords } from "../../devScriptButtons/monsterIndex";
import type { SearchData } from "../../helpers/AppState";

export function FiltersDropdown({
  search,
  setSearch,
}: {
  search: SearchData;
  setSearch: (searchData: SearchData) => void;
}) {
  return (
    <Collapsible open={search.filtersOpen}>
      <CollapsibleContent>
        <div className="border-mirage-300 dark:border-mirage-700 border-b pt-4">
          <div className="@container rounded-2xl p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="flex flex-wrap gap-4">
              <div className="grow basis-3xs">
                <div className="mb-2 font-bold">Level</div>
                <SliderWrapper
                  min={1}
                  max={11}
                  defaultValue={search.levelRange}
                  onValueCommit={(value) =>
                    setSearch({ ...search, levelRange: value })
                  }
                />
              </div>
              <div className="grow basis-3xs">
                <div className="mb-2 font-bold">Encounter Value</div>
                <SliderWrapper
                  min={0}
                  max={156}
                  defaultValue={search.evRange}
                  onValueCommit={(value) =>
                    setSearch({ ...search, evRange: value })
                  }
                />
              </div>
            </div>
            <div className="mt-4 mb-2 flex gap-2">
              <div className="font-bold">Organization</div>
              <button
                className="text-foreground-secondary hover:underline"
                onClick={() => setSearch({ ...search, organizations: [] })}
              >
                clear
              </button>
            </div>
            <div className="grid grid-cols-2 @min-[480px]:grid-cols-3 @min-[640px]:grid-cols-4 @min-[800px]:grid-cols-5 @min-[960px]:grid-cols-6">
              {[
                "Terrain",
                "Minion",
                "Horde",
                "Platoon",
                "Elite",
                "Leader",
                "Solo",
              ].map((val) => (
                <div key={val} className="flex items-center">
                  <Checkbox
                    id={val}
                    checked={search.organizations.includes(val)}
                    onCheckedChange={(checked) => {
                      if (checked)
                        setSearch({
                          ...search,
                          organizations: [...search.organizations, val],
                        });
                      else
                        setSearch({
                          ...search,
                          organizations: [
                            ...search.organizations.filter(
                              (item) => item !== val,
                            ),
                          ],
                        });
                    }}
                  />
                  <Label htmlFor={val}>{val}</Label>
                </div>
              ))}
            </div>
            <div className="mt-4 mb-2 font-bold">Role</div>
            <div className="grid grid-cols-2 @min-[480px]:grid-cols-3 @min-[640px]:grid-cols-4 @min-[800px]:grid-cols-5 @min-[960px]:grid-cols-6">
              {[
                "Ambusher",
                "Artillery",
                "Brute",
                "Controller",
                "Defender",
                "Harrier",
                "Hexer",
                "Mount",
                "Support",
              ].map((val) => (
                <div key={val} className="flex items-center">
                  <Checkbox
                    id={val}
                    checked={search.roles.includes(val)}
                    onCheckedChange={(checked) => {
                      if (checked)
                        setSearch({
                          ...search,
                          roles: [...search.roles, val],
                        });
                      else
                        setSearch({
                          ...search,
                          roles: [
                            ...search.roles.filter((item) => item !== val),
                          ],
                        });
                    }}
                  />
                  <Label htmlFor={val}>{val}</Label>
                </div>
              ))}
            </div>
            <div className="mt-4 mb-2 font-bold">Keywords</div>
            <div className="grid grid-cols-2 @min-[480px]:grid-cols-3 @min-[640px]:grid-cols-4 @min-[800px]:grid-cols-5 @min-[960px]:grid-cols-6">
              {statblockKeywords.map((val) => (
                <div key={val} className="flex items-center">
                  <Checkbox
                    id={val}
                    checked={search.keywords.includes(val)}
                    onCheckedChange={(checked) => {
                      if (checked)
                        setSearch({
                          ...search,
                          keywords: [...search.keywords, val],
                        });
                      else
                        setSearch({
                          ...search,
                          keywords: [
                            ...search.keywords.filter((item) => item !== val),
                          ],
                        });
                    }}
                  />
                  <Label htmlFor={val}>{val}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SliderWrapper({
  min,
  max,
  defaultValue,
  onValueCommit,
}: {
  min: number;
  max: number;
  defaultValue: number[];
  onValueCommit: (values: number[]) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex gap-4 py-2">
      <div className="basis-12 text-center font-semibold">
        {Math.min(...value)}
      </div>
      <Slider
        min={min}
        max={max}
        value={value}
        onValueChange={setValue}
        onValueCommit={onValueCommit}
      />
      <div className="basis-12 text-center font-semibold">
        {Math.max(...value)}
      </div>
    </div>
  );
}
