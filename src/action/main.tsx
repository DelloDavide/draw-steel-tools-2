import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./../index.css";
import ActionMenu from "./ActionMenu.tsx";
import { PluginGate } from "../components/logic/PluginGate.tsx";
import { syncThemeMode } from "../helpers/syncThemeMode.ts";
import { ErrorBoundary } from "../components/ErrorBoundary.tsx";

syncThemeMode();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PluginGate>
        <ActionMenu />
      </PluginGate>
    </ErrorBoundary>
  </StrictMode>,
);
