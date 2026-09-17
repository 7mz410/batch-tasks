export type Shared = { name: string; tasks: { title: string; done: boolean }[] };

export function encodeShare(data: Shared) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShare(d: string): Shared | null {
  try {
    const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(d.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))));
    if (typeof data?.name !== "string" || !Array.isArray(data.tasks)) return null;
    return {
      name: data.name,
      tasks: data.tasks
        .filter((t: { title?: unknown }) => typeof t?.title === "string")
        .map((t: { title: string; done?: unknown }) => ({ title: t.title, done: t.done === true })),
    };
  } catch {
    return null;
  }
}
