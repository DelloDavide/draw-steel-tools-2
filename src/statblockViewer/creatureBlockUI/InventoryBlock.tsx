import { useState, useMemo } from "react";
import type { DrawSteelInventoryBlock } from "../../types/DrawSteelZod";

// ── tiny helpers ──────────────────────────────────────────────────────────────

function IconButton({
  onClick,
  title,
  children,
  className = "",
  disabled = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex items-center justify-center rounded px-1 py-0.5 text-xs transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function InlineInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`border-b border-zinc-400 bg-transparent outline-none placeholder:text-zinc-400 focus:border-zinc-700 ${className}`}
    />
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function InventoryBlock({
  inventoryBlock,
  onSave,
}: {
  inventoryBlock: DrawSteelInventoryBlock;
  onSave?: (updated: DrawSteelInventoryBlock) => Promise<void> | void;
  hasChanges?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DrawSteelInventoryBlock>(inventoryBlock);
  const [saving, setSaving] = useState(false);

  // reset draft whenever the prop changes (e.g. parent reloads data)
  // and we are NOT currently editing
  function startEdit() {
    setDraft(inventoryBlock);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function handleSave() {
    if (!onSave) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...draft, updated_at: new Date().toISOString() });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  // ── inventory item helpers ──────────────────────────────────────────────────

  function updateInventoryItem(
    idx: number,
    patch: Partial<DrawSteelInventoryBlock["inventory"][number]>,
  ) {
    setDraft((d) => ({
      ...d,
      inventory: d.inventory.map((item, i) =>
        i === idx ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addInventoryItem() {
    setDraft((d) => ({
      ...d,
      inventory: [...d.inventory, { name: "", quantity: 1, notes: [] }],
    }));
  }

  function removeInventoryItem(idx: number) {
    setDraft((d) => ({
      ...d,
      inventory: d.inventory.filter((_, i) => i !== idx),
    }));
  }

  function updateInventoryNote(
    itemIdx: number,
    noteIdx: number,
    value: string,
  ) {
    setDraft((d) => ({
      ...d,
      inventory: d.inventory.map((item, i) =>
        i === itemIdx
          ? {
              ...item,
              notes: (item.notes ?? []).map((n, ni) =>
                ni === noteIdx ? value : n,
              ),
            }
          : item,
      ),
    }));
  }

  function addInventoryNote(itemIdx: number) {
    setDraft((d) => ({
      ...d,
      inventory: d.inventory.map((item, i) =>
        i === itemIdx ? { ...item, notes: [...(item.notes ?? []), ""] } : item,
      ),
    }));
  }

  function removeInventoryNote(itemIdx: number, noteIdx: number) {
    setDraft((d) => ({
      ...d,
      inventory: d.inventory.map((item, i) =>
        i === itemIdx
          ? {
              ...item,
              notes: (item.notes ?? []).filter((_, ni) => ni !== noteIdx),
            }
          : item,
      ),
    }));
  }

  // ── equipment item helpers ─────────────────────────────────────────────────

  function updateEquipmentItem(
    idx: number,
    patch: Partial<DrawSteelInventoryBlock["equipment"][number]>,
  ) {
    setDraft((d) => ({
      ...d,
      equipment: d.equipment.map((item, i) =>
        i === idx ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addEquipmentItem() {
    setDraft((d) => ({
      ...d,
      equipment: [
        ...d.equipment,
        { name: "", slot: "", type: "", keywords: [], notes: [] },
      ],
    }));
  }

  function removeEquipmentItem(idx: number) {
    setDraft((d) => ({
      ...d,
      equipment: d.equipment.filter((_, i) => i !== idx),
    }));
  }

  function updateEquipmentNote(
    itemIdx: number,
    noteIdx: number,
    value: string,
  ) {
    setDraft((d) => ({
      ...d,
      equipment: d.equipment.map((item, i) =>
        i === itemIdx
          ? {
              ...item,
              notes: (item.notes ?? []).map((n, ni) =>
                ni === noteIdx ? value : n,
              ),
            }
          : item,
      ),
    }));
  }

  function addEquipmentNote(itemIdx: number) {
    setDraft((d) => ({
      ...d,
      equipment: d.equipment.map((item, i) =>
        i === itemIdx ? { ...item, notes: [...(item.notes ?? []), ""] } : item,
      ),
    }));
  }

  function removeEquipmentNote(itemIdx: number, noteIdx: number) {
    setDraft((d) => ({
      ...d,
      equipment: d.equipment.map((item, i) =>
        i === itemIdx
          ? {
              ...item,
              notes: (item.notes ?? []).filter((_, ni) => ni !== noteIdx),
            }
          : item,
      ),
    }));
  }

  function updateEquipmentKeywords(idx: number, raw: string) {
    setDraft((d) => ({
      ...d,
      equipment: d.equipment.map((item, i) =>
        i === idx
          ? {
              ...item,
              keywords: raw
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean),
            }
          : item,
      ),
    }));
  }

  // ── render helpers ─────────────────────────────────────────────────────────

  const data = editing ? draft : inventoryBlock;

  const armorWeaponSlots = ["Armor", "Weapon/Implement"];
  const armorWeapon = data.equipment.filter((item) =>
    armorWeaponSlots.includes(item.slot),
  );
  const otherEquipment = data.equipment.filter(
    (item) => !armorWeaponSlots.includes(item.slot),
  );

  const hasDraftChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(inventoryBlock),
    [draft, inventoryBlock],
  );

  const canSave = hasDraftChanges && !saving;


  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-sm border border-zinc-950 bg-[#e8edf9] p-2 text-sm text-zinc-950">
      {/* header row */}
      <div className="flex items-center justify-between border-b border-zinc-400 pb-1">
        <span className="font-bold uppercase">{data.inventoryblock_type}</span>
        <div className="flex gap-1">
          {editing ? (
            <>
              <IconButton
                onClick={handleSave}
                title="Save changes"
                disabled={!canSave}
                className={`text-white ${
                  canSave
                    ? "bg-green-700 hover:bg-green-600"
                    : "cursor-not-allowed bg-gray-500"
                }`}
              >
                {saving ? "…" : "✓ Save"}
              </IconButton>
              <IconButton
                onClick={cancelEdit}
                title="Cancel"
                className="bg-zinc-400 text-white hover:bg-zinc-500"
              >
                ✕
              </IconButton>
            </>
          ) : (
            <IconButton
              onClick={startEdit}
              title="Edit inventory"
              className="bg-[#dfe5f4] text-zinc-700 hover:bg-zinc-300"
            >
              ✎ Edit
            </IconButton>
          )}
        </div>
      </div>

      {/* ── inventory items ── */}
      <div className="mt-2 space-y-2">
        {data.inventory.map((item, idx) =>
          editing ? (
            <div key={idx} className="space-y-1 rounded bg-[#dfe5f4] p-1.5">
              <div className="flex items-center gap-1">
                <input
                  title="Quantity"
                  type="number"
                  min={0}
                  value={item.quantity}
                  onChange={(e) =>
                    updateInventoryItem(idx, {
                      quantity: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-12 border-b border-zinc-400 bg-transparent text-center outline-none focus:border-zinc-700"
                />
                <InlineInput
                  value={item.name}
                  placeholder="Item name"
                  onChange={(v) => updateInventoryItem(idx, { name: v })}
                  className="flex-1"
                />
                <IconButton
                  onClick={() => removeInventoryItem(idx)}
                  title="Remove item"
                  className="text-red-600 hover:bg-red-100"
                >
                  🗑
                </IconButton>
              </div>

              {/* notes */}
              {(item.notes ?? []).map((note, ni) => (
                <div key={ni} className="ml-3 flex items-center gap-1">
                  <span className="text-xs text-zinc-500">note:</span>
                  <InlineInput
                    value={note}
                    placeholder="Note…"
                    onChange={(v) => updateInventoryNote(idx, ni, v)}
                    className="flex-1 text-xs"
                  />
                  <IconButton
                    onClick={() => removeInventoryNote(idx, ni)}
                    title="Remove note"
                    className="text-red-500 hover:bg-red-100"
                  >
                    ✕
                  </IconButton>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addInventoryNote(idx)}
                className="ml-3 text-xs text-zinc-500 hover:text-zinc-800"
              >
                + add note
              </button>
            </div>
          ) : (
            <div key={item.name + idx}>
              <div>
                - {item.quantity} {item.name}
              </div>
              {item.notes?.map((note) => (
                <div key={note} className="ml-4 text-xs leading-snug italic">
                  ({note})
                </div>
              ))}
            </div>
          ),
        )}

        {editing && (
          <button
            type="button"
            onClick={addInventoryItem}
            className="text-xs text-zinc-600 hover:text-zinc-900 hover:underline"
          >
            + add item
          </button>
        )}
      </div>

      {/* ── equipment section ── */}
      {(data.equipment.length > 0 || editing) && (
        <>
          <div className="mt-4 border-t border-zinc-950 pt-1 text-center font-bold uppercase">
            Equipment
          </div>

          {editing ? (
            /* edit mode: flat list */
            <div className="mt-2 space-y-2">
              {data.equipment.map((item, idx) => (
                <div key={idx} className="space-y-1 rounded bg-[#dfe5f4] p-1.5">
                  <div className="flex items-center gap-1">
                    <InlineInput
                      value={item.name}
                      placeholder="Name"
                      onChange={(v) => updateEquipmentItem(idx, { name: v })}
                      className="flex-1 font-medium"
                    />
                    <IconButton
                      onClick={() => removeEquipmentItem(idx)}
                      title="Remove equipment"
                      className="text-red-600 hover:bg-red-100"
                    >
                      🗑
                    </IconButton>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase">
                        Slot
                      </span>
                      <InlineInput
                        value={item.slot}
                        placeholder="Slot"
                        onChange={(v) => updateEquipmentItem(idx, { slot: v })}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase">
                        Type
                      </span>
                      <InlineInput
                        value={item.type ?? ""}
                        placeholder="Type"
                        onChange={(v) => updateEquipmentItem(idx, { type: v })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-zinc-500 uppercase">
                      Keywords (comma-separated)
                    </span>
                    <InlineInput
                      value={(item.keywords ?? []).join(", ")}
                      placeholder="e.g. Magic, Cursed"
                      onChange={(v) => updateEquipmentKeywords(idx, v)}
                    />
                  </div>

                  {/* equipment notes */}
                  {(item.notes ?? []).map((note, ni) => (
                    <div key={ni} className="ml-2 flex items-center gap-1">
                      <span className="text-xs text-zinc-500">note:</span>
                      <InlineInput
                        value={note}
                        placeholder="Note…"
                        onChange={(v) => updateEquipmentNote(idx, ni, v)}
                        className="flex-1 text-xs"
                      />
                      <IconButton
                        onClick={() => removeEquipmentNote(idx, ni)}
                        title="Remove note"
                        className="text-red-500 hover:bg-red-100"
                      >
                        ✕
                      </IconButton>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addEquipmentNote(idx)}
                    className="ml-2 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    + add note
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addEquipmentItem}
                className="text-xs text-zinc-600 hover:text-zinc-900 hover:underline"
              >
                + add equipment
              </button>
            </div>
          ) : (
            /* read mode: original two-column layout */
            <div className="mt-2 grid grid-cols-[130px_1fr] gap-3">
              <div className="space-y-1">
                {armorWeapon.map((item) => (
                  <div key={item.name} className="bg-[#dfe5f4] px-1 py-0.5">
                    <div>{item.name}</div>
                    <div className="border-t border-zinc-300 text-xs">
                      {item.slot}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5">
                {otherEquipment.map((item) => (
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
          )}
        </>
      )}
    </div>
  );
}
