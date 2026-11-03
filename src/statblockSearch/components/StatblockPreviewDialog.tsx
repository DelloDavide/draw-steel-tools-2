import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import Button from "../../components/ui/Button";
import type { AppState } from "../helpers/AppState";

export function StatblockPreviewDialog({
  appState,
  setAppState,
}: {
  appState: AppState;
  setAppState: (appState: AppState) => void;
}) {
  return (
    <Dialog open={appState.monsterViewerOpen}>
      <DialogTitle className="max-h-0 overflow-clip">
        Statblock Viewer
      </DialogTitle>
      <DialogDescription className="max-h-0 overflow-clip">
        View of the selected statblock
      </DialogDescription>
      <DialogContent
        className="bg-mirage-50 h-10/12 w-lg p-0"
        onPointerDownOutside={() =>
          setAppState({ ...appState, monsterViewerOpen: false })
        }
        onEscapeKeyDown={() =>
          setAppState({ ...appState, monsterViewerOpen: false })
        }
        onInteractOutside={() =>
          setAppState({ ...appState, monsterViewerOpen: false })
        }
      >
        <div className="bg-mirage-50 flex h-full flex-col">
          {appState.previewIndexBundle ? (
            <iframe
              className="w-full grow"
              src={(() => {
                const url = new URL("/statblockViewer", window.location.origin);
                url.searchParams.set(
                  "statblockName",
                  appState.previewIndexBundle.name,
                );
                return url.toString();
              })()}
            />
          ) : (
            <div className="grid grow place-items-center p-4 text-black/20">
              {"Loading..."}
            </div>
          )}
          <div className="border-mirage-300 flex gap-4 border-t px-4 py-2 sm:px-6 sm:py-3">
            <Button
              className="w-full bg-[#9966ff] text-[#f5f2ff] hover:bg-[#9966ff]/90"
              onClick={() =>
                setAppState({ ...appState, monsterViewerOpen: false })
              }
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
