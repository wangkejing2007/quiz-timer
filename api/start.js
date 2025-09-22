import crypto from "node:crypto";

const SECRET = process.env.TIMER_SECRET || "dev_secret";

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { question_id, user_id } = req.body || {};
  if (!question_id || !user_id) return res.status(400).json({ error: "missing fields" });

  const started_at = new Date().toISOString();
  const token = sign({ question_id, user_id, started_at });

  res.status(200).json({ token, started_at });
}
