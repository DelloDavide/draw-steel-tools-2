import parseNumber from "../../helpers/parseNumber";
import {
  getMergedClassResourcePools,
  updateClassResourcePool,
} from "../../helpers/classResourceHelpers";
import type { DefinedHeroTokenData } from "../../types/tokenDataZod";
import CounterTracker from "../trackerInputs/CounterTrackerInput";

export function ClassResourceTrackers({
  token,
  updateToken,
}: {
  token: DefinedHeroTokenData;
  updateToken: (patch: Partial<DefinedHeroTokenData>) => void;
}) {
  const pools = getMergedClassResourcePools(token);
  const resourceNames = Object.keys(pools).sort((a, b) => a.localeCompare(b));

  if (resourceNames.length === 0) {
    return (
      <div className="col-span-2">
        <CounterTracker
          label={
            token.heroicResourceName !== ""
              ? token.heroicResourceName
              : "Heroic Resource"
          }
          color="BLUE"
          parentValue={token.heroicResource}
          updateHandler={(target) =>
            updateToken(
              updateClassResourcePool(
                token,
                token.heroicResourceName || "Heroic Resource",
                parseNumber(target.value, {
                  min: -999,
                  max: 999,
                  truncate: true,
                  inlineMath: { previousValue: token.heroicResource },
                }),
              ),
            )
          }
          incrementHandler={() => {
            if (token.heroicResource >= 999) return;
            updateToken(
              updateClassResourcePool(
                token,
                token.heroicResourceName || "Heroic Resource",
                token.heroicResource + 1,
              ),
            );
          }}
          decrementHandler={() => {
            if (token.heroicResource <= -999) return;
            updateToken(
              updateClassResourcePool(
                token,
                token.heroicResourceName || "Heroic Resource",
                token.heroicResource - 1,
              ),
            );
          }}
        />
      </div>
    );
  }

  return resourceNames.map((resourceName) => (
    <div className="col-span-2" key={resourceName}>
      <CounterTracker
        label={resourceName}
        color="BLUE"
        parentValue={pools[resourceName]}
        updateHandler={(target) =>
          updateToken(
            updateClassResourcePool(
              token,
              resourceName,
              parseNumber(target.value, {
                min: -999,
                max: 999,
                truncate: true,
                inlineMath: { previousValue: pools[resourceName] },
              }),
            ),
          )
        }
        incrementHandler={() => {
          if (pools[resourceName] >= 999) return;
          updateToken(
            updateClassResourcePool(token, resourceName, pools[resourceName] + 1),
          );
        }}
        decrementHandler={() => {
          if (pools[resourceName] <= -999) return;
          updateToken(
            updateClassResourcePool(token, resourceName, pools[resourceName] - 1),
          );
        }}
      />
    </div>
  ));
}
