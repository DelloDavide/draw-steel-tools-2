import { useState, useMemo } from "react";
import type { DrawSteelSkillBlock } from "../../types/DrawSteelZod";

const VALID_CATEGORIES_SKILLS = [
  "Crafting Skills",
  "Exploration Skills",
  "Interpersonal Skills",
  "Intrigue Skills",
  "Lore Skills",
  "Supernatural Skills",
] as const;

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

export function SkillBlock({
  skillBlock,
  onSave,
}: {
  skillBlock: DrawSteelSkillBlock;
  onSave?: (updated: DrawSteelSkillBlock) => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DrawSteelSkillBlock>(skillBlock);
  const [saving, setSaving] = useState(false);

  const hasDraftChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(skillBlock),
    [draft, skillBlock],
  );

  const canSave = hasDraftChanges && !saving;

  function startEdit() {
    setDraft(skillBlock);
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
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  // ── category helpers ────────────────────────────────────────────────────────

  function addCategory(categoryName: string) {
    setDraft((d) => ({
      ...d,
      categories: [...d.categories, { category: categoryName, skills: [] }],
    }));
  }

  function removeCategory(catIdx: number) {
    setDraft((d) => ({
      ...d,
      categories: d.categories.filter((_, i) => i !== catIdx),
    }));
  }

  function updateSkill(catIdx: number, skillIdx: number, value: string) {
    setDraft((d) => ({
      ...d,
      categories: d.categories.map((cat, i) =>
        i === catIdx
          ? {
              ...cat,
              skills: cat.skills.map((s, si) => (si === skillIdx ? value : s)),
            }
          : cat,
      ),
    }));
  }

  function addSkill(catIdx: number) {
    setDraft((d) => ({
      ...d,
      categories: d.categories.map((cat, i) =>
        i === catIdx ? { ...cat, skills: [...cat.skills, ""] } : cat,
      ),
    }));
  }

  function removeSkill(catIdx: number, skillIdx: number) {
    setDraft((d) => ({
      ...d,
      categories: d.categories.map((cat, i) =>
        i === catIdx
          ? { ...cat, skills: cat.skills.filter((_, si) => si !== skillIdx) }
          : cat,
      ),
    }));
  }

  // ── language helpers ────────────────────────────────────────────────────────

  function updateLanguage(
    langIdx: number,
    patch: Partial<DrawSteelSkillBlock["languages"][number]>,
  ) {
    setDraft((d) => ({
      ...d,
      languages: d.languages.map((lang, i) =>
        i === langIdx ? { ...lang, ...patch } : lang,
      ),
    }));
  }

  function addLanguage() {
    setDraft((d) => ({
      ...d,
      languages: [...d.languages, { name: "", description: "" }],
    }));
  }

  function removeLanguage(langIdx: number) {
    setDraft((d) => ({
      ...d,
      languages: d.languages.filter((_, i) => i !== langIdx),
    }));
  }

  // ── render ──────────────────────────────────────────────────────────────────

  const data = editing ? draft : skillBlock;

  const usedCategories = new Set(
    data.categories.map((c) => c.category.toLowerCase()),
  );
  const availableCategories = VALID_CATEGORIES_SKILLS.filter(
    (c) => !usedCategories.has(c.toLowerCase()),
  );

  return (
    <div className="w-full max-w-xs border border-zinc-950 bg-[#e8edf9] p-2 text-sm text-zinc-950">
      {/* header */}
      <div className="flex items-center justify-between border-b border-zinc-950 pb-1">
        <span className="font-black tracking-wide">{data.name}</span>
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
              title="Edit skills"
              className="bg-[#dfe5f4] text-zinc-700 hover:bg-zinc-300"
            >
              ✎ Edit
            </IconButton>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        {/* ── categories ── */}
        {data.categories.map((category, catIdx) =>
          editing ? (
            <div key={catIdx} className="space-y-1 rounded bg-[#dfe5f4] p-1.5">
              {/* category header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide uppercase">
                  {catIdx + 1}) {category.category}
                </span>
                <IconButton
                  onClick={() => removeCategory(catIdx)}
                  title="Remove category"
                  className="text-red-600 hover:bg-red-100"
                >
                  🗑
                </IconButton>
              </div>

              {/* skills */}
              <ul className="ml-3 space-y-0.5">
                {category.skills.map((skill, skillIdx) => (
                  <li key={skillIdx} className="flex items-center gap-1">
                    <span className="text-xs text-zinc-400">•</span>
                    <InlineInput
                      value={skill}
                      placeholder="Skill name"
                      onChange={(v) => updateSkill(catIdx, skillIdx, v)}
                      className="flex-1"
                    />
                    <IconButton
                      onClick={() => removeSkill(catIdx, skillIdx)}
                      title="Remove skill"
                      className="text-red-500 hover:bg-red-100"
                    >
                      ✕
                    </IconButton>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => addSkill(catIdx)}
                className="ml-3 text-xs text-zinc-500 hover:text-zinc-800"
              >
                + add skill
              </button>
            </div>
          ) : (
            <div key={category.category} className="space-y-0.5">
              <div className="font-semibold">
                {catIdx + 1}
                {") "}
                {category.category}
              </div>
              <ul className="ml-5 list-disc">
                {category.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          ),
        )}

        {/* add category dropdown — only shows unused categories */}
        {editing && availableCategories.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-500">+ add category:</span>
            <select
              title="Select category to add"
              className="border border-zinc-400 bg-[#dfe5f4] px-1 py-0.5 text-xs outline-none focus:border-zinc-700"
              value=""
              onChange={(e) => {
                if (e.target.value) addCategory(e.target.value);
              }}
            >
              <option value="" disabled>
                select…
              </option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── languages ── */}
        {(data.languages.length > 0 || editing) && (
          <div className="border-t border-zinc-950 pt-2">
            <div className="font-semibold">Languages</div>

            {editing ? (
              <div className="mt-1 space-y-1">
                {data.languages.map((language, langIdx) => (
                  <div
                    key={langIdx}
                    className="space-y-1 rounded bg-[#dfe5f4] p-1.5"
                  >
                    <div className="flex items-center gap-1">
                      <InlineInput
                        value={language.name}
                        placeholder="Language name"
                        onChange={(v) => updateLanguage(langIdx, { name: v })}
                        className="flex-1 font-medium"
                      />
                      <IconButton
                        onClick={() => removeLanguage(langIdx)}
                        title="Remove language"
                        className="text-red-600 hover:bg-red-100"
                      >
                        🗑
                      </IconButton>
                    </div>
                    <InlineInput
                      value={language.description}
                      placeholder="Description"
                      onChange={(v) =>
                        updateLanguage(langIdx, { description: v })
                      }
                      className="w-full text-xs"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLanguage}
                  className="text-xs text-zinc-600 hover:text-zinc-900 hover:underline"
                >
                  + add language
                </button>
              </div>
            ) : (
              <ul className="mt-1 space-y-1">
                {data.languages.map((language) => (
                  <li key={language.name}>
                    <span className="font-medium">{language.name}</span>
                    {": "}
                    <span>{language.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
