import type { Item } from "@owlbear-rodeo/sdk";
import { AlertTriangleIcon } from "lucide-react";
import type { SetupOptions } from "../../helpers/AppState";
import { pluginItemRequirements } from "../../../helpers/pluginTargetValidityChecking";

export function InvalidTargetsWarning({
  validTargets,
  invalidTargets,
  setupOptions,
}: {
  validTargets: Item[];
  invalidTargets: Item[];
  setupOptions: SetupOptions;
}) {
  return (
    <div className="bg-mirage-99 dark:bg-mirage-901 rounded-2xl p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="size-5 shrink-0" />
          {validTargets.length > 0 ? (
            <div>{`This data can only be applied to ${validTargets.length} of ${validTargets.length + invalidTargets.length} target items.`}</div>
          ) : (
            <div>This data cannot be applied to any targets.</div>
          )}
        </div>
        <div>
          {invalidTargets.map((item) => (
            <div key={item.id} className="text-foreground-secondary text-sm">
              {`Cannot apply ${setupOptions.type} to ${item.name} because it is a ${item.type} on the ${item.layer} layer.`}
            </div>
          ))}
        </div>
        <div className="text-sm">
          {pluginItemRequirements[setupOptions.type].map((requirement) => {
            const types = requirement.types.reduce(
              (accumulator, currentValue, index) =>
                accumulator + (index > 0 ? " or " : "") + currentValue,
            );

            const layers = (requirement.layers as string[]).reduce(
              (accumulator, currentValue, index) =>
                accumulator + (index > 0 ? " or " : "") + currentValue,
            );

            return (
              <div>
                {`${setupOptions.type} can be applied to ${types} items on the ${layers} layers.`}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
