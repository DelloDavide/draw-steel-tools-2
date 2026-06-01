const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

export default function getImageUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/hero-images/${path}`;
}