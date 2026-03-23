export function applyTextEffects(string: string) {
  const potencyRegex = /([MAIRP][ ][<][ ][-]?[\d])+/g;
  const characteristicTestRegex =
    /((?:Might|Agility|Intuition|Reason|Presence)(?: test))+/g;

  return string
    .replaceAll("*", "")
    .split(potencyRegex)
    .map((val, index) =>
      index % 2 ? (
        <span
          key={index}
          className="rounded-sm bg-zinc-950 px-1 py-[1px] text-xs font-semibold whitespace-nowrap text-white"
        >
          {val}
        </span>
      ) : (
        val.split(characteristicTestRegex).map((val, index) =>
          index % 2 ? (
            <span key={index} className="font-semibold">
              {val}
            </span>
          ) : (
            <span key={index}>{val}</span>
          ),
        )
      ),
    );
}
