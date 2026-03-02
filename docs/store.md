---
title: Draw Steel Tools
description: Health bars, resource tracking, power roll automation, minion group management, and stat blocks for Draw Steel!
author: Seamus Finlayson
image: https://raw.githubusercontent.com/SeamusFinlayson/draw-steel-tools-2/refs/heads/main/docs/header.webp
icon: https://draw-steel-tools.seamus-finlayson.ca/logo.svg
tags:
  - combat
manifest: https://draw-steel-tools.seamus-finlayson.ca/manifest.json
learn-more: https://seamus-finlayson.ca/pages/draw-steel-tools
---

# Draw Steel Tools

_Health bars, resource tracking, power roll automation, minion group management, and stat blocks for Draw Steel!_

## How it Works

Draw Steel Tools lets you easily manage combat in draw steel with on-token trackers, health bars, name tags, and a power roll utility.

### Managing Tokens

There are two options for adding character information to a token. You can initialize it as a hero or a monster. Heroes' tokens track stamina, their heroic resource, surges, and recoveries. Monster tokens are simplified and only track stamina.

![Add Character](https://raw.githubusercontent.com/SeamusFinlayson/draw-steel-tools-2/refs/heads/main/docs/addCharacter.webp)

Once you have created your hero or monster you will be able to edit their stats in the context menu, which has a few convenient features that may not be immediately obvious.

![Context Menu](https://raw.githubusercontent.com/SeamusFinlayson/draw-steel-tools-2/refs/heads/main/docs/contextMenu.webp)

**Inline math** lets you add and subtract damage and other resources in the text box. You can bypass inline math by typing "=" before the number you want to enter, which is useful when dealing with negative numbers. You can use inline math in any box in the context menu, as well as the malice and hero tokens boxes in the action menu.

There are a few variations that you can try typing into the tracker text fields:

- "7" will set the trackers value to 7
- "+7" will add 7 to the current tracker value
- "=+7" will set the trackers value to 7
- "-7" will subtract 7 from the current tracker value
- "=-7" will set the trackers value to -7

**The cracked heart** that appears in the temporary stamina text field when the temporary stamina value is negative will apply the negative value to your stamina when you click on it. When you take damage you can use inline math to apply the entirety of the damage to your temporary stamina and apply any overflow to your regular stamina by quickly clicking this button.

**The pulsing heart** in the recoveries text field will expend a recovery when you click on it and automatically add your recovery value to your stamina.

To save some time you can hover over the stamina label to check your winded value, and you can hover over the recoveries label to check your recovery value.

The visibility toggle at the bottom determines whether a tokens stats are shared or only visible to the director. By default, when you add a hero to a token its stats are shared with your players. When you add a monster to a token the, stats are kept secret from your players. You can change the visibility by clicking on the toggle. Health bars for tokens with hidden stats appear slightly darker.

You can click the remove character button to delete all the character information and stats on a token.

### Action Menu

In the top left corner you'll find the action menu with trackers for shared resources (malice and hero tokens) and the power roll utility. Hero tokens are visible to anyone in your game so they can update the tracker whenever they use them. Malice is only visible to users with GM access.

The power roll utility lets you make power rolls accounting for edges and any bonuses you add to the roll. You can upgrade this functionality by getting the Connected Dice extension which converts the power rolls made in this extension into physics based rolls and shares them with everyone in your room.

![Action Menu](https://raw.githubusercontent.com/SeamusFinlayson/draw-steel-tools-2/refs/heads/main/docs/actionMenu.webp)

### Settings

You can open the extension setting menu by clicking on the three-dots icon in the action menu and clicking on settings item in the dropdown. This is separate from your Owlbear Rodeo settings. I recommend enabling name tags, and turning on Show Health Bars and setting Segments to two to display when creatures with hidden stats are winded.

I intend to remove scene level settings overrides from the extension soon so you should avoid relying on these.

### Uninstalling

Refresh your page after uninstalling the extension to clear health bars and stat bubbles from the scene. Token data will **not** be deleted by uninstalling.

## Feature Requests

I may accept feature requests but - as I have limited time and development plans of my own - being a paid member on [Patreon](https://www.patreon.com/SeamusFinlayson) is your best path to getting a feature implemented.

## Support

If you need support for this extension you can message me in the Owlbear Rodeo Discord @Seamus or open an issue on [GitHub](https://github.com/SeamusFinlayson/Bubbles-for-Owkbear-Rodeo).

If you like using this extension consider [supporting me on Patreon](https://www.patreon.com/SeamusFinlayson) where paid members can request features. You can also follow along there as a free member for updates.
