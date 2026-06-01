# Broadcast Protocols

The plugin uses the Owlbear Rodeo Broadcast API to send messages between players.
Protocol definitions live in `src/protocols/`.

## Dice Protocol (`diceProtocol.ts`)

Handles dice roll requests and results broadcast between the action menu and the statblock viewer.

### Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `DICE_ROLLER_CONFIG_CHANNEL` | GM → all | Share dice roller configuration (theme, enabled state) |
| `ROLL_REQUEST_CHANNEL` | Any → all | Request a power roll or basic roll |
| `ROLL_RESULT_CHANNEL` | Roller → all | Broadcast the result of a completed roll |

### Key Types

- **`DiceRollerConfig`** — Configuration for the dice roller UI
- **`RollRequest`** / **`PowerRollRequest`** — A request to roll dice, including edges/banes
- **`RollResult`** / **`PowerRollResult`** — The outcome of a dice roll with tier information

## Round Protocol (`broadcastRoundProtocol.ts`)

Manages combat round synchronisation across all connected clients.

### Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `ROUND_CHANGE_EVENT_CHANNEL` | GM → all | Notify that the round number changed |
| `SET_ROUND_CHANNEL` | Any → GM | Request the GM to set the round number |

### Key Types

- **`RoundChangeEvent`** — Contains the new round number
- **`SetRoundMessage`** — Request payload with desired round number
