// Destination for the broadcast API should always be set to "LOCAL"

/*

  Use this protocol to make roll shortcuts in other extensions.

  # Setup

  The dice extension will send its config on channel "general.diceClient.hello" when it starts. The config will have the format of the DiceRollerConfig type.The dice client can request the config be sent again by sending an empty message on channel "general.diceRoller.hello"

  # Roll request

  The client can request a dice roll by sending a roll request using the RollRequest type formatting to the channel specified in the dice roller config. If a roll is currently in progress the request will be rejected and an error logged in the console.

  # Roll result

  The result is sent to the channel that the roll request specified. It might also get sent to a general dice result channel in the future so a general roll log extensions can be made. The result will have the format of the Roll Result type.
*/

// Channels

/** Channel used for contacting the dice roller. */
export const DICE_ROLLER_HELLO_CHANNEL = "general.diceRoller.hello";
/** Channel used for contacting the dice client. */
export const DICE_CLIENT_HELLO_CHANNEL = "general.diceClient.hello";

// Note: Change these two values if you are implementing this protocol in another extension. Comment out the values if you are not using them. The dice extension does not define the result channel and the dice client does not define the roll request channel, so you should only need one of these channels.

/** Channel where this extension receives roll requests. */
// export const ROLL_REQUEST_CHANNEL = "rodeo.owlbear.rollRequest";
/** Channel where this extension receives roll results. */
export const ROLL_RESULT_CHANNEL = "drawSteelTools.rollResult";

// General types

export type DieStyle = {
  /** Code used when requesting the style in a roll request. */
  id: string;
  /** HTML color code that is approximately the color of the die. */
  color: string; //
};

export type DieType =
  | "D3"
  | "D4"
  | "D6"
  | "D8"
  | "D10"
  | "D12"
  | "D20"
  | "D100";

export type Die = {
  /** The ID associated with this die's result. */
  id: string;
  /** The style this die uses. If no style is provided the style given in the roll request is used. */
  styleId?: string;
  type: DieType;
};

export type DieResult = {
  id: string;
  result: number;
};

// Message formats

/** Where to send roll requests and what features are supported by this extension.
 * - These values may be subject to change or expanded expanded upon.
 * - Receiving this message indicates that the dice extension is available in the current room so it can be used for setup.
 * - Die types and styles are provided so the dice client extension can provide these options to its users.
 */
export type DiceRollerConfig = {
  /** Channel to request rolls from this specific extension. */
  rollRequestChannels: string[];
  dieTypes: DieType[];
  styles: DieStyle[];
};

/** Properties shared between roll requests that extend this type. */
export interface RollRequestBase {
  /** ID of this request. Recommended format `myExtension-${Date.now()}` */
  id: string;
  /** Channel where the dice client can receive the roll result. */
  replyChannel: string;
  /** Prevent rolls from being shown to users without GM access. */
  gmOnly: boolean;
  /** The style for all dice. This can overridden by setting the styleId for a specific die. If no style is given the default will be used. */
  styleId?: string;
}

/** Format for messages requesting a dice roll. */
export interface RollRequest extends RollRequestBase {
  /** The method of calculating the final value. */
  combination?: "HIGHEST" | "LOWEST" | "SUM" | "NONE";
  /** A value added to the roll result. */
  bonus?: number;
  /** Dice to be rolled. */
  dice: Die[];
}

/** Format for messages sent when a roll has been completed. */
export type RollResult = {
  /** ID of the request that initiated this roll. */
  id: string;
  /** Access requirement given in the request that initiated this roll. */
  gmOnly: boolean;
  result: DieResult[];
};

/** Protocol for Draw Steel Power Rolls with additional handling. */
export interface PowerRollProperties {
  /** A value added to the roll result. */
  bonus: number;
  /** If true an additional bonus of +2 is added to the roll. */
  hasSkill: boolean;
  /** Edges - Banes. */
  netEdges: number;
  /** Number of d10s and selection strategy in dice notation. */
  dice: "2d10" | "3d10kh2" | "3d10kl2";
}

/** Format for messages requesting a power roll. */
export interface PowerRollRequest extends RollRequestBase {
  rollProperties: PowerRollProperties;
}

/** Format for messages sent when a power roll has been completed. */
export type PowerRollResult = {
  /** ID of the request that initiated this roll. */
  id: string;
  /** Access requirement given in the request that initiated this roll. */
  gmOnly: boolean;
  result: DieResult[];
  rollProperties: PowerRollProperties;
};
