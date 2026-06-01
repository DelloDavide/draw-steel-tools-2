import { supabase } from "../../supabaseClient";

export default async function fetchTypedData<T>(
  path: string,
  parser: (data: unknown) => T,
): Promise<T> {
  const { data, error } = await supabase
    .from("bestiary_documents")
    .select("content")
    .eq("path", path)
    .single();

  if (error) {
    throw new Error(`Supabase fetch error for "${path}": ${error.message}`);
  }

  return parser(data.content);
}