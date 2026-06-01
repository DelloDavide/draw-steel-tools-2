import { createContext, type Dispatch, type SetStateAction } from "react";
import type { DefinedHeroTokenData } from "../../types/tokenDataZod";

export type LinkedHeroToken = {
  itemId: string;
  token: DefinedHeroTokenData;
};

export const HeroTokenContext = createContext<LinkedHeroToken | undefined>(
  undefined,
);

export const UpdateHeroClassResourceContext = createContext<
  (resourceName: string, value: number) => void
>(() => {});

export type HeroResourceSpent =
  | { target: string; resourceName: string; value: number }
  | undefined;

export const HeroResourceSpentContext = createContext<HeroResourceSpent>(
  undefined,
);

export const SetHeroResourceSpentContext = createContext<
  Dispatch<SetStateAction<HeroResourceSpent>>
>(() => {});
