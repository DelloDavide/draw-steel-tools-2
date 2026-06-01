import type { DrawSteelImage } from "../../types/DrawSteelZod";
import { ImageCarousel } from "../../components/logic/ImageCarousel";

export function Images({ images }: { images: DrawSteelImage[] }) {
  if (images.length === 0) return null;
  return <ImageCarousel images={images} />;
}
