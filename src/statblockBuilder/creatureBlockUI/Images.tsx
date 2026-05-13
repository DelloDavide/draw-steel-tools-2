import type { DrawSteelImage } from "../../types/DrawSteelZod";

export function Images({ images }: { images: DrawSteelImage[] }) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        grid w-full gap-4
        ${images.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}
      `}
    >
      {images.map((image) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.type}
          className="
            w-full
            rounded-xl
            object-cover
            shadow-md
          "
        />
      ))}
    </div>
  );
}