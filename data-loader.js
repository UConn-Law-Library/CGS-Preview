const DATA_RELEASE_ID = "0e1966587090718b6dd5e4effbb2c579e1957c2655c0021b999cc114ad8d05d3";

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
