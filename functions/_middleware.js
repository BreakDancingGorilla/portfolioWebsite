// Pages middleware: logs page views to D1 and serves them at /_logs.txt?key=<LOGS_KEY>.

const LOG_LIMIT = 1000;

// Times are stored in UTC and shown in Eastern Time.
const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
});

const formatTime = (iso) => timeFormat.format(new Date(iso));

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

  const [{ results: visits }, totals] = await Promise.all([
    env.DB.prepare("SELECT * FROM visits ORDER BY id DESC LIMIT ?").bind(LOG_LIMIT).all(),
    env.DB.prepare(
      `SELECT COUNT(*) AS total,
              COUNT(DISTINCT ip) AS unique_ips,
              SUM(time >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day')) AS last_day
       FROM visits`
    ).first(),
  ]);

  const lines = [
    "gabrielosborn.com traffic log",
    `Generated: ${formatTime(new Date().toISOString())}`,
    `Total page views: ${totals.total}  |  Unique IPs: ${totals.unique_ips}  |  Last 24h: ${totals.last_day || 0}`,
    `Showing the latest ${visits.length} visits (newest first)`,
    "",
    ...visits.map((v) =>
      [
        formatTime(v.time),
        v.ip || "-",
        [v.city, v.country].filter(Boolean).join(", ") || "-",
        v.path,
        `ref: ${v.referrer || "-"}`,
        v.user_agent || "-",
      ].join(" | ")
    ),
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
