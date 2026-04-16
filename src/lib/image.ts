export const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBzwmnxsn94ZIDvFIG5UNKjamTF94T4cUNy_KZwEuI3L34Z3sAchuWNLyIopB0m2AjCPHIEfyCZsYKF4nFAQ_GaBVLmPtNcMpjCagbUXJXNk_wp--q4oV2aCMcUXO3FcFxVpWMkfxH5UFd0cxwUjI0INj-qX0_5xr3ayJ0c9V-4habZZKiZhn1_CJewx8g0vrjMI9QZSWaFpUnPPeH3TT2TQ86jRjGItt_REUsONsArwtGV5DKf4bH1MjLYDWbxhVDPmYfcqUsIaez7";

type MaybeImageValue =
  | string
  | null
  | undefined
  | { src?: unknown }
  | { asset?: { url?: unknown } };

export function resolveImageSrc(
  value: MaybeImageValue,
  fallback: string = FALLBACK_IMAGE,
): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) return trimmed;
  }

  if (value && typeof value === "object") {
    if ("src" in value && typeof value.src === "string") {
      const src = value.src.trim();
      if (src.length > 0) return src;
    }

    if (
      "asset" in value &&
      value.asset &&
      typeof value.asset === "object" &&
      "url" in value.asset &&
      typeof value.asset.url === "string"
    ) {
      const url = value.asset.url.trim();
      if (url.length > 0) return url;
    }
  }

  return fallback;
}

export function normalizeImageList(
  images: Array<string | null | undefined>,
  fallback?: string,
): string[] {
  const out = images
    .map((img) => resolveImageSrc(img, ""))
    .filter((img) => img.length > 0);

  if (out.length === 0 && fallback) return [fallback];
  return Array.from(new Set(out));
}
