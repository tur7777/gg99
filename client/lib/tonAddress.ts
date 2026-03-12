import { Address } from "@ton/core";

/**
 * Converts a raw TON address to friendly Base64 format
 * @param address Raw address (e.g., "0:9546f1d1...") or friendly format
 * @returns Friendly format address (e.g., "UQ...") or original if parsing fails
 */
export function toFriendlyAddress(address: string): string {
  try {
    const parsed = Address.parse(address);
    return parsed.toString({ urlSafe: true, bounceable: true });
  } catch {
    return address;
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
