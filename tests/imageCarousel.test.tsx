import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageCarousel } from "../src/components/logic/ImageCarousel";

describe("image zoom dialog", () => {
  let container: HTMLDivElement;
  let root: Root;
  const originalShowModal = Object.getOwnPropertyDescriptor(
    HTMLDialogElement.prototype,
    "showModal",
  );
  const originalClose = Object.getOwnPropertyDescriptor(
    HTMLDialogElement.prototype,
    "close",
  );
  const close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    close.mockClear();
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.open = true;
      }),
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: close,
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root.render(
        <ImageCarousel
          images={[
            { src: "first.png", type: "image" },
            { src: "second.png", type: "image" },
          ]}
        />,
      );
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    if (originalShowModal) {
      Object.defineProperty(
        HTMLDialogElement.prototype,
        "showModal",
        originalShowModal,
      );
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
    }
    if (originalClose) {
      Object.defineProperty(
        HTMLDialogElement.prototype,
        "close",
        originalClose,
      );
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
    }
    vi.unstubAllGlobals();
  });

  async function openZoom() {
    const button = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Ingrandisci immagine"]',
    );
    if (!button) throw new Error("Missing zoom button");
    await act(async () => button.click());
    const dialog = container.querySelector("dialog");
    if (!dialog) throw new Error("Missing image dialog");
    expect(dialog.open).toBe(true);
    return dialog;
  }

  it("opens a modal and keeps arrow navigation and Escape working", async () => {
    const dialog = await openZoom();
    await act(async () => {
      globalThis.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight" }),
      );
    });
    expect(dialog.querySelector("img")?.getAttribute("src")).toBe("second.png");
    await act(async () => {
      globalThis.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(container.querySelector("dialog")).toBeNull();
    expect(close).toHaveBeenCalled();
  });

  it("closes on native dialog cancellation", async () => {
    const dialog = await openZoom();
    const cancel = new Event("cancel", { cancelable: true });
    await act(async () => {
      dialog.dispatchEvent(cancel);
    });
    expect(cancel.defaultPrevented).toBe(true);
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("closes on backdrop click", async () => {
    const dialog = await openZoom();
    const backdrop = dialog.querySelector<HTMLButtonElement>(
      'button[aria-label="Chiudi sfondo"]',
    );
    if (!backdrop) throw new Error("Missing dialog backdrop");
    await act(async () => backdrop.click());
    expect(container.querySelector("dialog")).toBeNull();
  });
});
