import type { DrawSteelSkillBlock } from "../../types/DrawSteelZod";

export function SkillBlock({
  skillBlock,
}: {
  skillBlock: DrawSteelSkillBlock;
}) {
  return (
    <div className="w-full max-w-xs border border-zinc-950 bg-[#e8edf9] p-2 text-sm text-zinc-950">
      <div className="border-b border-zinc-950 pb-1 text-center font-black tracking-wide">
        {skillBlock.name}
      </div>

      <div className="space-y-2 pt-2">
        {skillBlock.categories.map((category, index) => (
          <div key={category.category} className="space-y-0.5">
            <div className="font-semibold">
              {index + 1}
              {") "}
              {category.category}
            </div>

            <ul className="ml-5 list-disc">
              {category.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        ))}

        {skillBlock.languages.length > 0 && (
          <div className="border-t border-zinc-950 pt-2">
            <div className="font-semibold">Languages</div>

            <ul className="mt-1 space-y-1">
              {skillBlock.languages.map((language) => (
                <li key={language.name}>
                  <span className="font-medium">{language.name}</span>
                  {": "}
                  <span>{language.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
