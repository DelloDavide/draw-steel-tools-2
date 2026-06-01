import { useContext, useEffect, useState, type ReactNode } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { PluginReadyContext } from "../../components/logic/PluginReadyContext";
import {
  HeroTokenContext,
  UpdateHeroClassResourceContext,
  HeroResourceSpentContext,
  SetHeroResourceSpentContext,
  type HeroResourceSpent,
  type LinkedHeroToken,
} from "./HeroTokenContext";
import {
  findHeroTokenForStatblock,
  updateHeroTokenClassResource,
} from "../../helpers/updateHeroTokenClassResource";
import { parseTokenData } from "../../helpers/tokenHelpers";

export function HeroTokenProvider({
  statblockName,
  itemId,
  children,
}: {
  statblockName: string | null;
  itemId: string | null;
  children: ReactNode;
}) {
  const pluginReady = useContext(PluginReadyContext);
  const [linkedHeroToken, setLinkedHeroToken] = useState<
    LinkedHeroToken | undefined
  >();
  const [heroResourceSpent, setHeroResourceSpent] =
    useState<HeroResourceSpent>();

  useEffect(() => {
    if (!statblockName) {
      setLinkedHeroToken(undefined);
      return;
    }
    if (!pluginReady) return;

    setHeroResourceSpent(undefined);

    const refresh = async () => {
      const linked = await findHeroTokenForStatblock(statblockName, itemId);
      setLinkedHeroToken(linked);
    };

    void refresh();
    return OBR.scene.items.onChange(() => {
      void refresh();
    });
  }, [statblockName, itemId, pluginReady]);

  const updateClassResource = (resourceName: string, value: number) => {
    if (!linkedHeroToken || !pluginReady) return;

    void updateHeroTokenClassResource(
      linkedHeroToken.itemId,
      resourceName,
      value,
    ).then(async () => {
      const items = await OBR.scene.items.getItems(
        (item) => item.id === linkedHeroToken.itemId,
      );
      if (items.length !== 1) return;
      const token = parseTokenData(items[0].metadata);
      if (token.type !== "HERO") return;
      setLinkedHeroToken({ itemId: linkedHeroToken.itemId, token });
    });
  };

  return (
    <HeroTokenContext value={linkedHeroToken}>
      <UpdateHeroClassResourceContext value={updateClassResource}>
        <HeroResourceSpentContext value={heroResourceSpent}>
          <SetHeroResourceSpentContext value={setHeroResourceSpent}>
            {children}
          </SetHeroResourceSpentContext>
        </HeroResourceSpentContext>
      </UpdateHeroClassResourceContext>
    </HeroTokenContext>
  );
}
