import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./../index.css";
import { PluginGate } from "../components/logic/PluginGate.tsx";
import { syncThemeMode } from "../helpers/syncThemeMode.ts";
import SettingsMenu from "./SettingsMenu.tsx";
import { ErrorBoundary } from "../components/ErrorBoundary.tsx";

syncThemeMode();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PluginGate>
        <SettingsMenu />
      </PluginGate>
    </ErrorBoundary>
  </StrictMode>,
);
