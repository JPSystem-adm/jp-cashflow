// src/lib/subdomain.ts

// export function getSubdomainFromHost(host: string): string | null {
//   if (!host) return null;

//   const hostOnly = host.split(":")[0];
//   const parts = hostOnly.split(".");
//   const isLocalhost = hostOnly.includes("localhost");

//   // Ex: jp.localhost
//   if (isLocalhost && parts.length === 2) return parts[0];

//   // Ex: jp-cashflow.app ou jp.jpcashflow.vercel.app
//   if (!isLocalhost && parts.length >= 3) return parts[0];

//   return null;
// }
