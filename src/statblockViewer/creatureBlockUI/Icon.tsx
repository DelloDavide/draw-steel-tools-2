import {
  SkullIcon,
  AlertCircleIcon,
  SwordIcon,
  BowArrowIcon,
  UserIcon,
  Ruler,
  StarIcon,
  Grid3X3Icon,
  HammerIcon,
  ShieldIcon,
  AlertTriangleIcon,
} from "lucide-react";

const iconMap = {
  skull: SkullIcon,
  alert: AlertCircleIcon,
  sword: SwordIcon,
  bow: BowArrowIcon,
  user: UserIcon,
  ruler: Ruler,
  star: StarIcon,
  grid: Grid3X3Icon,
  hammer: HammerIcon,
  shield: ShieldIcon,
} as const;

type IconKey = keyof typeof iconMap;

function resolveIcon(icon?: string) {
  if (!icon) return StarIcon;

  // caso: chiave diretta ("sword", "hammer", ecc.)
  if (icon in iconMap) {
    return iconMap[icon as IconKey];
  }

  // fallback emoji
  switch (icon) {
    case "🔨":
      return HammerIcon;
    case "🛡️":
      return ShieldIcon;
    case "⚔️":
      return SwordIcon;
    case "🎯":
      return BowArrowIcon;
    case "⚠️":
      return AlertTriangleIcon;
    case "👤":
      return UserIcon;
    default:
      return StarIcon;
  }
}

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name?: string;
  className?: string;
}) {
  const LucideIcon = resolveIcon(name);

  return <LucideIcon className={className} />;
}