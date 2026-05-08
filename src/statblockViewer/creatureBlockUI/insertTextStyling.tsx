import { InlineRollButton } from "./InlineRollButton";
import { DefinitionDialog } from "./definitionDialog";
import {
  characteristicTestRegex,
  generalDefinitionsRegex,
  potencyRegex,
  rollRegex,
} from "./regex";
import { replaceWithJsx } from "./replaceWithJsx";

export function insertTextStyling(string: string, noRecursion = false) {
  string = string.replaceAll("*", "");
  let key = 0;
  let output = replaceWithJsx([string], potencyRegex, (text) => (
    <span
      key={key++}
      className="rounded-sm bg-zinc-950 px-1 py-[1px] text-xs font-semibold whitespace-nowrap text-white"
    >
      {text}
    </span>
  ));
  output = replaceWithJsx(output, characteristicTestRegex, (text) => (
    <span key={key++} className="font-semibold">
      {text}
    </span>
  ));
  output = replaceWithJsx(output, rollRegex, (text) => (
    <InlineRollButton key={key++} text={text} />
  ));
  output = replaceWithJsx(output, generalDefinitionsRegex, (text) =>
    noRecursion ? (
      <span key={key++}>{text}</span>
    ) : (
      <DefinitionDialog
        key={key++}
        text={text}
        tags={["condition", "combat", "area"]}
      >
        <button className="text-[#866D4B] hover:underline">{text}</button>
      </DefinitionDialog>
    ),
  );

  return output;
}
