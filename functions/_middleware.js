// Pages middleware: logs page views to D1 and serves them at /_logs.txt?key=<LOGS_KEY>.

const LOG_LIMIT = 1000;
const SITE_HOST = "gabrielosborn.com";
const DAY_MS = 24 * 60 * 60 * 1000;

// Times are stored in UTC and shown in Eastern Time.
const TIME_ZONE = "America/New_York";

const rowTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const headerTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

const BOT_PATTERN =
  /bot|crawl|spider|slurp|scan|curl|wget|python|go-http|java\/|okhttp|axios|node-fetch|headless|httpx|zgrab|palo alto|censys|facebookexternalhit|preview/i;

export async function onRequest({ request, env, next, waitUntil }) {
  const url = new URL(request.url);

  if (url.pathname === "/_logs.txt") {
    return serveLogs(url, env);
  }

  const response = await next();

  // Only log page loads, not every image/script/stylesheet request.
  // Missing files like /favicon.ico fall back to index.html, so also skip
  // any path with a file extension other than .html.
  const type = response.headers.get("content-type") || "";
  const isPagePath = !/\.[a-z0-9]+$/i.test(url.pathname) || url.pathname.endsWith(".html");
  if (request.method === "GET" && type.includes("text/html") && isPagePath) {
    waitUntil(logVisit(request, url, env));
  }

  return response;
}

async function logVisit(request, url, env) {
  const cf = request.cf || {};
  try {
    await env.DB.prepare(
      "INSERT INTO visits (time, ip, country, city, path, referrer, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(
        new Date().toISOString(),
        request.headers.get("cf-connecting-ip"),
        cf.country || null,
        cf.city || null,
        url.pathname + url.search,
        request.headers.get("referer"),
        request.headers.get("user-agent")
      )
      .run();
  } catch (err) {
    console.error("Failed to log visit", err);
  }
}

async function serveLogs(url, env) {
  if (!env.LOGS_KEY || url.searchParams.get("key") !== env.LOGS_KEY) {
    return new Response("Not found", { status: 404 });
  }

  const [{ results: rows }, totals] = await Promise.all([
    env.DB.prepare("SELECT * FROM visits ORDER BY id DESC LIMIT ?").bind(LOG_LIMIT).all(),
    env.DB.prepare("SELECT COUNT(*) AS total, COUNT(DISTINCT ip) AS unique_ips FROM visits").first(),
  ]);

  const visits = rows.map(describeVisit);
  const people = visits.filter((v) => !v.isBot);
  const now = Date.now();
  const since = (ms) => visits.filter((v) => now - v.date.getTime() < ms);
  const last24h = since(DAY_MS);
  const last7d = since(7 * DAY_MS);
  const countPeople = (list) => list.filter((v) => !v.isBot).length;

  const lines = [
    rule("═"),
    `  ${SITE_HOST.toUpperCase()} · TRAFFIC REPORT`,
    `  Updated ${headerTimeFormat.format(new Date())}`,
    rule("═"),
    "",
    "SUMMARY",
    rule("─"),
    statLine("Page views (all time)", totals.total),
    statLine("Unique visitors (IPs)", totals.unique_ips),
    statLine("Last 24 hours", last24h.length, `${countPeople(last24h)} people, ${last24h.length - countPeople(last24h)} bots`),
    statLine("Last 7 days", last7d.length, `${countPeople(last7d)} people, ${last7d.length - countPeople(last7d)} bots`),
    "",
    ...topList("TOP PAGES", people, (v) => v.page),
    ...topList("TOP LOCATIONS", people, (v) => v.location),
    ...topList("TOP REFERRERS", people, (v) => v.from),
    ...topList("TOP DEVICES", people, (v) => v.device),
    `(Top lists count people only, from the latest ${visits.length} visits.)`,
    "",
    `RECENT VISITS · newest first · times in ${shortZoneName()}`,
    rule("─"),
    table(
      ["TIME", "WHO", "LOCATION", "DEVICE", "PAGE", "FROM", "IP ADDRESS"],
      [17, 6, 22, 22, 16, 18, 0],
      visits.map((v) => [
        rowTimeFormat.format(v.date),
        v.isBot ? "bot" : "person",
        v.location,
        v.device,
        v.page,
        v.from,
        v.ip,
      ])
    ),
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function describeVisit(row) {
  const ua = row.user_agent || "";
  return {
    date: new Date(row.time),
    ip: row.ip || "-",
    isBot: !ua || BOT_PATTERN.test(ua),
    location: [row.city, row.country].filter(Boolean).join(", ") || "Unknown",
    device: describeDevice(ua),
    page: row.path || "/",
    from: describeReferrer(row.referrer),
  };
}

function describeDevice(ua) {
  if (!ua) return "Unknown";
  if (BOT_PATTERN.test(ua)) {
    const name = ua.match(/([A-Za-z-]*(?:bot|crawler|spider))/i);
    return name ? name[1] : ua.split(/[\/\s;(]/)[0] || "Bot";
  }

  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /SamsungBrowser/.test(ua) ? "Samsung" :
    /Firefox\/|FxiOS/.test(ua) ? "Firefox" :
    /Chrome\/|CriOS/.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" :
    "Other";

  const os =
    /iPhone/.test(ua) ? "iPhone" :
    /iPad/.test(ua) ? "iPad" :
    /Android/.test(ua) ? "Android" :
    /CrOS/.test(ua) ? "ChromeOS" :
    /Windows/.test(ua) ? "Windows" :
    /Macintosh|Mac OS X/.test(ua) ? "Mac" :
    /Linux/.test(ua) ? "Linux" :
    "Other";

  return `${browser} · ${os}`;
}

function describeReferrer(referrer) {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host === SITE_HOST ? "(this site)" : host;
  } catch {
    return referrer;
  }
}

function shortZoneName() {
  const parts = headerTimeFormat.formatToParts(new Date());
  return parts.find((p) => p.type === "timeZoneName")?.value || TIME_ZONE;
}

function rule(char) {
  return char.repeat(78);
}

function statLine(label, value, note) {
  const line = `  ${label.padEnd(24)}${String(value ?? 0).padStart(6)}`;
  return note ? `${line}   (${note})` : line;
}

function topList(title, visits, keyOf, limit = 5) {
  const counts = new Map();
  for (const v of visits) {
    const key = keyOf(v);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, limit);
  return [
    title,
    rule("─"),
    ...(top.length
      ? top.map(([key, count]) => `  ${String(count).padStart(5)}  ${key}`)
      : ["  (none yet)"]),
    "",
  ];
}

// Fixed-width columns; a width of 0 means "don't pad or truncate".
function table(headers, widths, rows) {
  const fit = (text, width) => {
    const s = String(text);
    if (!width) return s;
    return s.length > width ? s.slice(0, width - 1) + "…" : s.padEnd(width);
  };
  const format = (cells) => cells.map((c, i) => fit(c, widths[i])).join("  ").trimEnd();
  return [format(headers), ...rows.map(format)].join("\n");
}
