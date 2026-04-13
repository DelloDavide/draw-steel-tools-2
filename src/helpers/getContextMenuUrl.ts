import type { ThemeMode } from "../types/themeMode";

export const getContextMenuUrl = (themeMode: ThemeMode) =>
  `/contextMenu?themeMode=${themeMode}`;
