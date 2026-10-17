import type { Log } from "./types";
export function makeLogs(seedLogs: Log[], seed = 2026): Log[] {
  let x = seed >>> 0;
  const rand = () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 4294967296;
  };
  const paths = [
    "/",
    "/products/42",
    "/products/81",
    "/cart",
    "/api/login",
    "/health",
    "/robots.txt",
    "/admin/login",
    "/api/orders/1002",
  ];
  const normal: Log[] = [];
  for (let i = 0; i < 200; i++) {
    const internal = i % 17 === 0;
    normal.push({
      time: Math.floor(rand() * 600),
      ip: internal
        ? "10.0.2." + (10 + Math.floor(rand() * 20))
        : "192.0.2." + (1 + Math.floor(rand() * 200)),
      method: i % 9 === 0 ? "POST" : "GET",
      path: paths[Math.floor(rand() * paths.length)],
      status: 200,
      bytes: 180 + Math.floor(rand() * 1800),
      ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0",
      suspicious: false,
      stage: 0,
      owasp: "",
      attack: "",
    });
  }
  return [...normal, ...seedLogs].sort((a, b) => a.time - b.time);
}
export const formatLog = (log: Log) => {
  const d = new Date(Date.UTC(2026, 10, 1, 3, 0, 0) + log.time * 1000);
  const stamp = d
    .toLocaleString("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");
  return `${log.ip} - - [${stamp} +0900] "${log.method} ${log.path} HTTP/1.1" ${log.status} ${log.bytes} "-" "${log.ua}"`;
};
