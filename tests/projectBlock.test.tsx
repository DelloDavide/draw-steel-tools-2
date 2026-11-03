import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectBlock } from "../src/statblockViewer/creatureBlockUI/ProjectBlock";
import { DrawSteelProjectBlockZod } from "../src/types/DrawSteelZod";

const block = DrawSteelProjectBlockZod.parse({
  type: "projectblock",
  projectblock_type: "Projects",
  name: "Party projects",
  flavor: "",
  projects: [
    {
      type: "Craft Treasure",
      name: "Duplicate",
      progress: 0,
      completion: 40,
      notes: ["Same", "Same"],
    },
    { type: "Craft Treasure", name: "Duplicate", progress: 1, completion: 40 },
  ],
  notes: ["Same", "Same"],
});

describe("project editing", () => {
  let container: HTMLDivElement;
  let root: Root;
  const onSave = vi.fn();

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    onSave.mockReset();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () =>
      root.render(<ProjectBlock projectBlock={block} onSave={onSave} />),
    );
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function click(title: string, index = 0) {
    const button = container.querySelectorAll<HTMLButtonElement>(
      `button[title="${title}"]`,
    )[index];
    if (!button) throw new Error(`Missing button: ${title}`);
    await act(async () => button.click());
  }

  async function add(text: string, index = 0) {
    const button = [...container.querySelectorAll("button")].filter(
      (entry) => entry.textContent === text,
    )[index];
    if (!button) throw new Error(`Missing button: ${text}`);
    await act(async () => button.click());
  }

  async function edit(input: HTMLInputElement, value: string) {
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  it("preserves duplicate project and note inputs across edits and removals", async () => {
    await click("Edit projects");
    const secondProject = container.querySelectorAll<HTMLInputElement>(
      'input[placeholder="Project name"]',
    )[1];
    const secondNote = container.querySelectorAll<HTMLInputElement>(
      'input[placeholder="Note…"]',
    )[1];
    await edit(secondNote, "Edited");
    expect(container.querySelectorAll('input[placeholder="Note…"]')[1]).toBe(
      secondNote,
    );
    await click("Remove note");
    expect(container.querySelector('input[placeholder="Note…"]')).toBe(
      secondNote,
    );
    await click("Remove project");
    expect(container.querySelector('input[placeholder="Project name"]')).toBe(
      secondProject,
    );
    await edit(secondProject, "Renamed");
    expect(container.querySelector('input[placeholder="Project name"]')).toBe(
      secondProject,
    );
  });

  it("preserves campaign note inputs across edits and removals", async () => {
    await click("Edit projects");
    const notes = container.querySelectorAll<HTMLInputElement>(
      'input[placeholder="Note…"]',
    );
    const secondCampaignNote = notes[3];
    await edit(secondCampaignNote, "Campaign update");
    await click("Remove note", 2);
    expect(container.querySelectorAll('input[placeholder="Note…"]')[2]).toBe(
      secondCampaignNote,
    );
    await click("Save changes");
    expect(onSave.mock.calls[0][0].notes).toEqual(["Campaign update"]);
  });

  it("keeps UI identities outside the strict save schema when adding and removing rows", async () => {
    await click("Edit projects");
    await add("+ add project");
    await add("+ add note");
    await click("Remove note");
    await click("Remove project");
    await add("+ add note", 1);
    await click("Save changes");
    expect(onSave).toHaveBeenCalledOnce();
    const saved = DrawSteelProjectBlockZod.parse(onSave.mock.calls[0][0]);
    expect(saved.projects).toEqual([
      block.projects[1],
      {
        ...block.projects[1],
        name: "",
        progress: 0,
        completion: 1,
        notes: [""],
      },
    ]);
    expect(saved.notes).toEqual(block.notes);
  });

  it("resets draft rows on cancellation and a fresh edit session", async () => {
    await click("Edit projects");
    await click("Remove project");
    await add("+ add note");
    await click("Cancel");
    await click("Edit projects");
    expect(
      container.querySelectorAll('input[placeholder="Project name"]'),
    ).toHaveLength(2);
    expect(
      container.querySelectorAll('input[placeholder="Note…"]'),
    ).toHaveLength(4);
    expect(onSave).not.toHaveBeenCalled();
  });
});
