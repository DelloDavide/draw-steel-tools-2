import { useState, useMemo } from "react";
import type { DrawSteelProjectBlock, DrawSteelProject } from "../../types/DrawSteelZod";
import { Icon } from "./Icon";
import { getProjectMilestones } from "../../helpers/milestones";

// ── constants ──────────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  "Build Airship",
  "Build Or Repair Road",
  "Craft Teleportation Platform",
  "Craft Treasure",
  "Find A Cure",
  "Imbue Treasure",
  "Imbue Armor",
  "Imbue Implement",
  "Imbue Weapon",
  "Discover Lore",
  "Go Undercover",
  "Hone Career Skills",
  "Learn From A Master",
  "Learn New Language",
  "Learn New Skill",
  "Perfect New Recipe",
  "Community Service",
] as const;

const PROJECT_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed",
  "Paused",
  "Abandoned",
] as const;

const PROJECT_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

const CHARACTERISTICS = [
  "Might",
  "Agility",
  "Reason",
  "Intuition",
  "Presence",
] as const;

// ── helpers ────────────────────────────────────────────────────────────────────

function progressPercentage(progress: number, completion: number) {
  if (!Number.isFinite(progress) || !Number.isFinite(completion) || completion <= 0) return 0;
  const percentage = (progress / completion) * 100;
  if (!Number.isFinite(percentage)) return 0;
  return Math.max(0, Math.min(100, Number(percentage.toFixed(2))));
}

function statusColor(status: string) {
  switch (status) {
    case "Completed": return "bg-green-700";
    case "Paused": return "bg-yellow-600";
    case "Abandoned": return "bg-red-700";
    case "Not Started": return "bg-zinc-500";
    default: return "bg-blue-700";
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "Critical": return "text-red-700";
    case "High": return "text-orange-700";
    case "Medium": return "text-yellow-700";
    default: return "text-zinc-600";
  }
}

function emptyProject(): DrawSteelProject {
  return {
    type: "Craft Treasure",
    name: "",
    progress: 0,
    completion: 1,
    status: "In Progress",
    priority: "Medium",
    contributors: [],
    notes: [],
    tags: [],
    auto_complete: false,
    hidden: false,
  };
}

// ── sub-components ─────────────────────────────────────────────────────────────

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

// ── project edit form ──────────────────────────────────────────────────────────

function ProjectEditForm({
  project,
  onChange,
  onRemove,
}: {
  project: DrawSteelProject;
  onChange: (patch: Partial<DrawSteelProject>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2 rounded border border-zinc-400 bg-[#dfe5f4] p-2">
      {/* name + remove */}
      <div className="flex items-center gap-1">
        <InlineInput
          value={project.name}
          placeholder="Project name"
          onChange={(v) => onChange({ name: v })}
          className="flex-1 font-bold"
        />
        <IconButton
          onClick={onRemove}
          title="Remove project"
          className="text-red-600 hover:bg-red-100"
        >
          🗑
        </IconButton>
      </div>

      {/* type */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase text-zinc-500">Type</span>
        <select
          title={project.type}
          value={project.type}
          onChange={(e) => onChange({ type: e.target.value as DrawSteelProject["type"] })}
          className="border border-zinc-400 bg-white px-1 py-0.5 text-xs outline-none focus:border-zinc-700"
        >
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* status + priority */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase text-zinc-500">Status</span>
          <select
            title={project.status}
            value={project.status}
            onChange={(e) => onChange({ status: e.target.value as DrawSteelProject["status"] })}
            className="border border-zinc-400 bg-white px-1 py-0.5 text-xs outline-none focus:border-zinc-700"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase text-zinc-500">Priority</span>
          <select
            title={project.priority}
            value={project.priority}
            onChange={(e) => onChange({ priority: e.target.value as DrawSteelProject["priority"] })}
            className="border border-zinc-400 bg-white px-1 py-0.5 text-xs outline-none focus:border-zinc-700"
          >
            {PROJECT_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* progress + completion */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase text-zinc-500">Progress</span>
          <input
            title={`Project ${project.name} Progress`}
            type="number"
            min={0}
            max={project.completion}
            value={project.progress}
            onChange={(e) =>
              onChange({ progress: Math.max(0, Math.min(project.completion, parseInt(e.target.value) || 0)) })
            }
            className="border-b border-zinc-400 bg-transparent text-center outline-none focus:border-zinc-700"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase text-zinc-500">Completion</span>
          <input
            title={`Project ${project.name} Completion`}
            type="number"
            min={1}
            value={project.completion}
            onChange={(e) =>
              onChange({ completion: Math.max(1, parseInt(e.target.value) || 1) })
            }
            className="border-b border-zinc-400 bg-transparent text-center outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* description */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase text-zinc-500">Description</span>
        <InlineInput
          value={project.description ?? ""}
          placeholder="Description…"
          onChange={(v) => onChange({ description: v || undefined })}
          className="w-full text-xs"
        />
      </div>

      {/* roll characteristics */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase text-zinc-500">Roll Characteristics</span>
        <div className="flex flex-wrap gap-1">
          {CHARACTERISTICS.map((c) => {
            const checked = project.project_roll_characteristic?.includes(c) ?? false;
            return (
              <label key={c} className="flex items-center gap-0.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const current = project.project_roll_characteristic ?? [];
                    onChange({
                      project_roll_characteristic: checked
                        ? current.filter((x) => x !== c)
                        : [...current, c],
                    });
                  }}
                />
                {c}
              </label>
            );
          })}
        </div>
      </div>

      {/* source */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase text-zinc-500">Source</span>
        <InlineInput
          value={project.project_source ?? ""}
          placeholder="Source…"
          onChange={(v) => onChange({ project_source: v || undefined })}
          className="w-full text-xs"
        />
      </div>

      {/* contributors */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase text-zinc-500">Contributors (comma-separated)</span>
        <InlineInput
          value={project.contributors.join(", ")}
          placeholder="e.g. Aldric, Serana"
          onChange={(v) =>
            onChange({
              contributors: v.split(",").map((x) => x.trim()).filter(Boolean),
            })
          }
          className="w-full text-xs"
        />
      </div>

      {/* tags */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase text-zinc-500">Tags (comma-separated)</span>
        <InlineInput
          value={project.tags.join(", ")}
          placeholder="e.g. crafting, magic"
          onChange={(v) =>
            onChange({
              tags: v.split(",").map((x) => x.trim()).filter(Boolean),
            })
          }
          className="w-full text-xs"
        />
      </div>

      {/* notes */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase text-zinc-500">Notes</span>
        {project.notes.map((note, ni) => (
          <div key={ni} className="flex items-center gap-1">
            <InlineInput
              value={note}
              placeholder="Note…"
              onChange={(v) => {
                const updated = [...project.notes];
                updated[ni] = v;
                onChange({ notes: updated });
              }}
              className="flex-1 text-xs"
            />
            <IconButton
              onClick={() =>
                onChange({ notes: project.notes.filter((_, i) => i !== ni) })
              }
              title="Remove note"
              className="text-red-500 hover:bg-red-100"
            >
              ✕
            </IconButton>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ notes: [...project.notes, ""] })}
          className="text-left text-xs text-zinc-500 hover:text-zinc-800"
        >
          + add note
        </button>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export function ProjectBlock({
  projectBlock,
  onProgress,
  onSave,
}: {
  projectBlock: DrawSteelProjectBlock;
  onProgress?: (projectName: string, delta: number) => void;
  onSave?: (updated: DrawSteelProjectBlock) => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DrawSteelProjectBlock>(projectBlock);
  const [saving, setSaving] = useState(false);

  const hasDraftChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(projectBlock),
    [draft, projectBlock],
  );

  const canSave = hasDraftChanges && !saving;

  function startEdit() {
    setDraft(projectBlock);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function handleSave() {
    if (!onSave) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  // ── draft project helpers ──────────────────────────────────────────────────

  function updateProject(idx: number, patch: Partial<DrawSteelProject>) {
    setDraft((d) => ({
      ...d,
      projects: d.projects.map((p, i) =>
        i === idx ? { ...p, ...patch } : p,
      ),
    }));
  }

  function addProject() {
    setDraft((d) => ({
      ...d,
      projects: [...d.projects, emptyProject()],
    }));
  }

  function removeProject(idx: number) {
    setDraft((d) => ({
      ...d,
      projects: d.projects.filter((_, i) => i !== idx),
    }));
  }

  // ── block-level note helpers ───────────────────────────────────────────────

  function updateBlockNote(idx: number, value: string) {
    setDraft((d) => ({
      ...d,
      notes: d.notes.map((n, i) => (i === idx ? value : n)),
    }));
  }

  function addBlockNote() {
    setDraft((d) => ({ ...d, notes: [...d.notes, ""] }));
  }

  function removeBlockNote(idx: number) {
    setDraft((d) => ({ ...d, notes: d.notes.filter((_, i) => i !== idx) }));
  }

  // ── render ─────────────────────────────────────────────────────────────────

  // In edit mode we show draft projects for editing AND read-mode projects
  // for the progress stepper (progress changes go through onProgress, not draft)
  const displayBlock = editing ? draft : projectBlock;

  return (
    <div className="w-full max-w-2xl border border-zinc-950 bg-[#e8edf9] text-sm text-zinc-950 shadow-md">
      {/* Header */}
      <div className="border-b border-zinc-950 px-3 py-2 text-center">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <div className="text-lg font-black tracking-wide">
            {displayBlock.name}
          </div>
          <div className="flex flex-1 justify-end gap-1">
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
                title="Edit projects"
                className="bg-[#dfe5f4] text-zinc-700 hover:bg-zinc-300"
              >
                ✎ Edit
              </IconButton>
            )}
          </div>
        </div>

        <div className="mt-1 text-xs text-zinc-700 italic">
          {displayBlock.flavor}
        </div>

        {(displayBlock.owner || displayBlock.party) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px]">
            {displayBlock.owner && (
              <span className="border border-zinc-700 bg-white px-2 py-0.5">
                Owner: {displayBlock.owner}
              </span>
            )}
            {displayBlock.party && (
              <span className="border border-zinc-700 bg-white px-2 py-0.5">
                Party: {displayBlock.party}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="space-y-3 p-3">
        {editing ? (
          <>
            {draft.projects.map((project, idx) => (
              <ProjectEditForm
                key={idx}
                project={project}
                onChange={(patch) => updateProject(idx, patch)}
                onRemove={() => removeProject(idx)}
              />
            ))}
            <button
              type="button"
              onClick={addProject}
              className="text-xs text-zinc-600 hover:text-zinc-900 hover:underline"
            >
              + add project
            </button>
          </>
        ) : (
          projectBlock.projects.map((project) => {
            const percentage = progressPercentage(project.progress, project.completion);
            const completed = project.progress >= project.completion;
            const milestones = getProjectMilestones(project.completion);

            return (
              <div
                key={`${project.type}-${project.name}`}
                className="border border-zinc-900 bg-white p-3 shadow-sm"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon name={project.icon} className="h-5 w-5" />
                      <div className="text-base font-bold">{project.name}</div>
                    </div>
                    <div className="text-xs text-zinc-600">{project.type}</div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-[10px] font-semibold">
                    <span className={`px-2 py-0.5 text-white ${statusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={priorityColor(project.priority)}>
                      {project.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <div className="mt-2 text-xs text-zinc-700 italic">
                    {project.description}
                  </div>
                )}

                {/* Progress */}
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px] font-semibold">
                    <span>Progress</span>
                    <span>{project.progress} / {project.completion}</span>
                  </div>

                  <div className="relative h-3 w-full overflow-hidden border border-zinc-950 bg-zinc-200">
                    <div
                      className="h-full bg-blue-700 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                    {milestones.map((m, i) => {
                      const pos = (m / project.completion) * 100;
                      return (
                        <div
                          key={i}
                          className="absolute top-0 h-full w-[2px] bg-zinc-900"
                          style={{ left: `${pos}%` }}
                        />
                      );
                    })}
                  </div>

                  {milestones.length > 0 && (
                    <div className="relative mt-1 h-3 text-[9px] text-zinc-600">
                      {milestones.map((m, i) => {
                        const pos = (m / project.completion) * 100;
                        return (
                          <div
                            key={i}
                            className="absolute -translate-x-1/2"
                            style={{ left: `${pos}%` }}
                          >
                            {m}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-1 text-right text-[10px] text-zinc-600">
                    {percentage}%
                  </div>
                </div>

                {/* Progress stepper — unchanged, controlled by onProgress */}
                {onProgress && !completed && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center border border-zinc-900 bg-white">
                      <button
                        disabled={project.progress <= 0}
                        onClick={() => onProgress(project.name, -1)}
                        className={`px-3 py-1 text-sm font-bold transition ${
                          project.progress <= 0
                            ? "cursor-not-allowed opacity-40"
                            : "hover:bg-zinc-200"
                        }`}
                        onMouseDown={(e) => {
                          let interval: any;
                          const start = () => { interval = setInterval(() => { onProgress(project.name, -1); }, 200); };
                          const stop = () => clearInterval(interval);
                          e.currentTarget.onmouseup = stop;
                          e.currentTarget.onmouseleave = stop;
                          start();
                        }}
                      >
                        −
                      </button>
                      <div className="min-w-[70px] px-3 py-1 text-center text-xs font-semibold">
                        {project.progress}
                      </div>
                      <button
                        disabled={project.progress >= project.completion}
                        onClick={() => onProgress(project.name, +1)}
                        className={`px-3 py-1 text-sm font-bold transition ${
                          project.progress >= project.completion
                            ? "cursor-not-allowed opacity-40"
                            : "hover:bg-zinc-200"
                        }`}
                        onMouseDown={(e) => {
                          let interval: any;
                          const start = () => { interval = setInterval(() => { onProgress(project.name, +1); }, 200); };
                          const stop = () => clearInterval(interval);
                          e.currentTarget.onmouseup = stop;
                          e.currentTarget.onmouseleave = stop;
                          start();
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-[10px] text-zinc-600">/ {project.completion}</div>
                  </div>
                )}

                {/* Mechanics */}
                {(project.project_roll_characteristic || project.item_prerequisite?.length || project.project_source) && (
                  <div className="mt-3 space-y-1 text-xs">
                    {project.project_roll_characteristic && (
                      <div>
                        <span className="font-semibold">Roll:</span>{" "}
                        {project.project_roll_characteristic.join(", ")}
                      </div>
                    )}
                    {project.project_source && (
                      <div>
                        <span className="font-semibold">Source:</span>{" "}
                        {project.project_source}
                      </div>
                    )}
                    {project.item_prerequisite && project.item_prerequisite.length > 0 && (
                      <div>
                        <span className="font-semibold">Prerequisites:</span>
                        <ul className="ml-5 list-disc">
                          {project.item_prerequisite.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Contributors */}
                {project.contributors.length > 0 && (
                  <div className="mt-3 text-xs">
                    <span className="font-semibold">Contributors:</span>{" "}
                    {project.contributors.join(", ")}
                  </div>
                )}

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-zinc-400 bg-zinc-100 px-2 py-0.5 text-[10px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {project.notes.length > 0 && (
                  <div className="mt-3 border-t border-dashed border-zinc-300 pt-2">
                    <div className="mb-1 text-xs font-semibold">Notes</div>
                    <ul className="ml-5 list-disc text-xs text-zinc-700">
                      {project.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Notes */}
      {editing ? (
        <div className="border-t border-zinc-950 bg-white px-3 py-2">
          <div className="mb-1 text-xs font-bold">Campaign Notes</div>
          {draft.notes.map((note, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <InlineInput
                value={note}
                placeholder="Note…"
                onChange={(v) => updateBlockNote(idx, v)}
                className="flex-1 text-xs"
              />
              <IconButton
                onClick={() => removeBlockNote(idx)}
                title="Remove note"
                className="text-red-500 hover:bg-red-100"
              >
                ✕
              </IconButton>
            </div>
          ))}
          <button
            type="button"
            onClick={addBlockNote}
            className="mt-1 text-xs text-zinc-500 hover:text-zinc-800"
          >
            + add note
          </button>
        </div>
      ) : (
        projectBlock.notes.length > 0 && (
          <div className="border-t border-zinc-950 bg-white px-3 py-2">
            <div className="mb-1 text-xs font-bold">Campaign Notes</div>
            <ul className="ml-5 list-disc text-xs text-zinc-700">
              {projectBlock.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}
