import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./../index.css";
import { PluginGate } from "../components/logic/PluginGate.tsx";
import { syncThemeMode } from "../helpers/syncThemeMode.ts";
import TokenEditor from "./TokenEditor.tsx";
import MinionContextMenu from "./MinionContextMenu.tsx";
import { ErrorBoundary } from "../components/ErrorBoundary.tsx";

syncThemeMode();

const params = new URLSearchParams(document.location.search);
let minionEditor = params.get("minionEditor");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PluginGate>
        {minionEditor === "true" ? <MinionContextMenu /> : <TokenEditor />}
      </PluginGate>
    </ErrorBoundary>
  </StrictMode>,
);
