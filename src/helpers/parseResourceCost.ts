export type ParsedResourceCost = {
  amount: number;
  resourceName: string;
};

export function parseResourceCost(cost: string): ParsedResourceCost | undefined {
  const trimmed = cost.trim();
  const match = trimmed.match(/^([+-]?\d+(?:\.\d+)?)\s+(.+)$/);
  if (!match) return undefined;

  const amount = parseFloat(match[1]);
  if (Number.isNaN(amount)) return undefined;

  const resourceName = match[2].trim();
  if (resourceName === "") return undefined;

  return { amount: Math.trunc(amount), resourceName };
}

export function isMaliceResourceCost(cost: string): boolean {
  const parsed = parseResourceCost(cost);
  return parsed?.resourceName.toLowerCase() === "malice";
}
