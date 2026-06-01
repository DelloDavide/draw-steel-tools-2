import { supabase } from "../../supabaseClient";

const typedDataCache = new Map<string, Promise<unknown>>();

export function setTypedDataCache(path: string, content: unknown) {
  typedDataCache.set(path, Promise.resolve(content));
}

export function invalidateTypedDataCache(path: string) {
  typedDataCache.delete(path);
}

export default async function fetchTypedData<T>(
  path: string,
  parser: (data: unknown) => T,
): Promise<T> {
  const cachedContent = typedDataCache.get(path);

  if (cachedContent) {
    return parser(await cachedContent);
  }

  const contentPromise = Promise.resolve(
    supabase
      .from("bestiary_documents")
      .select("content")
      .eq("path", path)
      .single(),
  ).then(({ data, error }) => {
    if (error) {
      typedDataCache.delete(path);
      throw new Error(`Supabase fetch error for "${path}": ${error.message}`);
    }

    return data.content;
  });
  typedDataCache.set(path, contentPromise);

  return parser(await contentPromise);
}
