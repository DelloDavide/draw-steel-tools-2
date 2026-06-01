import { useContext } from "react";
import { DropDownInput } from "../components/ui/DropDownInput";
import parseNumber from "../helpers/parseNumber";
import { getMergedClassResourcePools } from "../helpers/classResourceHelpers";
import {
  HeroTokenContext,
  UpdateHeroClassResourceContext,
} from "./context/HeroTokenContext";
import { HeroClassResourceNamesContext } from "./context/HeroClassResourceNamesContext";

export function ClassResourceBar() {
  const linkedHeroToken = useContext(HeroTokenContext);
  const updateClassResource = useContext(UpdateHeroClassResourceContext);
  const heroClassResourceNames = useContext(HeroClassResourceNamesContext);

  if (heroClassResourceNames.length === 0) return null;

  const pools = linkedHeroToken
    ? getMergedClassResourcePools(linkedHeroToken.token)
    : {};

  return (
    <div className="flex max-w-full flex-wrap gap-2">
      {heroClassResourceNames.map((resourceName) => (
        <DropDownInput
          key={resourceName}
          label={resourceName}
          value={(pools[resourceName] ?? 0).toString()}
          disabled={!linkedHeroToken}
          onUpdate={(target) =>
            updateClassResource(
              resourceName,
              parseNumber(target.value, {
                min: -9999,
                max: 9999,
                truncate: true,
                inlineMath: { previousValue: pools[resourceName] ?? 0 },
              }),
            )
          }
        />
      ))}
    </div>
  );
}
