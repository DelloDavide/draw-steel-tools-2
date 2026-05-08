import definitions from "../../rulesReference/definitions.json";

export const potencyRegex = /([MAIRP][ ][<][ ][-]?[\d])+/g;

export const characteristicTestRegex =
  /((?:Might|Agility|Intuition|Reason|Presence)(?: test)(?!s))+/g;

export const rollRegex = /((?:\d+)?(?:d\d+)(?:\s*\+\s*\d+)?)+/g;

const buildDefinitionsRegex = (tags: string[]) => {
  let regex = "";
  definitions
    .filter((definition) => definition.tags.some((val) => tags.includes(val)))
    .forEach((definition) => {
      if (definition.regex) regex += definition.regex + "|";
      else if (definition.match)
        definition.match.forEach((val) => (regex += val + "|"));
      else throw new Error("Could not generate regex");
    });
  regex = regex.substring(0, regex.length - 1);
  return new RegExp(`(${regex})`, "gi");
};

export const generalDefinitionsRegex = buildDefinitionsRegex([
  "condition",
  "combat",
  "area",
]);
export const abilityKeywordsRegex = buildDefinitionsRegex(["ability_keywords"]);
export const distancesRegex = buildDefinitionsRegex(["area", "distance"]);

export const titleRegexList = definitions
  .filter(
    (definition) =>
      (definition.match && definition.match.length > 0) || definition.regex,
  )
  .map((definition) => {
    let regex = "";
    if (definition.regex) regex = definition.regex + "|";
    else if (definition.match)
      definition.match.forEach((val) => (regex += val + "|"));
    else throw new Error("Could not generate regex");
    regex = regex.substring(0, regex.length - 1);
    return {
      title: definition.title,
      tags: definition.tags,
      regex: new RegExp(`(${regex})`, "i"),
    };
  });
