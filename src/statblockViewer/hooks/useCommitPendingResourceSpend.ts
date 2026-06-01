import { useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  UpdateRoomTrackersContext,
  RoomTrackersContext,
} from "../context/RoomTrackersContext";
import {
  UpdateHeroClassResourceContext,
  SetHeroResourceSpentContext,
  HeroTokenContext,
} from "../context/HeroTokenContext";
import { SetMaliceSpentContext } from "../context/MaliceSpentContext";
import type {
  DiceDrawer,
  PendingResourceSpend,
} from "../context/DiceDrawerContext";
import { getMergedClassResourcePools } from "../../helpers/classResourceHelpers";

export function useCommitPendingResourceSpend(
  diceDrawer: DiceDrawer,
  setDiceDrawer: Dispatch<SetStateAction<DiceDrawer>>,
) {
  const roomTrackers = useContext(RoomTrackersContext);
  const updateRoomTrackers = useContext(UpdateRoomTrackersContext);
  const linkedHeroToken = useContext(HeroTokenContext);
  const updateClassResource = useContext(UpdateHeroClassResourceContext);
  const setHeroResourceSpent = useContext(SetHeroResourceSpentContext);
  const setMaliceSpent = useContext(SetMaliceSpentContext);

  return (pending: PendingResourceSpend | undefined = diceDrawer.pendingResourceSpend) => {
    if (!pending) return;

    if (pending.type === "hero" && linkedHeroToken) {
      const pools = getMergedClassResourcePools(linkedHeroToken.token);
      const current = pools[pending.resourceName] ?? 0;
      updateClassResource(pending.resourceName, current - pending.amount);
      setHeroResourceSpent({
        target: pending.featureId,
        resourceName: pending.resourceName,
        value: pending.amount,
      });
    }

    if (pending.type === "malice") {
      const malice = roomTrackers?.malice ?? 0;
      updateRoomTrackers({
        ...roomTrackers,
        malice: malice - pending.amount,
      });
      setMaliceSpent({ target: pending.featureId, value: pending.amount });
    }

    setDiceDrawer((prev) => ({ ...prev, pendingResourceSpend: undefined }));
  };
}
