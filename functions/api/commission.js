// Commission requests: POST stores one in D1, GET ?key=<LOGS_KEY> lists them.

const LIMITS = { name: 100, email: 200, type: 50, budget: 50, deadline: 100, details: 5000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot field is hidden from people; pretend success so bots move on.
  if (body.website) return json({ ok: true });

  const fields = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    fields[key] = String(body[key] ?? "").trim().slice(0, max);
  }

  if (!fields.name || !fields.type || !fields.details) {
    return json({ error: "Name, project type and details are required." }, 400);
  }
  if (!EMAIL_PATTERN.test(fields.email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  try {
    await env.DB.prepare(
      "INSERT INTO commissions (time, name, email, type, budget, deadline, details, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(
        new Date().toISOString(),
        fields.name,
        fields.email,
        fields.type,
        fields.budget || null,
        fields.deadline || null,
        fields.details,
        request.headers.get("cf-connecting-ip")
      )
      .run();
  } catch (err) {
    console.error("Failed to save commission", err);
    return json({ error: "Couldn't save your request." }, 500);
  }

  return json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (!env.LOGS_KEY || url.searchParams.get("key") !== env.LOGS_KEY) {
    return new Response("Not found", { status: 404 });
  }

  const { results } = await env.DB.prepare("SELECT * FROM commissions ORDER BY id DESC LIMIT 200").all();
  const text = results.length
    ? results
        .map((r) =>
          [
            `#${r.id}  ${r.time}`,
            `From:     ${r.name} <${r.email}>`,
            `Type:     ${r.type}`,
            `Budget:   ${r.budget || "-"}`,
            `Deadline: ${r.deadline || "-"}`,
            "",
            r.details,
          ].join("\n")
        )
        .join("\n\n" + "─".repeat(60) + "\n\n")
    : "(no commission requests yet)";

  return new Response(text + "\n", {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
