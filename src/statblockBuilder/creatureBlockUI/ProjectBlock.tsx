import type { DrawSteelProjectBlock } from "../../types/DrawSteelZod";
import { Icon } from "./Icon";
import { getProjectMilestones } from "../../helpers/milestones";

function progressPercentage(progress: number, completion: number) {
  if (
    !Number.isFinite(progress) ||
    !Number.isFinite(completion) ||
    completion <= 0
  ) {
    return 0;
  }

  const percentage = (progress / completion) * 100;

  if (!Number.isFinite(percentage)) return 0;

  return Math.max(
    0,
    Math.min(100, Number(percentage.toFixed(2)))
  );
}

function statusColor(status: string) {
  switch (status) {
    case "Completed":
      return "bg-green-700";
    case "Paused":
      return "bg-yellow-600";
    case "Abandoned":
      return "bg-red-700";
    case "Not Started":
      return "bg-zinc-500";
    default:
      return "bg-blue-700";
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "Critical":
      return "text-red-700";
    case "High":
      return "text-orange-700";
    case "Medium":
      return "text-yellow-700";
    default:
      return "text-zinc-600";
  }
}

export function ProjectBlock({
  projectBlock,
  onProgress,
}: {
  projectBlock: DrawSteelProjectBlock;
  onProgress?: (projectName: string, delta: number) => void;
}) {
  return (
    <div className="w-full max-w-2xl border border-zinc-950 bg-[#e8edf9] text-sm text-zinc-950 shadow-md">
      {/* Header */}
      <div className="border-b border-zinc-950 px-3 py-2 text-center">
        <div className="text-lg font-black tracking-wide">
          {projectBlock.name}
        </div>

        <div className="mt-1 text-xs text-zinc-700 italic">
          {projectBlock.flavor}
        </div>

        {(projectBlock.owner || projectBlock.party) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px]">
            {projectBlock.owner && (
              <span className="border border-zinc-700 bg-white px-2 py-0.5">
                Owner: {projectBlock.owner}
              </span>
            )}

            {projectBlock.party && (
              <span className="border border-zinc-700 bg-white px-2 py-0.5">
                Party: {projectBlock.party}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="space-y-3 p-3">
        {projectBlock.projects.map((project) => {
          const percentage = progressPercentage(
            project.progress,
            project.completion,
          );

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
                  <span
                    className={`px-2 py-0.5 text-white ${statusColor(
                      project.status,
                    )}`}
                  >
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
                  <span>
                    {project.progress} / {project.completion}
                  </span>
                </div>

                <div className="relative h-3 w-full overflow-hidden border border-zinc-950 bg-zinc-200">
                  {/* progress fill */}
                  <div
                    className="h-full bg-blue-700 transition-all"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                  {/* milestone markers */}
                  {milestones.map((m, i) => {
                    const pos = (m / project.completion) * 100;

                    return (
                      <div
                        key={i}
                        className="absolute top-0 h-full w-[2px] bg-zinc-900"
                        style={{
                          left: `${pos}%`,
                        }}
                      />
                    );
                  })}
                </div>

                {/* milestone labels */}
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

              {/* Action Buttons */}
              {onProgress && !completed && (
                <div className="mt-3 flex items-center justify-between gap-3">
                  {/* Stepper */}
                  <div className="flex items-center border border-zinc-900 bg-white">
                    {/* Decrease */}
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

                        const start = () => {
                          interval = setInterval(() => {
                            onProgress(project.name, -1);
                          }, 200);
                        };

                        const stop = () => clearInterval(interval);

                        e.currentTarget.onmouseup = stop;
                        e.currentTarget.onmouseleave = stop;

                        start();
                      }}
                    >
                      −
                    </button>

                    {/* Value */}
                    <div className="min-w-[70px] px-3 py-1 text-center text-xs font-semibold">
                      {project.progress}
                    </div>

                    {/* Increase */}
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

                        const start = () => {
                          interval = setInterval(() => {
                            onProgress(project.name, +1);
                          }, 200);
                        };

                        const stop = () => clearInterval(interval);

                        e.currentTarget.onmouseup = stop;
                        e.currentTarget.onmouseleave = stop;

                        start();
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Completion hint */}
                  <div className="text-[10px] text-zinc-600">
                    / {project.completion}
                  </div>
                </div>
              )}

              {/* Mechanics */}
              {(project.project_roll_characteristic ||
                project.item_prerequisite?.length ||
                project.project_source) && (
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

                  {project.item_prerequisite &&
                    project.item_prerequisite.length > 0 && (
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
        })}
      </div>

      {/* Footer Notes */}
      {projectBlock.notes.length > 0 && (
        <div className="border-t border-zinc-950 bg-white px-3 py-2">
          <div className="mb-1 text-xs font-bold">Campaign Notes</div>

          <ul className="ml-5 list-disc text-xs text-zinc-700">
            {projectBlock.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
