/**
 * External URL Validator — SSRF Protection Utility
 * Blocks loopback, link-local, cloud metadata, and RFC1918 private network addresses.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
  'metadata',
  'instance-data',
]);

function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  const octets = parts.map((p) => Number(p));
  if (octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return false;
  }

  const [a, b] = octets;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;
  // 10.0.0.0/8 (Private network)
  if (a === 10) return true;
  // 100.64.0.0/10 (Shared address space / CGNAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (Link-local / Cloud metadata 169.254.169.254)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (Private network)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (Private network)
  if (a === 192 && b === 168) return true;
  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

function isPrivateOrReservedIPv6(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (normalized === '::1' || normalized === '::' || normalized === '0:0:0:0:0:0:0:1') {
    return true;
  }
  // IPv4-mapped IPv6 addresses ::ffff:x.x.x.x
  if (normalized.startsWith('::ffff:')) {
    const ipv4Part = normalized.slice('::ffff:'.length);
    if (isPrivateOrReservedIPv4(ipv4Part)) return true;
  }
  // Unique local (fc00::/7) and Link-local (fe80::/10)
  if (
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return true;
  }
  return false;
}

export function validateExternalUrl(rawUrl: string): URL {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('Invalid URL: URL is required.');
  }

  const trimmed = rawUrl.trim();
  const normalizedInput = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(normalizedInput);
  } catch {
    throw new Error('Invalid URL format.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Invalid URL protocol: Only http and https are allowed.');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Invalid URL: Embedded credentials are not allowed.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) {
    throw new Error('Invalid URL: Missing hostname.');
  }

  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost')
  ) {
    throw new Error('Restricted URL: Internal or loopback hostnames are not permitted.');
  }

  // Check IPv4 literal (including decimal/octal/hex numeric hostnames)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    if (isPrivateOrReservedIPv4(hostname)) {
      throw new Error('Restricted URL: Private, loopback, or metadata IPv4 addresses are not permitted.');
    }
  } else if (/^\d+$/.test(hostname) || /^0x[0-9a-f]+$/i.test(hostname)) {
    throw new Error('Restricted URL: Numeric IP encodings are not permitted.');
  }

  // Check IPv6 literal
  if (hostname.includes(':') || hostname.startsWith('[')) {
    if (isPrivateOrReservedIPv6(hostname)) {
      throw new Error('Restricted URL: Private or loopback IPv6 addresses are not permitted.');
    }
  }

  if (!hostname.includes('.')) {
    throw new Error('Restricted URL: Must be a valid public domain name.');
  }

  return parsed;
}
