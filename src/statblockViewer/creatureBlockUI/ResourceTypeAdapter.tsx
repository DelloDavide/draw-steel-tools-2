import type { DrawSteelResource } from "../../types/monsterDataBundlesZod";
import { FeatureBlock } from "./FeatureBlock";
import { StatBlock } from "./StatBlock";
import { TerrainBlock } from "./TerrainBlock";

export function ResourceTypeAdaptor({
  resource,
}: {
  resource: DrawSteelResource;
}) {
  if (resource.type === "statblock") {
    return <StatBlock statblock={resource} />;
  }
  if (resource.type === "featureblock") {
    return <FeatureBlock featureBlock={resource} />;
  }
  if (resource.type === "dynamicterrain")
    return <TerrainBlock terrainBlock={resource} />;
  return <div>Unsupported resource type</div>;
}
