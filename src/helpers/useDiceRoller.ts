import * as DiceProtocol from "../diceProtocol";
import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useEffectEvent, useState } from "react";
import type { DiceRoller } from "../types/diceRollerTypes";

function requestDiceRollerConfig() {
  OBR.broadcast.sendMessage(
    DiceProtocol.DICE_ROLLER_HELLO_CHANNEL,
    {},
    { destination: "LOCAL" },
  );
}

const getFallbackDiceRoller = (): DiceRoller => ({
  config: undefined,
  connect: requestDiceRollerConfig,
  disconnect: () => {},
  requestRoll: undefined,
  requestPowerRoll: undefined,
});

export function useDiceRoller({
  onRollResult,
  onPowerRollResult,
  onConnect,
  channel,
}: {
  onRollResult?: (rollResult: DiceProtocol.RollResult) => void;
  onPowerRollResult?: (rollResult: DiceProtocol.PowerRollResult) => void;
  onConnect?: (diceRoller: DiceRoller) => void;
  channel?: string;
}): DiceRoller {
  const rollResultHandler = useEffectEvent(
    onRollResult ? onRollResult : () => {},
  );
  const rollReplyChannel =
    channel === undefined
      ? DiceProtocol.ROLL_RESULT_CHANNEL
      : `${DiceProtocol.ROLL_RESULT_CHANNEL}/${channel}`;
  useEffect(
    () =>
      OBR.broadcast.onMessage(rollReplyChannel, (event) => {
        const data = event.data as DiceProtocol.RollResult;
        rollResultHandler(data);
      }),
    [],
  );

  const powerRollResultHandler = useEffectEvent(
    onPowerRollResult ? onPowerRollResult : () => {},
  );
  const powerRollReplyChannel =
    channel === undefined
      ? DiceProtocol.ROLL_RESULT_CHANNEL + "/powerRoll"
      : `${DiceProtocol.ROLL_RESULT_CHANNEL}/${channel}` + "/powerRoll";
  useEffect(
    () =>
      OBR.broadcast.onMessage(powerRollReplyChannel, (event) => {
        const data = event.data as DiceProtocol.PowerRollResult;
        powerRollResultHandler(data);
      }),
    [],
  );

  const [diceRoller, setDiceRoller] = useState<DiceRoller>(
    getFallbackDiceRoller(),
  );
  const connectHandler = useEffectEvent(onConnect ? onConnect : () => {});
  useEffect(() => {
    requestDiceRollerConfig(); // Automatically connect to dice roller on mount

    return OBR.broadcast.onMessage(
      DiceProtocol.DICE_CLIENT_HELLO_CHANNEL,
      (event) => {
        const data = event.data as DiceProtocol.DiceRollerConfig;
        ["D3", "D6", "D10"].forEach((value) => {
          if (!(data.dieTypes as string[]).includes(value)) {
            throw new Error(
              `Error ${value} is not supported by the requested dice roller.`,
            );
          }
        });

        const rollRequestChannel = data.rollRequestChannels.find((val) =>
          val.includes("rollRequest"),
        );
        if (rollRequestChannel === undefined) {
          throw new Error("Channel 'rollrequest' not found.");
        }

        const powerRollRequestChannel = data.rollRequestChannels.find((val) =>
          val.includes("powerRollRequest"),
        );
        if (powerRollRequestChannel === undefined) {
          throw new Error("Channel 'powerRollRequest' not found.");
        }

        const newDiceRoller: DiceRoller = {
          config: data,
          connect: requestDiceRollerConfig,
          disconnect: () => setDiceRoller(getFallbackDiceRoller()),
          requestRoll: (rollRequest) => {
            OBR.broadcast.sendMessage(
              rollRequestChannel,
              {
                ...rollRequest,
                replyChannel: rollReplyChannel,
              } satisfies DiceProtocol.RollRequest,
              {
                destination: "LOCAL",
              },
            );
          },
          requestPowerRoll: (rollRequest) => {
            OBR.broadcast.sendMessage(
              powerRollRequestChannel,
              {
                ...rollRequest,
                replyChannel: powerRollReplyChannel,
              } satisfies DiceProtocol.PowerRollRequest,
              {
                destination: "LOCAL",
              },
            );
          },
        };

        connectHandler(newDiceRoller);
        setDiceRoller(newDiceRoller);
      },
    );
  }, []);

  return diceRoller;
}
