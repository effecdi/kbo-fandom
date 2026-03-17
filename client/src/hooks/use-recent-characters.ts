import { useState, useEffect, useCallback } from "react";

export interface RecentCharacter {
  id: string;
  name: string;
  imageUrl: string;
  usedAt: number; // timestamp
}

const STORAGE_KEY = "olli_recent_characters";
const MAX_ITEMS = 12;

// Data URIs are too large for localStorage — skip them
function isDataUri(url: string): boolean {
  return url.startsWith("data:");
}

// Migration keys from old per-mode storage
const OLD_KEYS = ["olli_instatoon_refchars", "olli_autowebtoon_chars"];

function loadFromStorage(): RecentCharacter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed
      .filter(
        (c: any) => c && typeof c.id === "string" && typeof c.imageUrl === "string" && !isDataUri(c.imageUrl)
      )
      .sort((a: RecentCharacter, b: RecentCharacter) => b.usedAt - a.usedAt)
      .slice(0, MAX_ITEMS);
    // If we filtered out data URIs, re-save the cleaned list
    if (cleaned.length < parsed.length) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned)); } catch { /* ignore */ }
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveToStorage(chars: RecentCharacter[]) {
  if (chars.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  let items = chars.slice(0, MAX_ITEMS);
  while (items.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return;
    } catch {
      // QuotaExceededError — drop the oldest entry and retry
      items = items.slice(0, -1);
    }
  }
  // Nothing fits — just remove the key
  localStorage.removeItem(STORAGE_KEY);
}

/** Migrate old per-mode localStorage keys into unified recent characters. Run once on mount. */
function migrateOldKeys(): RecentCharacter[] {
  const migrated: RecentCharacter[] = [];
  const now = Date.now();

  for (const key of OLD_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;

      for (const item of parsed) {
        // olli_instatoon_refchars: { url, name }
        // olli_autowebtoon_chars: { id, name, imageUrl }
        const imageUrl = item.imageUrl || item.url;
        if (!imageUrl) continue;
        const id = item.id || imageUrl.slice(-16);
        const name = item.name || "";

        // Skip duplicates
        if (migrated.some((m) => m.imageUrl === imageUrl)) continue;

        migrated.push({ id, name, imageUrl, usedAt: now });
      }

      // Remove old key after migration
      localStorage.removeItem(key);
    } catch {
      // ignore parse errors
    }
  }

  return migrated;
}

export function useRecentCharacters() {
  const [recentChars, setRecentChars] = useState<RecentCharacter[]>(() => {
    // On first load, migrate old keys if unified store is empty
    let chars = loadFromStorage();
    if (chars.length === 0) {
      const migrated = migrateOldKeys();
      if (migrated.length > 0) {
        chars = migrated.sort((a, b) => b.usedAt - a.usedAt).slice(0, MAX_ITEMS);
        saveToStorage(chars);
      }
    }
    return chars;
  });

  // Sync to localStorage whenever recentChars changes
  useEffect(() => {
    saveToStorage(recentChars);
  }, [recentChars]);

  const addRecentCharacter = useCallback(
    (char: { id: string; name: string; imageUrl: string }) => {
      // Never store data URIs — they blow up localStorage quota
      if (isDataUri(char.imageUrl)) return;
      setRecentChars((prev) => {
        const now = Date.now();
        const existing = prev.findIndex((c) => c.id === char.id || c.imageUrl === char.imageUrl);
        let updated: RecentCharacter[];
        if (existing >= 0) {
          // Update timestamp and name
          updated = prev.map((c, i) =>
            i === existing ? { ...c, name: char.name || c.name, usedAt: now } : c
          );
        } else {
          updated = [{ ...char, usedAt: now }, ...prev];
        }
        return updated.sort((a, b) => b.usedAt - a.usedAt).slice(0, MAX_ITEMS);
      });
    },
    []
  );

  return { recentChars, addRecentCharacter } as const;
}
