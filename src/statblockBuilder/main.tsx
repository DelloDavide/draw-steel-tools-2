import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./../index.css";
import { StatblockBuilder } from "./StatblockBuilder";
import { ErrorBoundary } from "../components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <StatblockBuilder />
    </ErrorBoundary>
  </StrictMode>,
);
