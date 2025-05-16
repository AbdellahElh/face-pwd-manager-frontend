// src/utils/securityUtils.ts
/**
 * Redirects to HTTPS if the current connection is using HTTP in production
 * This helps ensure secure connections for sensitive operations
 */
export const enforceHttps = (): void => {
  // Only redirect in production environment and when using HTTP
  if (
    window.location.protocol === "http:" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    !window.location.hostname.includes(".local")
  ) {
    window.location.href = window.location.href.replace("http:", "https:");
  }
};

/**
 * Check if the current connection is secure (using HTTPS)
 * @returns boolean indicating if the connection is secure
 */
export const isSecureConnection = (): boolean => {
  return (
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes(".local")
  );
};
