import { CheckIcon, LandPlotIcon, UserIcon, UsersIcon } from "lucide-react";

export function NoMonsterCard({
  onActionClick,
  variant = "BASIC",
  icon = <CheckIcon />,
}: {
  onActionClick?: () => void;
  variant: "BASIC" | "MINION" | "TERRAIN";
  icon?: React.ReactNode;
}) {
  const params = new URLSearchParams(document.location.search);
  const type = params.get("type");
  const isHeroSearch = type === "hero";

  let text = isHeroSearch ? "Hero" : "Monster";
  let description = isHeroSearch
    ? "Configure a hero without attaching a statblock"
    : "Configure monsters without attaching a statblock";

  if (!isHeroSearch && variant === "MINION") {
    text = "Minion";
    description = "Configure a minion group without attaching a statblock";
  } else if (variant === "TERRAIN") {
    text = "Terrain";
    description = "Configure terrain without attaching a statblock";
  }

  const typeIcon =
    variant === "TERRAIN" ? (
      <LandPlotIcon className="text-foreground size-5" />
    ) : variant === "MINION" ? (
      <UsersIcon className="text-foreground size-5" />
    ) : (
      <UserIcon className="text-foreground size-5" />
    );

  return (
    <div className="flex w-full gap-1 overflow-clip rounded-2xl">
      <div className="bg-mirage-100 text-foreground-secondary dark:bg-mirage-900 grow items-center rounded-r-sm p-2 pl-4 text-sm font-normal duration-150">
        <div className="flex justify-between">
          <div className="text-foreground text-base font-semibold">{text}</div>
          <div className="grid size-6 place-items-center">{typeIcon}</div>
        </div>
        <div className="text-foreground-secondary text-sm">{description}</div>
      </div>
      <button
        className="bg-mirage-100 hover:bg-mirage-200 focus-visible:bg-mirage-200 dark:focus-visible:bg-mirage-800 dark:hover:bg-mirage-800 dark:bg-mirage-900 grid place-items-center rounded-l-sm p-4 text-start text-sm font-normal duration-150 outline-none"
        onClick={onActionClick}
      >
        {icon}
      </button>
    </div>
  );
}
