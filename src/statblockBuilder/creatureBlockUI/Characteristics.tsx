import FreeWheelInput from "../../components/logic/FreeWheelInput";
import type { DrawSteelStatblock } from "../../types/DrawSteelZod";
import { Input } from "./Input";

export function Characteristics({
  statblock,
}: {
  statblock: DrawSteelStatblock;
}) {
  return (
    <div className="px-2">
      <div className="flex flex-wrap justify-between gap-1.5 text-sm">
        {[
          { label: "Might", value: statblock.might },
          { label: "Agility", value: statblock.agility },
          { label: "Reason", value: statblock.reason },
          { label: "Intuition", value: statblock.intuition },
          { label: "Presence", value: statblock.presence },
        ].map((item) => (
          <div
            key={item.label}
            className="flex min-w-16 flex-1 flex-col items-center gap-1.5 text-center"
          >
            <Input>
              <FreeWheelInput
                className="w-12 text-center"
                value={item.value.toString()}
                onUpdate={() => {}}
              />
            </Input>
            <div className="w-full rounded-sm bg-black font-bold text-white">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
