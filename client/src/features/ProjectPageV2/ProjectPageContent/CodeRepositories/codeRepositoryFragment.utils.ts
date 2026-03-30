import { safeNewUrl } from "../../../../utils/helpers/safeNewUrl.utils";

export const CODE_REPOSITORY_FRAGMENT_PREFIX = "code-repository-";
const CODE_REPOSITORY_URL_HASH_HEX_LENGTH = 64;

const codeRepositoryUrlHashRegex = new RegExp(
  `^[0-9a-fA-F]{${CODE_REPOSITORY_URL_HASH_HEX_LENGTH}}$`
);

/** Normalize repository URL before hashing. */
export function normalizeRepositoryUrlForHash(repositoryUrl: string): string {
  let decoded = repositoryUrl.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {}
  decoded = decoded.trim();
  decoded = decoded.toLowerCase();
  return decoded.replace(/(?:\.git|\/)$/i, "");
}

function hexFromDigest(digest: ArrayBuffer): string {
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fallbackDeterministicHashHex64(input: string): string {
  const fnv1a64 = (str: string) => {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;

    const bytes = new TextEncoder().encode(str);
    for (const byte of bytes) {
      hash ^= BigInt(byte);
      hash = (hash * prime) & 0xffffffffffffffffn;
    }
    return hash.toString(16).padStart(16, "0");
  };

  return [
    fnv1a64(`${input}|1`),
    fnv1a64(`${input}|2`),
    fnv1a64(`${input}|3`),
    fnv1a64(`${input}|4`),
  ].join("");
}

async function sha256Hex(message: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle?.digest) {
    const data = new TextEncoder().encode(message);
    const digest = await subtle.digest("SHA-256", data);
    return hexFromDigest(digest);
  }

  return fallbackDeterministicHashHex64(message);
}

const urlHashCache = new Map<string, Promise<string>>();

/** Hash repository URL to deterministic URL-safe hex. */
export async function getCodeRepositoryUrlHash(
  repositoryUrl: string
): Promise<string> {
  const normalized = normalizeRepositoryUrlForHash(repositoryUrl);

  const cached = urlHashCache.get(normalized);
  if (cached) return cached;

  const promise = sha256Hex(normalized);
  urlHashCache.set(normalized, promise);
  return promise;
}

export function buildCodeRepositoryFragment(urlHash: string): string {
  return `${CODE_REPOSITORY_FRAGMENT_PREFIX}${urlHash}`;
}

export function parseCodeRepositoryFragment(
  fragmentHash: string
): { urlHash: string } | null {
  if (!fragmentHash.startsWith(CODE_REPOSITORY_FRAGMENT_PREFIX)) return null;
  const urlHash = fragmentHash.slice(CODE_REPOSITORY_FRAGMENT_PREFIX.length);
  if (!codeRepositoryUrlHashRegex.test(urlHash)) return null;
  return { urlHash: urlHash.toLowerCase() };
}

/** Resolve fragment hash back to a repository URL. */
export async function resolveRepositoryUrlFromCodeRepositoryHash(
  fragmentHash: string,
  repositoryUrls: string[]
): Promise<string | null> {
  const parsed = parseCodeRepositoryFragment(fragmentHash);
  if (!parsed) return null;

  const matches: string[] = [];
  for (const repositoryUrl of repositoryUrls) {
    const computedHash = await getCodeRepositoryUrlHash(repositoryUrl);
    if (computedHash === parsed.urlHash) {
      matches.push(repositoryUrl);
      if (matches.length === 1) break;
    }
  }

  return matches.length > 0 ? matches[0] : null;
}

/** Optional best-effort canonical URL helper for display. */
export function getCanonicalRepositoryUrlForDisplay(repositoryUrl: string) {
  const canonical = normalizeRepositoryUrlForHash(repositoryUrl);
  return safeNewUrl(canonical)?.toString?.() ?? canonical;
}
