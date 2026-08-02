import { createServerFn } from "@tanstack/react-start";
import {
  GITHUB_OWNER,
  GITHUB_REPO,
  LAB_LEVELS,
  isLabLevel,
  slugFromFileName,
  titleFromFileName,
  type Lab,
  type LabLevel,
} from "@/lib/labs";

type CacheEntry<T> = { at: number; value: T };
const TTL = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry<unknown>>();

function readCache<T>(key: string): T | undefined {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (!hit) return undefined;
  if (Date.now() - hit.at > TTL) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
}

function writeCache<T>(key: string, value: T) {
  cache.set(key, { at: Date.now(), value });
}

type GhEntry = { name: string; type: string; path: string; html_url: string };

async function ghList(folder: string): Promise<GhEntry[]> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(folder)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "teacher-netza-labs" },
  });
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as GhEntry[] | GhEntry;
  return Array.isArray(json) ? json : [];
}

export const listLabs = createServerFn({ method: "GET" }).handler(async () => {
  const cached = readCache<{ labs: Lab[]; error: string | null }>("labs");
  if (cached) return cached;

  try {
    const groups = await Promise.all(
      LAB_LEVELS.map(async (lvl) => {
        const entries = await ghList(lvl.folder);
        return entries
          .filter((e) => e.type === "file" && /\.html?$/i.test(e.name))
          .map<Lab>((e) => ({
            level: lvl.slug,
            slug: slugFromFileName(e.name),
            title: titleFromFileName(e.name),
            fileName: e.name,
            htmlUrl: e.html_url,
          }))
          .sort((a, b) => a.title.localeCompare(b.title, "es"));
      }),
    );
    const result = { labs: groups.flat(), error: null as string | null };
    writeCache("labs", result);
    return result;
  } catch (e) {
    console.error("listLabs failed", e);
    return { labs: [] as Lab[], error: "No pudimos cargar los labs desde GitHub." };
  }
});

export const getLabHtml = createServerFn({ method: "GET" })
  .inputValidator((data: { level: string; slug: string }) => {
    if (!isLabLevel(data.level)) throw new Error("Nivel inválido");
    if (!/^[a-z0-9-]+$/.test(data.slug)) throw new Error("Lab inválido");
    return data as { level: LabLevel; slug: string };
  })
  .handler(async ({ data }) => {
    const key = `html:${data.level}:${data.slug}`;
    const cached = readCache<{ title: string; html: string; sourceUrl: string } | null>(key);
    if (cached !== undefined) return cached;

    const lvl = LAB_LEVELS.find((l) => l.slug === data.level)!;
    const entries = await ghList(lvl.folder);
    const match = entries.find(
      (e) => e.type === "file" && /\.html?$/i.test(e.name) && slugFromFileName(e.name) === data.slug,
    );
    if (!match) {
      writeCache(key, null);
      return null;
    }
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/HEAD/${match.path
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
    const res = await fetch(rawUrl, { headers: { "User-Agent": "teacher-netza-labs" } });
    if (!res.ok) {
      writeCache(key, null);
      return null;
    }
    const value = {
      title: titleFromFileName(match.name),
      html: await res.text(),
      sourceUrl: match.html_url,
    };
    writeCache(key, value);
    return value;
  });
