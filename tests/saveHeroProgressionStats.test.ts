import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveHeroProgressionStats } from "../src/helpers/saveHeroProgressionStats";
import { DrawSteelStatblockZod } from "../src/types/DrawSteelZod";

const mocks = vi.hoisted(() => ({
  getGitHubApiUrl: vi.fn(() => "github-api-url"),
  getGitHubFileSha: vi.fn(async () => "file-sha"),
  getGitHubHeaders: vi.fn(() => ({ Authorization: "token" })),
  putGitHubFile: vi.fn(async () => {}),
  supabaseFrom: vi.fn(),
  supabaseUpdate: vi.fn(),
  supabaseEq: vi.fn(),
  setTypedDataCache: vi.fn(),
}));

vi.mock("../src/helpers/githubClient", () => ({
  getGitHubApiUrl: mocks.getGitHubApiUrl,
  getGitHubFileSha: mocks.getGitHubFileSha,
  getGitHubHeaders: mocks.getGitHubHeaders,
  putGitHubFile: mocks.putGitHubFile,
}));

vi.mock("../src/supabaseClient", () => ({
  supabase: { from: mocks.supabaseFrom },
}));

vi.mock("../src/statblockSearch/devScriptButtons/helpers/fetchTypedData", () => ({
  setTypedDataCache: mocks.setTypedDataCache,
}));

const statblock = DrawSteelStatblockZod.parse({
  name: "Antares",
  type: "statblock",
  level: 4,
  victories: 1,
  experience_points: 54,
  roles: ["Hero"],
  ancestry: ["Revenant"],
  ev: "72",
  stamina: "36",
  speed: 6,
  size: "1S",
  stability: 0,
  free_strike: 11,
  might: -1,
  agility: 1,
  reason: 4,
  intuition: 1,
  presence: 2,
  wealth: 1,
  renown: 3,
});

describe("saveHeroProgressionStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.supabaseFrom.mockReturnValue({ update: mocks.supabaseUpdate });
    mocks.supabaseUpdate.mockReturnValue({ eq: mocks.supabaseEq });
    mocks.supabaseEq.mockResolvedValue({ error: null });
  });

  it("writes the complete hero statblock to GitHub and Supabase", async () => {
    await saveHeroProgressionStats("Antares", statblock);

    const path = "Heroes/Antares/Statblocks/Antares.json";
    expect(mocks.getGitHubApiUrl).toHaveBeenCalledWith(path);
    expect(mocks.getGitHubFileSha).toHaveBeenCalledWith(
      "github-api-url",
      { Authorization: "token" },
    );
    expect(mocks.putGitHubFile).toHaveBeenCalledWith(
      "github-api-url",
      { Authorization: "token" },
      "file-sha",
      "The Hero Antares Updated Their Victories and Experience Points",
      statblock,
    );
    expect(mocks.supabaseFrom).toHaveBeenCalledWith("bestiary_documents");
    expect(mocks.supabaseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ content: statblock }),
    );
    expect(mocks.supabaseEq).toHaveBeenCalledWith("path", path);
    expect(mocks.setTypedDataCache).toHaveBeenCalledWith(path, statblock);
  });

  it("does not attempt writes when the hero is missing from the index", async () => {
    await expect(
      saveHeroProgressionStats("Missing Hero", statblock),
    ).rejects.toThrow('Could not find hero statblock for "Missing Hero"');

    expect(mocks.putGitHubFile).not.toHaveBeenCalled();
    expect(mocks.supabaseFrom).not.toHaveBeenCalled();
    expect(mocks.setTypedDataCache).not.toHaveBeenCalled();
  });

  it("surfaces Supabase errors and does not cache unsaved data", async () => {
    mocks.supabaseEq.mockResolvedValue({
      error: { message: "database unavailable" },
    });

    await expect(saveHeroProgressionStats("Antares", statblock)).rejects.toThrow(
      'Supabase write error for "Heroes/Antares/Statblocks/Antares.json": database unavailable',
    );

    expect(mocks.setTypedDataCache).not.toHaveBeenCalled();
  });
});
