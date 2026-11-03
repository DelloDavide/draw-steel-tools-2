import {
  CheckIcon,
  CrownIcon,
  LandPlotIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import type { IndexBundle } from "../../types/monsterDataBundlesZod";
import type React from "react";

export function MonsterPreviewCard({
  indexBundle,
  onCardClick,
  onActionClick,
  icon = <CheckIcon />,
}: {
  indexBundle: IndexBundle;
  onCardClick?: () => void;
  onActionClick?: () => void;
  icon?: React.ReactNode;
}) {
  const typeIcon =
    indexBundle.type === "terrain" ? (
      <LandPlotIcon className="text-foreground size-5" />
    ) : indexBundle.type === "feature" ? (
      <></>
    ) : indexBundle.roles.includes("Minion") ? (
      <UsersIcon className="text-foreground size-5" />
    ) : indexBundle.roles.includes("Leader") ||
      indexBundle.roles.includes("Solo") ? (
      <CrownIcon className="text-foreground size-5" />
    ) : (
      <UserIcon className="text-foreground size-5" />
    );

  return (
    <div className="flex w-full gap-1 overflow-clip rounded-2xl">
      <button
        className="bg-mirage-100 hover:bg-mirage-200 focus-visible:bg-mirage-200 dark:focus-visible:bg-mirage-800 dark:hover:bg-mirage-800 text-foreground-secondary dark:bg-mirage-900 flex grow rounded-r-sm p-2 pl-4 text-sm font-normal duration-150 outline-none"
        onClick={onCardClick}
      >
        <div className="w-full text-left">
          <div className="flex w-full justify-between">
            <div className="text-foreground text-base font-semibold">
              {indexBundle.name}
            </div>
            <div className="grid size-6 place-items-center">{typeIcon}</div>
          </div>
          {indexBundle.type === "statblock" && (
            <div>{indexBundle.ancestry.join(", ")}</div>
          )}
          {indexBundle.type === "terrain" && <div>Terrain</div>}
          {(indexBundle.type === "statblock" ||
            indexBundle.type === "terrain") && (
            <>
              <div>{`Level ${indexBundle.level} ${indexBundle.roles.join(" ")}`}</div>
              <div>{`EV ${indexBundle.ev}`}</div>
            </>
          )}
        </div>
      </button>
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="bg-mirage-100 hover:bg-mirage-200 dark:hover:bg-mirage-800 focus-visible:bg-mirage-200 dark:focus-visible:bg-mirage-800 dark:bg-mirage-900 grid place-items-center rounded-l-sm p-4 text-start text-sm font-normal duration-150 outline-none"
        >
          {icon}
        </button>
      )}
    </div>
  );
}
