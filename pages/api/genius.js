import * as cheerio from "cheerio";

// 가사 스크레이핑 함수 (서버에서만 동작)
async function scrapeLyrics(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    let lyrics = "";
    $('div[data-lyrics-container="true"]').each((i, elem) => {
      const verse = $(elem)
        .html()
        .replace(/<br\s*\/?>/g, "\n");
      lyrics += $(`<div>${verse}</div>`).text().trim() + "\n\n";
    });
    return lyrics.trim();
  } catch (error) {
    console.error("Scraping failed:", error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { title, artist } = req.query;
  if (!title || !artist) {
    return res
      .status(400)
      .json({ ok: false, error: "Missing title or artist" });
  }

  const token =
    "D6cc_5Xgz-Pn3SowcJOS98GdjSpqTQnFm4GRMzjFSwbKKoArxh-V4rsZ1ns1uydw";
  if (!token) {
    return res
      .status(500)
      .json({ ok: false, error: "Missing GENIUS_ACCESS_TOKEN" });
  }

  try {
    const q = encodeURIComponent(`${title} ${artist}`);
    const resp = await fetch(`https://api.genius.com/search?q=${q}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await resp.json();

    // 필요한 필드만 추려서 반환
    const hit = json?.response?.hits?.[0]?.result;
    const data = hit
      ? {
          id: hit.id,
          fullTitle: hit.full_title,
          songTitle: hit.title,
          artistName: hit.primary_artist?.name,
          url: hit.url,
          albumArt:
            hit.song_art_image_url ||
            hit.header_image_url ||
            hit.song_art_image_thumbnail_url,
        }
      : null;

    // 2. 가사 스크레이핑
    const lyrics = await scrapeLyrics(hit.url);

    // 3. 필요한 정보만 모아서 클라이언트에 전달
    const result = {
      title: hit.title,
      artist: hit.primary_artist.name,
      albumArt: hit.song_art_image_url,
      lyrics: lyrics,
    };

    return res.status(200).json({ ok: true, data: result });
  } catch (e) {
    console.error("Genius API error:", e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
