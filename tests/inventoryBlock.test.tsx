import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InventoryBlock } from "../src/statblockViewer/creatureBlockUI/InventoryBlock";
import { DrawSteelInventoryBlockZod } from "../src/types/DrawSteelZod";

const block = DrawSteelInventoryBlockZod.parse({
  type: "inventoryblock",
  inventoryblock_type: "Inventory",
  name: "Hero inventory",
  flavor: "",
  inventory: [
    { name: "First item", quantity: 1, notes: ["First note", "Second note"] },
    { name: "Second item", quantity: 2, notes: [] },
  ],
  equipment: [
    { name: "First equipment", slot: "Armor", notes: ["First", "Second"] },
    { name: "Second equipment", slot: "Weapon/Implement" },
  ],
});

describe("inventory editing", () => {
  let container: HTMLDivElement;
  let root: Root;
  const onSave = vi.fn();

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    onSave.mockReset();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<InventoryBlock inventoryBlock={block} onSave={onSave} />);
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function click(title: string) {
    const button = container.querySelector<HTMLButtonElement>(
      `button[title="${title}"]`,
    );
    if (!button) throw new Error(`Missing button: ${title}`);
    await act(async () => button.click());
  }

  it("preserves surviving inventory inputs when items and notes are removed", async () => {
    await click("Edit inventory");
    const secondItem = container.querySelectorAll(
      'input[placeholder="Item name"]',
    )[1];
    const secondNote = container.querySelectorAll(
      'input[placeholder="Note…"]',
    )[1];

    await click("Remove note");
    expect(container.querySelector('input[placeholder="Note…"]')).toBe(
      secondNote,
    );
    await click("Remove item");
    expect(container.querySelector('input[placeholder="Item name"]')).toBe(
      secondItem,
    );
  });

  it("preserves surviving equipment inputs when equipment and notes are removed", async () => {
    await click("Edit inventory");
    const secondEquipment = container.querySelectorAll(
      'input[placeholder="Name"]',
    )[1];
    const notes = container.querySelectorAll('input[placeholder="Note…"]');
    const secondEquipmentNote = notes[3];
    const equipmentNoteButton = container.querySelectorAll<HTMLButtonElement>(
      'button[title="Remove note"]',
    )[2];

    await act(async () => equipmentNoteButton.click());
    expect(container.querySelectorAll('input[placeholder="Note…"]')[2]).toBe(
      secondEquipmentNote,
    );
    await click("Remove equipment");
    expect(container.querySelector('input[placeholder="Name"]')).toBe(
      secondEquipment,
    );
  });

  it("saves only schema-valid data after adding and removing draft rows", async () => {
    await click("Edit inventory");
    const addItem = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "+ add item",
    );
    if (!addItem) throw new Error("Missing add item button");
    await act(async () => addItem.click());
    await click("Remove item");
    await click("Save changes");

    expect(onSave).toHaveBeenCalledOnce();
    const saved = DrawSteelInventoryBlockZod.parse(onSave.mock.calls[0][0]);
    expect(saved.inventory).toEqual([
      block.inventory[1],
      { name: "", quantity: 1, notes: [] },
    ]);
    expect(saved.equipment).toEqual(block.equipment);
    expect(saved.updated_at).toBeDefined();
  });
});
