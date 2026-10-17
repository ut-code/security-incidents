import type { GameState, Log, Flag } from "./types";

type Response = { output: string; state: GameState; advance?: boolean };
const target = "shop.komaba-market.example";
const mklog = (
  state: GameState,
  stage: number,
  path: string,
  status: number,
  method = "GET",
  bytes = 412,
): Log => ({
  time: state.clock + 1,
  ip: "203.0.113.45",
  method,
  path,
  status,
  bytes,
  ua: "curl/7.88.1",
  suspicious: true,
  stage,
  owasp: ["", "A02", "A07", "A01", "A02 / A07", "A01"][stage],
  attack: ["", "T1595 / T1552.001", "T1078", "T1190", "T1078.001", "T1567"][stage],
});
const has = (s: GameState, f: Flag) => s.flags[f];
export function runCommand(input: string, source: GameState): Response {
  const state = structuredClone(source);
  const line = input.trim();
  const [cmd, ...parts] = line.split(/\s+/);
  if (!line) return { output: "", state };
  const fail = (out: string, path: string, status: number, stage = state.stage): Response => {
    state.logs.push(mklog(state, stage, path, status));
    state.clock += 1;
    return { output: out, state };
  };
  if (cmd === "help")
    return {
      state,
      output:
        '利用可能なコマンド:\n  nmap -sV <host>\n  curl [-X POST] [-H "Content-Type: application/json"] [-d \'{...}\'] <url>\n  for id in {1001..1050}; do curl -H "Authorization: Bearer <token>" "<url>/$id"; done\n  rm -f /var/log/nginx/access.log\n  clear\n  hint\n\n応答は固定シナリオです。実際の通信は発生しません。',
    };
  if (cmd === "hint") {
    state.hintCount++;
    const hints = [
      "まずホストを調べ、公開されている設定ファイルを確認しよう。",
      "見つけたスタッフの認証情報をログインAPIへJSONでPOSTしよう。",
      "ログイン後、注文APIのIDを変えるとどうなる？",
      "robots.txtに管理画面の手がかりがあるかも。",
      "管理者になれたら顧客データのエクスポートを試そう。",
    ];
    return { state, output: `ヒント: ${hints[Math.min(4, state.stage - 1)]}` };
  }
  if (cmd === "rm" && line === "rm -f /var/log/nginx/access.log")
    return fail(
      "rm: cannot remove '/var/log/nginx/access.log': Permission denied; logs are forwarded to a remote collector",
      "/admin/logs",
      403,
    );
  if (cmd === "nmap") {
    const host = parts.at(-1);
    if (host !== target) return fail(`Failed to resolve "${host ?? ""}".`, "/scan", 404, 1);
    state.logs.push(mklog(state, 1, "/", 200));
    state.clock += 3;
    return {
      state,
      output: `Starting Nmap 7.94 ( https://nmap.org ) at 03:11:50\nNmap scan report for ${target} (198.51.100.10)\nHost is up (0.012s latency).\nPORT    STATE SERVICE  VERSION\n22/tcp  open  ssh      OpenSSH 8.9\n80/tcp  open  http     nginx 1.18.0\n443/tcp open  ssl/http nginx 1.18.0\nService detection performed.`,
    };
  }
  if (
    /^for id in \{1001\.\.1050\}; do curl -H "Authorization: Bearer demo_tok_4f2a" "https:\/\/shop\.komaba-market\.example\/api\/orders\/\$id"; done$/.test(
      line,
    ) &&
    has(state, "hasToken")
  ) {
    state.flags.idorFound = true;
    state.stage = Math.max(state.stage, 4);
    for (let i = 0; i < 50; i++)
      state.logs.push({
        ...mklog(state, 3, `/api/orders/${1001 + i}`, 200),
        time: state.clock + i * 0.06,
        bytes: 156,
      });
    state.clock += 3.1;
    return { state, output: "50 records retrieved in 3.1s" };
  }
  if (cmd === "curl") {
    const url = parts.filter((part) => /^https?:\/\//.test(part)).at(-1) ?? parts.at(-1) ?? "";
    let path = url.replace(/^https?:\/\/[^/]+/, "");
    if (!path.startsWith("/")) path = "/" + path;
    if (url && !url.includes(target)) return fail("curl: (6) Could not resolve host", path, 404);
    if (path === "/.env") {
      state.flags.hasEnv = true;
      state.stage = Math.max(state.stage, 2);
      state.logs.push(mklog(state, 1, path, 200));
      state.clock += 2;
      return {
        state,
        output:
          "APP_ENV=production\nDB_HOST=10.0.2.15\nSTAFF_ACCOUNT=staff-old@komaba-market.example\nSTAFF_PASSWORD=Komaba2023!",
      };
    }
    if (path === "/robots.txt") {
      state.logs.push(mklog(state, 4, path, 200));
      state.clock += 1;
      return { state, output: "User-agent: *\nDisallow: /admin/login\nDisallow: /admin/export/" };
    }
    if (path === "/api/login" || path === "/admin/login") {
      const data = line.match(/(?:^|\s)-d\s+'([^']*)'/)?.[1];
      let body: Record<string, unknown> = {};
      try {
        body = data ? (JSON.parse(data) as Record<string, unknown>) : {};
      } catch {
        body = {};
      }
      if (path === "/api/login") {
        if (
          body.email === "staff-old@komaba-market.example" &&
          body.password === "Komaba2023!" &&
          has(state, "hasEnv")
        ) {
          state.flags.hasToken = true;
          state.stage = Math.max(state.stage, 3);
          state.logs.push(mklog(state, 2, path, 200, "POST", 128));
          state.clock += 5;
          return { state, output: '{"token":"demo_tok_4f2a","role":"user"}' };
        }
        return fail("HTTP/1.1 401 Unauthorized", path, 401, 2);
      }
      if (body.username === "admin" && body.password === "admin123" && has(state, "idorFound")) {
        state.flags.hasAdmin = true;
        state.stage = Math.max(state.stage, 5);
        state.logs.push(mklog(state, 4, path, 200, "POST", 128));
        state.clock += 5;
        return { state, output: '{"session":"demo_adm_9c1e","role":"admin"}' };
      }
      return fail("HTTP/1.1 403 Forbidden", path, 403, 4);
    }
    if (path === "/") {
      state.logs.push(mklog(state, 1, path, 200, "GET", 2841));
      state.clock += 1;
      return {
        state,
        output:
          'HTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\n\n<!doctype html>\n<html lang="ja">\n<head><meta charset="utf-8"><title>駒場マーケット｜毎日の暮らしを、ちょっと便利に</title></head>\n<body>\n  <header><h1>駒場マーケット</h1><nav>ホーム　商品一覧　カート　ログイン</nav></header>\n  <main><h2>毎日の暮らしを、ちょっと便利に。</h2><p>日用品から食品まで、地域のお客様にお届けします。</p><section><h3>おすすめ商品</h3><ul><li>オーガニックコーヒー　¥1,200</li><li>帆布トートバッグ　¥2,400</li><li>季節の焼き菓子セット　¥1,800</li></ul></section></main>\n  <footer>© 2026 駒場マーケット</footer>\n</body>\n</html>',
      };
    }
    if (path.startsWith("/api/orders/")) {
      if (!has(state, "hasToken")) return fail("HTTP/1.1 401 Unauthorized", path, 401, 3);
      if (path.endsWith("/1002")) {
        state.logs.push(mklog(state, 3, path, 200));
        state.clock += 1;
        return { state, output: '{"order_id":1002,"customer":"(架空)佐藤 花子","total":4800}' };
      }
      return fail("HTTP/1.1 403 Forbidden", path, 403, 3);
    }
    if (path === "/admin/export/customers.csv") {
      if (!has(state, "hasAdmin")) return fail("HTTP/1.1 403 Forbidden", path, 403, 5);
      state.flags.exported = true;
      state.stage = 5;
      state.logs.push(mklog(state, 5, path, 200, "GET", 782144));
      state.clock += 10;
      return { state, output: "customers.csv saved (12,480 records)" };
    }
    return fail("HTTP/1.1 404 Not Found", path, 404);
  }
  if (cmd === "clear") return { state, output: "" };
  return { state, output: `command not found: ${cmd}` };
}
