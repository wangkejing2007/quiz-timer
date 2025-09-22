import crypto from "node:crypto";

const SECRET = process.env.TIMER_SECRET || "dev_secret";

function verify(token) {
  const [data, sig] = String(token || "").split(".");
  const exp = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (sig !== exp) throw new Error("bad signature");
  return JSON.parse(Buffer.from(data, "base64url").toString());
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { token } = req.body || {};
    const payload = verify(token);
    const answered_at = new Date().toISOString();
    const total_ms = Math.max(0, new Date(answered_at) - new Date(payload.started_at));
    res.status(200).json({
      question_id: payload.question_id,
      started_at: payload.started_at,
      answered_at,
      total_ms
    });
  } catch {
    res.status(400).json({ error: "invalid token" });
  }
}
