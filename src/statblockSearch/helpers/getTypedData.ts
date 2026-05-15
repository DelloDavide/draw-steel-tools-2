export default async function fetchTypedData<T>(
  url: string,
  parser: (data: unknown) => T,
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  const githubFile = await response.json();

  // GitHub API restituisce content base64
  const decodedContent = JSON.parse(
    decodeURIComponent(
      escape(atob(githubFile.content))
    )
  );

  return parser(decodedContent);
}