// Cookie utility functions for refresh token management
// Using new 'rt' cookie name with backward compatibility

export const REFRESH_TOKEN_COOKIE_NAME = "rt";
export const LEGACY_REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));

  if (cookie) {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      return parts.slice(1).join("="); // Handle tokens that might contain '=' characters
    }
  }

  return null;
};

/**
 * Set a cookie
 */
export const setCookie = (
  name: string,
  value: string,
  options: {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  } = {}
): void => {
  let cookieString = `${name}=${value}`;

  if (options.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += "; secure";
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
};

/**
 * Delete a cookie
 */
export const deleteCookie = (
  name: string,
  options: {
    path?: string;
    domain?: string;
  } = {}
): void => {
  const deleteOptions = {
    expires: new Date(0), // Set to past date to delete
    ...options,
  };
  setCookie(name, "", deleteOptions);
};

/**
 * Get refresh token with backward compatibility
 * First tries the new 'rt' cookie name, then falls back to 'refreshToken'
 */
export const getRefreshToken = (): string | null => {
  // Try new cookie name first
  const newToken = getCookie(REFRESH_TOKEN_COOKIE_NAME);
  if (newToken) {
    return newToken;
  }

  // Fallback to legacy cookie name
  const legacyToken = getCookie(LEGACY_REFRESH_TOKEN_COOKIE_NAME);

  return legacyToken;
};

/**
 * Set refresh token using new cookie name
 */
export const setRefreshToken = (
  token: string,
  options: {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  } = {}
): void => {
  setCookie(REFRESH_TOKEN_COOKIE_NAME, token, options);
};

/**
 * Delete refresh token (both new and legacy names)
 */
export const deleteRefreshToken = (
  options: {
    path?: string;
    domain?: string;
  } = {}
): void => {
  deleteCookie(REFRESH_TOKEN_COOKIE_NAME, options);
  deleteCookie(LEGACY_REFRESH_TOKEN_COOKIE_NAME, options);
};

/**
 * Check if refresh token exists (either new or legacy)
 */
export const hasRefreshToken = (): boolean => {
  return getRefreshToken() !== null;
};

/**
 * Get which cookie name was found (for debugging)
 */
export const getRefreshTokenCookieName = (): string | null => {
  if (getCookie(REFRESH_TOKEN_COOKIE_NAME)) {
    return REFRESH_TOKEN_COOKIE_NAME;
  }
  if (getCookie(LEGACY_REFRESH_TOKEN_COOKIE_NAME)) {
    return LEGACY_REFRESH_TOKEN_COOKIE_NAME;
  }
  return null;
};
