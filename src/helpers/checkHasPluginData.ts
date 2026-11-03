import type { Item } from "@owlbear-rodeo/sdk";
import { TOKEN_METADATA_KEY } from "./tokenHelpers";

export function checkHasPluginData(item: Item) {
  return (
    TOKEN_METADATA_KEY in item.metadata &&
    item.metadata[TOKEN_METADATA_KEY] !== undefined
  );
}
