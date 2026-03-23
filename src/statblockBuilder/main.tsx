import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./../index.css";
import { StatblockBuilder } from "./StatblockBuilder";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StatblockBuilder />
  </StrictMode>,
);
