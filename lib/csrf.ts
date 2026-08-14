/** Framework-default double-submit cookie/header pair for browser POSTs. */
export const CSRF_COOKIE_NAME = "__Host-vf_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

/** Read one exact cookie name without treating cookie text as a regular expression. */
export function readBrowserCookie(cookieHeader: string, name: string): string | null {
  for (const entry of cookieHeader.split(";")) {
    const separator = entry.indexOf("=");
    if (separator < 0) continue;
    if (entry.slice(0, separator).trim() === name) {
      return entry.slice(separator + 1).trim();
    }
  }
  return null;
}

/**
 * Veryfront sets the CSRF cookie on production HTML responses. Development has
 * CSRF disabled by default, so an absent cookie correctly produces no header.
 */
export function csrfHeaders(
  cookieHeader = typeof document === "undefined" ? "" : document.cookie,
): Record<string, string> {
  const token = readBrowserCookie(cookieHeader, CSRF_COOKIE_NAME);
  return token ? { [CSRF_HEADER_NAME]: token } : {};
}
