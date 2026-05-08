import type { JSX } from "react";

export const replaceWithJsx = (
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
