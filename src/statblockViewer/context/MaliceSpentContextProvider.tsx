import { useState } from "react";
import {
  MaliceSpentContext,
  SetMaliceSpentContext,
  type MaliceSpent,
} from "./MaliceSpentContext";

export function MaliceSpentContextProvider({
  children,
}: {
  readonly children: any;
}) {
  const [maliceSpent, setMaliceSpent] = useState<MaliceSpent>();

  return (
    <MaliceSpentContext value={maliceSpent}>
      <SetMaliceSpentContext value={setMaliceSpent}>
        {children}
      </SetMaliceSpentContext>
    </MaliceSpentContext>
  );
}
