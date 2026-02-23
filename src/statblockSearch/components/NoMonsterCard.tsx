import { CheckIcon } from "lucide-react";

export function NoMonsterCard({
  onActionClick,
  variant = "BASIC",
  icon = <CheckIcon />,
}: {
  onActionClick?: () => void;
  variant: "BASIC" | "MINION";
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
  }

  return (
    <div className="flex w-full gap-1 overflow-clip rounded-2xl">
      <div className="bg-mirage-100 text-foreground-secondary dark:bg-mirage-900 grow items-center rounded-r-sm px-4 py-2 text-sm font-normal duration-150">
        <div className="text-foreground text-base font-semibold">{text}</div>
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
