import type { Item } from "@owlbear-rodeo/sdk";
import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import { TOKEN_METADATA_KEY } from "./tokenHelpers";

export function removeCreatureData(items: Item[]) {
  OBR.scene.items.updateItems(
    items.map((item) => item.id),
    (items) => {
      items.forEach((item) => {
        delete item.metadata[TOKEN_METADATA_KEY];
        delete item.metadata[getPluginId("name")];
      });
    },
  );
}
