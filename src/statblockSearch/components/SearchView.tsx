import type { IndexBundle } from "../../types/monsterDataBundlesZod";
import { BrushCleaningIcon, ListFilterIcon, SearchIcon } from "lucide-react";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import { ScrollArea } from "../../components/ui/scrollArea";
import { defaultSearchData } from "../../types/statblockSearchData";
import { FiltersDropdown } from "./FiltersDropdown";
import { StatblockSearchList } from "./StatblockSearchList";
import DebounceInput from "../../components/logic/DebounceInput";
import type { AppState } from "../../types/statblockLookupAppState";

export default function SearchView({
  monsterIndex,
  appState,
  setAppState,
  playerRole,
}: {
  monsterIndex: IndexBundle[];
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  playerRole: "PLAYER" | "GM";
}) {
  const search = appState.search;
  const updateSearchValue = (value: string) =>
    setAppState((prev) => ({
      ...prev,
      search: { ...prev.search, value: value },
    }));

  return (
    <div className="flex grow flex-col">
      <div className="border-mirage-300 dark:border-mirage-700 flex h-14 shrink-0 items-center border-b">
        <div className="text-foreground grid aspect-square h-full shrink-0 place-items-center">
          <SearchIcon />
        </div>
        <DebounceInput
          autoFocus
          className="h-full w-full outline-none"
          placeholder="Search Statblocks"
          duration={300}
          value={search.value}
          onChange={(e) => updateSearchValue(e)}
        />
        <Toggle
          pressed={search.filtersOpen}
          onClick={() =>
            setAppState((prev) => ({
              ...prev,
              search: { ...search, filtersOpen: !search.filtersOpen },
            }))
          }
          size={"icon"}
          variant={"default"}
          className="shrink-0 pointer-fine:w-8"
        >
          <div
            data-visible={
              search.organizations.length > 0 ||
              search.roles.length > 0 ||
              search.keywords.length > 0 ||
              !(
                search.levelRange.includes(1) && search.levelRange.includes(11)
              ) ||
              !(search.evRange.includes(0) && search.evRange.includes(156))
            }
            className="bg-accent pointer-events-none absolute size-3.5 translate-x-[15px] -translate-y-[15px] scale-0 rounded-full duration-100 ease-in data-[visible=true]:scale-100 pointer-fine:translate-x-[13px]"
          />
          <ListFilterIcon />
        </Toggle>
        <Button
          size={"icon"}
          className="mx-2 sm:w-20"
          variant={"secondary"}
          onClick={() =>
            setAppState((prev) => ({ ...prev, search: defaultSearchData }))
          }
        >
          <BrushCleaningIcon />
        </Button>
      </div>

      <ScrollArea className="grow basis-50">
        <div className="flex grow flex-col">
          <>
            <FiltersDropdown
              search={search}
              setSearch={(search) =>
                setAppState((prev) => ({ ...prev, search }))
              }
              monsterIndex={monsterIndex}
            />

            <StatblockSearchList
              playerRole={playerRole}
              search={search}
              setAppState={setAppState}
              monsterIndex={monsterIndex}
            />
          </>
        </div>
      </ScrollArea>
    </div>
  );
}
