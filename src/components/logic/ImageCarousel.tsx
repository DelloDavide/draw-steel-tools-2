import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Maximize2Icon,
  XIcon,
} from "lucide-react";
import type { DrawSteelImage } from "../../types/DrawSteelZod";

export function ImageCarousel({
  images,
}: Readonly<{ images: DrawSteelImage[] }>) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const total = images.length;

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total],
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Escape" && zoomed) {
        e.preventDefault();
        setZoomed(false);
        return;
      }
      if (total > 1 && e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (total > 1 && e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (
        !zoomed &&
        (e.key === "+" || e.key === "z" || e.key === "Z")
      ) {
        e.preventDefault();
        setZoomed(true);
      }
    }
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [prev, next, total, zoomed]);

  if (total === 0) return null;

  const current = images[Math.min(index, total - 1)];

  const arrowBtn =
    "absolute top-1/2 -translate-y-1/2 z-10 grid place-items-center " +
    "size-9 rounded-full bg-black/60 text-white shadow-lg ring-1 ring-white/30 " +
    "hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white " +
    "disabled:cursor-not-allowed disabled:bg-black/30 disabled:text-white/50 disabled:hover:bg-black/30";

  return (
    <>
      <section
        className="flex w-full flex-col items-center gap-2"
        aria-roledescription="carousel"
        aria-label="Immagini"
      >
        {/* Wrapper inline-block così le icone seguono il bordo reale dell'immagine */}
        <div className="relative inline-block max-w-full">
          <img
            key={current.src}
            src={current.src}
            alt={current.type}
            className="block h-auto max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-md"
          />

          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="Ingrandisci immagine"
            title="Ingrandisci (Z)"
            className="
              absolute right-2 top-2 z-10 grid place-items-center
              size-9 rounded-full bg-black/60 text-white shadow-lg ring-1 ring-white/30
              hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white
            "
          >
            <Maximize2Icon className="size-4" />
          </button>

          <button
            type="button"
            onClick={prev}
            disabled={total <= 1}
            aria-label="Immagine precedente"
            title="Precedente (\u2190)"
            className={`${arrowBtn} left-2`}
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={total <= 1}
            aria-label="Immagine successiva"
            title="Successiva (\u2192)"
            className={`${arrowBtn} right-2`}
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>

        {total > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-70" aria-live="polite">
              {index + 1} / {total}
            </span>
            <div className="flex gap-1.5">
              {images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Vai all'immagine ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`size-2.5 rounded-full transition-colors ${
                    i === index
                      ? "bg-foreground"
                      : "bg-foreground/30 hover:bg-foreground/60"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Immagine ingrandita"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            aria-label="Chiudi sfondo"
            onClick={() => setZoomed(false)}
            className="absolute inset-0 cursor-zoom-out bg-transparent"
          />

          <img
            src={current.src}
            alt={current.type}
            className="relative z-10 max-h-full max-w-full object-contain"
          />

          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Chiudi"
            title="Chiudi (Esc)"
            className="
              absolute right-4 top-4 z-20 grid place-items-center
              size-10 rounded-full bg-white/10 text-white ring-1 ring-white/30
              hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white
            "
          >
            <XIcon className="size-5" />
          </button>

          <button
            type="button"
            disabled={total <= 1}
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Immagine precedente"
            className={`${arrowBtn} left-4 z-20`}
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <button
            type="button"
            disabled={total <= 1}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Immagine successiva"
            className={`${arrowBtn} right-4 z-20`}
          >
            <ChevronRightIcon className="size-6" />
          </button>

          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {index + 1} / {total}
            </div>
          )}
        </div>
      )}
    </>
  );
}
