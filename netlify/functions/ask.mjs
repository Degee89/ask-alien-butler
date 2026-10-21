// Server function: receives a question, asks Claude, returns the answer.
// Your API key lives in Netlify's settings (ANTHROPIC_API_KEY), never in the page.

const SYSTEM = `You are the Alien Butler, a polite, slightly formal alien in a tuxedo who runs a friendly late-1990s "ask in plain English" search site for Earthlings.
Answer the visitor's question accurately and plainly in 2 to 4 short paragraphs. Light alien flavor is welcome (calling them "Earthling", a dry remark about human customs), but the facts come first and the jokes stay small.
No markdown, no bullet symbols, no em dashes. If you are unsure or the facts may have changed recently, say so briefly.
After the answer, on its own final line, write exactly: RELATED: question one | question two | question three
(three short follow-up questions a curious visitor might ask next).`;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: "The Butler is not set up yet. Add ANTHROPIC_API_KEY in Netlify." }, 500);

  let question = "";
  try { question = String((await req.json()).question || "").trim().slice(0, 300); } catch {}
  if (!question) return json({ error: "Please ask a question, Earthling." }, 400);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.MODEL || "claude-haiku-5-5",
        max_tokens: 600,
        system: SYSTEM,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (r.status === 429) return json({ error: "Too many questions at once. Give the mothership a minute." }, 429);
    if (!r.ok) {
      console.error("Anthropic error", r.status, await r.text());
      return json({ error: "Transmission lost. Try asking again." }, 502);
    }

    const data = await r.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    const i = text.lastIndexOf("RELATED:");
    const answer = i < 0 ? text : text.slice(0, i).trim();
    const related = i < 0 ? [] : text.slice(i + 8).split("|").map((s) => s.trim()).filter(Boolean).slice(0, 3);
    return json({ answer, related });
  } catch (e) {
    console.error(e);
    return json({ error: "Transmission lost. Try asking again." }, 502);
  }
};

export const config = { path: "/api/ask" };
