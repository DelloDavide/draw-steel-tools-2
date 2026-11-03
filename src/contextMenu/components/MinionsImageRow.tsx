import { XIcon, CirclePlus } from "lucide-react";
import type { MinionGroup } from "../../types/minionGroup";
import type { Image } from "@owlbear-rodeo/sdk";

export function MinionsImageRow({
  minionGroup,
  groupItems,
}: {
  minionGroup?: MinionGroup;
  groupItems: Image[];
}) {
  return (
    <div className="flex w-full justify-start gap-1.5">
      {groupItems.map((item, index) => {
        const dropped =
          minionGroup &&
          index * minionGroup.individualStamina >= minionGroup.currentStamina;
        return (
          <div key={item.id} className="grid basis-6 place-items-center">
            <img
              src={item.image.url}
              data-dropped={dropped}
              className="pointer-events-none col-start-1 row-start-1 data-[dropped=true]:opacity-40"
            />
            {dropped && (
              <XIcon className="z-50 col-start-1 row-start-1 size-full" />
            )}
          </div>
        );
      })}
      {(() => {
        const extraItems = [];
        if (!minionGroup) return;
        for (
          let i = 0;
          i <
          Math.ceil(
            minionGroup.currentStamina / minionGroup.individualStamina,
          ) -
            groupItems.length;
          i++
        ) {
          extraItems.push(
            <div key={`extra-${i}`} className="basis-6">
              <CirclePlus className="size-full" key={i} />
            </div>,
          );
        }
        return extraItems;
      })()}
    </div>
  );
}
