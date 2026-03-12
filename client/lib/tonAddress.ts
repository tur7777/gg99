/**
 * Converts a raw TON address to friendly Base64 format
 * Handles addresses in format like "0:9546f1d1..." and converts to "UQ..." format
 */
export function toFriendlyAddress(address: string): string {
  if (!address) return "";

  try {
    // If already in friendly format (starts with UQ, EQ, etc), return as-is
    if (/^[A-Za-z0-9_-]{48}/.test(address)) {
      return address;
    }

    // Import dynamically to avoid bundling issues
    const { Address } = require("@ton/core");
    const parsed = Address.parse(address);
    return parsed.toString({ urlSafe: true, bounceable: true });
  } catch {
    // If parsing fails, return first and last parts of original address
    if (address.includes(":")) {
      const parts = address.split(":");
      return parts[0] + ":" + parts[1].slice(0, 6) + "..." + parts[1].slice(-6);
    }
    return address.slice(0, 10) + "..." + address.slice(-8);
  }
}

/**
 * Formats a TON address to friendly format with optional truncation
 * @param address Raw or friendly format address
 * @param truncate If true, returns first 12 chars + "..." + last 12 chars
 * @returns Formatted address
 */
export function formatAddress(address: string, truncate: boolean = true): string {
  const friendly = toFriendlyAddress(address);

  if (!truncate) {
    return friendly;
  }

  if (friendly.length <= 24) {
    return friendly;
  }

  return `${friendly.slice(0, 12)}...${friendly.slice(-12)}`;
}
