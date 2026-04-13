import {
  BugIcon,
  FileQuestionIcon,
  HistoryIcon,
  MenuIcon,
  NotebookTextIcon,
  Settings2,
  TagIcon,
  XIcon,
} from "lucide-react";
import Button from "../../components/ui/Button";
import ConnectedDiceIcon from "../../components/icons/ConnectedDiceIcon";
import LinkButton from "./LinkButton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scrollArea";
import PatreonIcon from "../../components/icons/PatreonIcon";
import { cn } from "../../helpers/utils";
import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../../helpers/getPluginId";
import usePlayerRole from "../../helpers/usePlayerRole";
import { useState } from "react";
import PartyContinuityIcon from "../../components/icons/PartyContinuityIcon";

export default function SideBarMenu() {
  const playerRole = usePlayerRole();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open}>
      <SheetTrigger asChild>
        <Button size={"icon"} variant={"ghost"} onClick={() => setOpen(true)}>
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent
        onEscapeKeyDown={() => setOpen(false)}
        onPointerDownOutside={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
        showCloseButton={false}
        className="text-text-primary dark:text-text-primary-dark gap-0"
      >
        <SheetHeader className="flex items-center p-0 px-4">
          <div className="flex h-14 w-full items-center justify-between">
            <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
            <SheetClose asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => setOpen(false)}
              >
                <XIcon />
              </Button>
            </SheetClose>
          </div>
          <SheetDescription className="hidden">Extension menu</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-full">
          <div className="mb-2 grid items-center">
            {playerRole === "GM" && (
              <>
                <Button
                  variant={"ghost"}
                  className="h-10 w-full items-center justify-start gap-4 rounded-none px-4 active:rounded-none"
                  onClick={async () => {
                    const themeMode = (await OBR.theme.getTheme()).mode;

                    OBR.popover.open({
                      id: getPluginId("settings"),
                      url: `/settings?themeMode=${themeMode}`,
                      height: 590,
                      width: 500,
                      hidePaper: false,
                    });
                    setOpen(false);
                  }}
                >
                  <div className="grid size-6 place-items-center">
                    <Settings2 />
                  </div>
                  <div>Settings</div>
                </Button>
                <Button
                  variant={"ghost"}
                  className="h-10 w-full items-center justify-start gap-4 rounded-none px-4 active:rounded-none"
                  onClick={async () => {
                    OBR.broadcast.sendMessage(
                      getPluginId("set-viewer-statblock"),
                      {},
                      { destination: "LOCAL" },
                    );
                    OBR.popover.open({
                      id: getPluginId("statblockViewer"),
                      url: (() => {
                        const url = new URL(
                          "/statblockViewer",
                          window.location.origin,
                        );
                        return url.toString();
                      })(),
                      height: 2000,
                      width: 500,
                      anchorOrigin: {
                        horizontal: "RIGHT",
                        vertical: "BOTTOM",
                      },
                      transformOrigin: {
                        horizontal: "CENTER",
                        vertical: "CENTER",
                      },
                      disableClickAway: true,
                    });
                    setOpen(false);
                  }}
                >
                  <div className="grid size-6 place-items-center">
                    <NotebookTextIcon />
                  </div>
                  <div>Stat Block Viewer</div>
                </Button>
              </>
            )}
            <div
              className={cn("text-foreground-secondary mb-1 px-4 text-sm", {
                "mt-4": playerRole === "GM",
              })}
            >
              Recommended
            </div>
            <LinkButton
              name="Connected Dice"
              icon={<ConnectedDiceIcon />}
              href={"https://seamus-finlayson.ca/pages/connected-dice"}
            />
            <LinkButton
              name="Party Continuity"
              icon={<PartyContinuityIcon />}
              href={
                "https://www.patreon.com/posts/new-extension-146279272?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=postshare_creator&utm_content=join_link"
              }
            />
            <LinkButton
              name="Token Labels"
              icon={<TagIcon />}
              href={"https://seamus-finlayson.ca/pages/token-labels"}
            />
            <div
              className={cn("text-foreground-secondary mb-1 px-4 text-sm", {
                "mt-4": true,
              })}
            >
              Links
            </div>
            <LinkButton
              name="Patreon"
              icon={<PatreonIcon className="size-[19px]" />}
              href={"https://www.patreon.com/SeamusFinlayson"}
            />
            <LinkButton
              name="Change Log"
              icon={<HistoryIcon />}
              href={"https://www.patreon.com/collection/1364023?view=expanded"}
            />
            <LinkButton
              name="Instructions"
              icon={<FileQuestionIcon />}
              href={"https://seamus-finlayson.ca/pages/draw-steel-tools"}
            />
            <LinkButton
              name="Report Bug"
              icon={<BugIcon />}
              href="https://discord.gg/WMp9bky4be"
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
