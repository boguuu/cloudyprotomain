import { getSongDetailsFromGenius } from "@/util/geniusClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { title, artist } = req.query;
  if (!title || !artist) {
    return res.status(400).json({ error: "Missing title or artist" });
  }
  try {
    const data = await getSongDetailsFromGenius(title, artist);
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error("genius-test error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Internal error" });
  }
}
