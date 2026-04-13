import type { JSX } from "react";
import { InlineRollButton } from "./InlineRollButton";

const replaceWithJsx = (
  array: (string | JSX.Element)[],
  regExp: RegExp,
  getElement: (text: string) => JSX.Element,
) => {
  const output: (string | JSX.Element)[] = [];
  array.forEach((item) => {
    if (typeof item !== "string") {
      output.push(item);
      return;
    }
    output.push(
      ...item
        .split(regExp)
        .flatMap((val, index) => (index % 2 ? getElement(val) : val)),
    );
  });
  return output;
};

const potencyRegex = /([MAIRP][ ][<][ ][-]?[\d])+/g;
const characteristicTestRegex =
  /((?:Might|Agility|Intuition|Reason|Presence)(?: test))+/g;
const rollRegex = /((?:\d+)?(?:d\d+)(?:\s*\+\s*\d+)?)+/g;

export function formatRulesText(string: string) {
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

  return output;
}
