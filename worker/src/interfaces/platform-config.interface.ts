/**
 * Configuration that varies between platforms.
 * Each platform (Cloudflare, Vercel, AWS) has different ways of:
 * - Accessing environment variables / secrets
 * - Handling HTTP requests and responses
 * - Logging and monitoring
 */
export interface PlatformConfig {
  /**
   * Get a secret value (like an API key) from the platform's secrets store.
   *
   * @param key - The name of the secret
   * @returns The secret value, or undefined if not found
   */
  getSecret(key: string): string | undefined;

  /**
   * Log a message (platforms have different logging systems)
   */
  log(message: string, level?: 'info' | 'warn' | 'error'): void;
}
