const DEFAULT_PRODUCT_URL = "https://wearetheartmakers.github.io/modCrossChain/";
const DEFAULT_BRAND_NAME = "modCrossChain";
const DEFAULT_TAGLINE = "Non-custodial cross-chain bridge";
const DEFAULT_HEADLINE = "Route capital across six networks without leaving the wallet.";
const DEFAULT_SUBHEAD =
  "Live LI.FI quotes, wallet-native execution, visible fees, and faster route selection for real transfer flow.";
const DEFAULT_ACCENT = "#ba9eff";
const DEFAULT_SECONDARY = "#64f1ff";

export const BRAND_NAME = sanitizeText(process.env.NEXT_PUBLIC_BRAND_NAME, DEFAULT_BRAND_NAME, 48);
export const BRAND_TAGLINE = sanitizeText(process.env.NEXT_PUBLIC_BRAND_TAGLINE, DEFAULT_TAGLINE, 96);
export const BRAND_HEADLINE = sanitizeText(process.env.NEXT_PUBLIC_BRAND_HEADLINE, DEFAULT_HEADLINE, 120);
export const BRAND_SUBHEAD = sanitizeText(process.env.NEXT_PUBLIC_BRAND_SUBHEAD, DEFAULT_SUBHEAD, 180);
export const BRAND_LOGO_SRC = sanitizePath(process.env.NEXT_PUBLIC_BRAND_LOGO_SRC) || "/brand/modcrosschain-wordmark.svg";
export const BRAND_MARK_SRC = sanitizePath(process.env.NEXT_PUBLIC_BRAND_MARK_SRC) || "/brand/modcrosschain-mark.svg";
export const BRAND_PRODUCT_URL = sanitizeUrl(process.env.NEXT_PUBLIC_PRODUCT_URL) || DEFAULT_PRODUCT_URL;
export const BRAND_SUPPORT_URL = sanitizeUrl(process.env.NEXT_PUBLIC_SUPPORT_URL) || BRAND_PRODUCT_URL;
export const BRAND_ACCENT = sanitizeHex(process.env.NEXT_PUBLIC_BRAND_ACCENT) || DEFAULT_ACCENT;
export const BRAND_SECONDARY = sanitizeHex(process.env.NEXT_PUBLIC_BRAND_SECONDARY) || DEFAULT_SECONDARY;
export const BRAND_ACCENT_RGB = hexToRgbString(BRAND_ACCENT);
export const BRAND_SECONDARY_RGB = hexToRgbString(BRAND_SECONDARY);
export const BRAND_ICON_URL = new URL(BRAND_MARK_SRC.replace(/^\//, ""), ensureTrailingSlash(BRAND_PRODUCT_URL)).toString();

function sanitizeText(value: string | undefined, fallback: string, maxLength: number) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.replace(/\s+/g, " ").slice(0, maxLength);
}

function sanitizePath(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || !trimmed.startsWith("/")) {
    return undefined;
  }

  return trimmed;
}

function sanitizeUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

function sanitizeHex(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return undefined;
  }

  return normalized.toLowerCase();
}

function hexToRgbString(hex: string) {
  const normalized = hex.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `${red} ${green} ${blue}`;
}
