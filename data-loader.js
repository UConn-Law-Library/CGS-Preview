const DATA_RELEASE_ID = "81e4c350151a22f427f40f9a7b1971a43e9e6e9060767a12e47158bd288b920f";

// A tab keeps its generation even if a newer service worker takes control.
export function dataUrl(path) {
  if (DATA_RELEASE_ID.startsWith("__")) return path;
  const url = new URL(path, globalThis.location?.href ?? "http://localhost/");
  url.searchParams.set("release", DATA_RELEASE_ID);
  return url;
}

// Share successful requests, but never retain a rejected request across retries.
export function retryableLoader(load) {
  let pending;
  return () => pending ??= Promise.resolve().then(load).catch((error) => {
    pending = undefined;
    throw error;
  });
}

export async function getJson(path) {
  const response = await fetch(dataUrl(path), { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`);
  return response.json();
}
