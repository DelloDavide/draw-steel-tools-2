import {
  Dice3Icon,
  ExternalLink,
  HeartCrackIcon,
  HeartPulseIcon,
  Settings2Icon,
} from "lucide-react";
import parseNumber from "../../helpers/parseNumber";
import type { Token } from "../../types/contextMenuToken";
import type { DefinedCharacterTokenData } from "../../types/tokenDataZod";
import BarTrackerInput from "../trackerInputs/BarTrackerInput";
import CounterTracker from "../trackerInputs/CounterTrackerInput";
import ValueButtonTrackerInput from "../trackerInputs/ValueButtonTrackerInput";
import Button from "../../components/ui/Button";
import { HeroicResourceRoller } from "./HeroicResourceRoller";
import OBR from "@owlbear-rodeo/sdk";
import { getContextMenuUrl } from "../../helpers/getContextMenuUrl";
import { getPluginId } from "../../helpers/getPluginId";
import Toggle from "../../components/ui/Toggle";
import { useState } from "react";
import { Label } from "../trackerInputs/Label";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggleGroup";
import Input from "../../components/ui/Input";
import FreeWheelInput from "../../components/logic/FreeWheelInput";

const params = new URLSearchParams(document.location.search);
const detailedVale = params.get("detailed");
const detailed = detailedVale === "true" ? true : false;

export default function StatEditor({
  token,
  updateToken,
}: {
  token: Token;
  updateToken: (characterTokenData: Partial<DefinedCharacterTokenData>) => void;
}) {
  const [heroicResourceSettingsOpen, setHeroicResourceSettingsOpen] =
    useState(false);

  if (token.type !== "HERO" && token.type !== "MONSTER")
    throw new Error("Expected hero or monster token type");

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-2">
          <div className="flex items-end gap-2">
            <BarTrackerInput
              label={"Stamina"}
              labelTitle={`Winded Value: ${Math.trunc(token.staminaMaximum / 2)}`}
              color="RED"
              parentValue={token.stamina.toString()}
              parentMax={token.staminaMaximum.toString()}
              valueUpdateHandler={(target) =>
                updateToken({
                  stamina: parseNumber(target.value, {
                    min: -9999,
                    max: 9999,
                    truncate: true,
                    inlineMath: { previousValue: token.stamina },
                  }),
                })
              }
              maxUpdateHandler={(target) =>
                updateToken({
                  staminaMaximum: parseNumber(target.value, {
                    min: -9999,
                    max: 9999,
                    truncate: true,
                    inlineMath: { previousValue: token.staminaMaximum },
                  }),
                })
              }
            />
          </div>
        </div>

        <div className="col-span-2">
          <ValueButtonTrackerInput
            label={"Temporary Stamina"}
            color="GREEN"
            parentValue={token.temporaryStamina}
            updateHandler={(target) =>
              updateToken({
                temporaryStamina: parseNumber(target.value, {
                  min: -999,
                  max: 999,
                  truncate: true,
                  inlineMath: { previousValue: token.temporaryStamina },
                }),
              })
            }
            buttonProps={{
              title: "Apply to Stamina",
              children: <HeartCrackIcon />,
              className: token.temporaryStamina < 0 ? "" : "hidden",
              onClick: () => {
                if (token.temporaryStamina >= 0) return;
                updateToken({
                  stamina: token.stamina + token.temporaryStamina,
                  temporaryStamina: 0,
                });
              },
            }}
          />
        </div>
        {token.type === "HERO" && (
          <>
            <div className="col-span-2">
              <CounterTracker
                label={
                  token.heroicResourceName !== ""
                    ? token.heroicResourceName
                    : "Heroic Resource"
                }
                color="BLUE"
                parentValue={token.heroicResource}
                updateHandler={(target) =>
                  updateToken({
                    heroicResource: parseNumber(target.value, {
                      min: -999,
                      max: 999,
                      truncate: true,
                      inlineMath: { previousValue: token.heroicResource },
                    }),
                  })
                }
                incrementHandler={() => {
                  if (token.heroicResource >= 999) return;
                  updateToken({
                    heroicResource: token.heroicResource + 1,
                  });
                }}
                decrementHandler={() => {
                  if (token.heroicResource <= -999) return;
                  updateToken({
                    heroicResource: token.heroicResource - 1,
                  });
                }}
              />
            </div>
            <div className="col-span-2">
              <CounterTracker
                label={"Surges"}
                color="GOLD"
                parentValue={token.surges}
                updateHandler={(target) =>
                  updateToken({
                    surges: parseNumber(target.value, {
                      min: -999,
                      max: 999,
                      truncate: true,
                      inlineMath: { previousValue: token.surges },
                    }),
                  })
                }
                incrementHandler={() => {
                  if (token.surges >= 999) return;
                  updateToken({ surges: token.surges + 1 });
                }}
                decrementHandler={() => {
                  if (token.surges <= -999) return;
                  updateToken({ surges: token.surges - 1 });
                }}
              />
            </div>

            <HeroicResourceRoller
              variant={token.heroicResourceButton}
              onResult={(result) =>
                updateToken({ heroicResource: token.heroicResource + result })
              }
            />

            {detailed && (
              <Toggle
                size={"lg"}
                className="group h-[54px] shrink grow overflow-clip bg-sky-600/30 p-0 hover:bg-sky-600/30 focus-visible:ring-0 disabled:bg-sky-600/15 disabled:opacity-100 dark:bg-cyan-600/30 hover:dark:bg-cyan-600/30 dark:disabled:bg-cyan-600/15"
                pressed={heroicResourceSettingsOpen}
                onPressedChange={(pressed) => {
                  setHeroicResourceSettingsOpen(pressed);
                }}
              >
                <div className="group-hover:bg-foreground/7 group-focus-visible:bg-foreground/7 grid size-full place-items-center transition-colors">
                  <Settings2Icon />
                </div>
              </Toggle>
            )}

            <div className="col-span-2">
              <ValueButtonTrackerInput
                label={"Recoveries"}
                labelTitle={`Recovery Value: ${Math.trunc(token.staminaMaximum / 3)}`}
                parentValue={token.recoveries}
                updateHandler={(target) =>
                  updateToken({
                    recoveries: parseNumber(target.value, {
                      min: -999,
                      max: 999,
                      truncate: true,
                      inlineMath: { previousValue: token.recoveries },
                    }),
                  })
                }
                buttonProps={{
                  title: "Spend Recovery",
                  children: <HeartPulseIcon />,
                  onClick: () => {
                    if (token.recoveries <= 0) return;
                    if (token.staminaMaximum <= 0) return;
                    if (token.stamina >= token.staminaMaximum) return;
                    const staminaIncrease = Math.trunc(
                      token.staminaMaximum / 3,
                    );
                    const newStamina = token.stamina + staminaIncrease;
                    updateToken({
                      stamina:
                        newStamina < token.staminaMaximum
                          ? newStamina
                          : token.staminaMaximum,
                      recoveries: token.recoveries - 1,
                    });
                  },
                }}
              />
            </div>

            {!detailed && (
              <Button
                variant={"secondary"}
                size={"lg"}
                className="bg-mirage-400/30 group dark:bg-mirage-500/30 hover:bg-mirage-400/30 hover:dark:bg-mirage-500/30 h-[54px] shrink grow overflow-clip p-0 focus-visible:ring-0"
                onClick={async () => {
                  const themeMode = (await OBR.theme.getTheme()).mode;
                  OBR.popover.open({
                    id: getPluginId("hero-popover"),
                    height: 700,
                    width: 400,
                    anchorOrigin: { horizontal: "CENTER", vertical: "CENTER" },
                    transformOrigin: {
                      horizontal: "CENTER",
                      vertical: "CENTER",
                    },
                    url: `${getContextMenuUrl(themeMode)}&detailed=true`,
                  });
                }}
              >
                <div className="group-hover:bg-foreground/7 group-focus-visible:bg-foreground/7 grid size-full place-items-center transition-colors">
                  <ExternalLink />
                </div>
              </Button>
            )}
          </>
        )}
      </div>

      {token.type === "HERO" && detailed && heroicResourceSettingsOpen && (
        <div className="flex flex-col gap-2">
          <div>
            <Label name="Heroic Resource Name" />
            <Input>
              <FreeWheelInput
                value={token.heroicResourceName}
                onUpdate={(target) =>
                  updateToken({ heroicResourceName: target.value })
                }
              />
            </Input>
          </div>

          <div>
            <Label name="Heroic Resource at Start of Turn" />
            <ToggleGroup
              type="single"
              className="w-full"
              value={token.heroicResourceButton}
              onValueChange={(value) => {
                if (!["D3", "D3+1", "+2", "+3"].includes(value)) return;
                console.log(value);
                updateToken({
                  heroicResourceButton: value as "D3" | "D3+1" | "+2" | "+3",
                });
              }}
            >
              <ToggleGroupItem value="D3">
                <Dice3Icon />
              </ToggleGroupItem>
              <ToggleGroupItem value="D3+1">
                <div className="flex scale-90">
                  <Dice3Icon />
                  <div>+1</div>
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem value="+2">+2</ToggleGroupItem>
              <ToggleGroupItem value="+3">+3</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      )}
    </div>
  );
}
