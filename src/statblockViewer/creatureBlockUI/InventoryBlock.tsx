import type { DrawSteelInventoryBlock } from "../../types/DrawSteelZod";

export function InventoryBlock({
  inventoryBlock,
}: {
  inventoryBlock: DrawSteelInventoryBlock;
}) {
  return (
    <div className="w-full max-w-sm border border-zinc-950 bg-[#e8edf9] p-2 text-sm text-zinc-950">
      <div className="border-b border-zinc-400 pb-1 text-center font-bold uppercase">
        {inventoryBlock.inventoryblock_type}
      </div>

      <div className="mt-2 space-y-2">
        {inventoryBlock.inventory.map((item) => (
          <div key={item.name}>
            <div>
              - {item.quantity} {item.name}
            </div>

            {item.notes?.map((note) => (
              <div key={note} className="ml-4 text-xs leading-snug italic">
                ({note})
              </div>
            ))}
          </div>
        ))}
      </div>

      {inventoryBlock.equipment.length > 0 && (
        <>
          <div className="mt-4 border-t border-zinc-950 pt-1 text-center font-bold uppercase">
            Equipment
          </div>

          <div className="mt-2 grid grid-cols-[130px_1fr] gap-3">
            <div className="space-y-1">
              {inventoryBlock.equipment
                .filter((item) =>
                  ["Armor", "Weapon/Implement"].includes(item.slot),
                )
                .map((item) => (
                  <div key={item.name} className="bg-[#dfe5f4] px-1 py-0.5">
                    <div>{item.name}</div>

                    <div className="border-t border-zinc-300 text-xs">
                      {item.slot}
                    </div>
                  </div>
                ))}
            </div>

            <div className="space-y-0.5">
              {inventoryBlock.equipment
                .filter(
                  (item) => !["Armor", "Weapon/Implement"].includes(item.slot),
                )
                .map((item) => (
                  <div key={item.name}>
                    <div>
                      • {item.name}
                      {item.type && ` - ${item.type}`}
                      {item.keywords?.length
                        ? ` (${item.keywords.join(", ")})`
                        : ""}
                      {item.slot ? `, ${item.slot}` : ""}
                    </div>
                    {item.notes?.map((note) => (
                      <div
                        key={note}
                        className="ml-4 text-xs leading-snug italic"
                      >
                        ({note})
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
