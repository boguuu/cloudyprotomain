import * as cheerio from "cheerio";

const stripBrackets = (s = "") =>
  String(s)
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\([^)]*\)/g, "");
const normalizeSpaces = (s = "") =>
  String(s)
    .replace(/\s{2,}/g, " ")
    .trim();
const sanitizeTitle = (raw = "") => {
  let t = stripBrackets(raw);
  t = t.replace(
    /\b(official|music\s*video|mv|lyric(s)?|audio|teaser|trailer|live|performance|ver\.?|version)\b/gi,
    ""
  );
  t = t.replace(/\b(feat|ft)\.?.*$/i, "");
  return normalizeSpaces(t);
};
const sanitizeArtist = (raw = "") => {
  let a = stripBrackets(raw);
  a = a.replace(/\s*-\s*topic\b/gi, "");
  a = a.replace(/\b(vevo|official)\b/gi, "");
  return normalizeSpaces(a);
};
const normalizeVideoId = (id) =>
  String(id || "")
    .trim()
    .split("?")[0]
    .replace(/[^0-9A-Za-z_-]/g, "");

async function fetchOEmbed(videoId) {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const j = await res.json();
  return {
    title: String(j.title || "").trim(),
    artist: sanitizeArtist(j.author_name || ""),
  };
}

// Genius API에서 가사를 스크래핑하는 fetchGenius 함수
async function fetchGenius(title, artist, token) {
  if (!title || !artist) return null;
  const q = encodeURIComponent(`${title} ${artist}`);
  const resp = await fetch(`https://api.genius.com/search?q=${q}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!resp.ok) {
    console.error(
      `Genius search failed for "${title} by ${artist}": ${resp.status} ${resp.statusText}`
    );
    return null;
  }
  const json = await resp.json();
  const hit = json?.response?.hits?.[0]?.result;
  if (!hit) {
    console.warn(`No Genius search result found for "${title} by ${artist}"`);
    return null;
  }

  let lyrics = null;
  // Genius 곡 페이지 URL이 있다면 가사를 스크래핑
  if (hit.url) {
    try {
      const lyricsPageResponse = await fetch(hit.url, { cache: "no-store" });
      if (lyricsPageResponse.ok) {
        const html = await lyricsPageResponse.text();
        const $ = cheerio.load(html);

        // Genius 웹사이트의 가사 영역을 찾아 스크래핑
        const lyricsContainer = $('div[data-lyrics-container="true"]');
        if (lyricsContainer.length > 0) {
          lyrics = lyricsContainer
            .html()
            .replace(/<br\s*\/?>/gi, "\n") // <br> 태그를 줄바꿈으로 변경
            .replace(/<[^>]*>/g, "") // 모든 HTML 태그 제거
            .trim();
        } else {
          // 다른 가능한 셀렉터 시도 (예: 레거시 버전)
          const legacyLyricsContainer = $(".lyrics");
          if (legacyLyricsContainer.length > 0) {
            lyrics = legacyLyricsContainer
              .html()
              .replace(/<br\s*\/?>/gi, "\n")
              .replace(/<[^>]*>/g, "")
              .trim();
          } else {
            console.warn(
              `Lyrics container not found on Genius page for ${hit.url}`
            );
          }
        }
      } else {
        console.warn(
          `Failed to fetch lyrics page for ${hit.url}: ${lyricsPageResponse.status} ${lyricsPageResponse.statusText}`
        );
      }
    } catch (e) {
      console.error(`Error scraping lyrics from ${hit.url}:`, e);
      lyrics = null;
    }
  }

  return {
    songTitle: hit.title || null,
    artistName: hit.primary_artist?.name || null,
    albumArt:
      hit.song_art_image_url ||
      hit.song_art_image_thumbnail_url ||
      hit.header_image_url ||
      null,
    id: hit.id || null,
    url: hit.url || null, // Genius 곡 페이지 URL
    lyrics: lyrics, // 스크래핑한 가사 데이터
  };
}

export default async function handler(req, res) {
  try {
    const token = process.env.GENIUS_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Missing GENIUS_ACCESS_TOKEN" });
    }

    // ids 수집(GET 쿼리 또는 POST 바디 모두 지원)
    let ids = [];
    if (req.method === "GET") {
      const raw = req.query.ids || "";
      ids = String(raw).split(",").map(normalizeVideoId).filter(Boolean);
    } else if (req.method === "POST") {
      const bodyIds = Array.isArray(req.body?.ids) ? req.body.ids : [];
      ids = bodyIds.map(normalizeVideoId).filter(Boolean);
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    if (ids.length === 0) return res.status(200).json({});

    // 중복 제거
    const uniqueIds = Array.from(new Set(ids));

    // 1) oEmbed 병렬 조회(빠름)
    const oembedSettled = await Promise.allSettled(
      uniqueIds.map((id) => fetchOEmbed(id))
    );
    const youtubeById = {};
    uniqueIds.forEach((id, i) => {
      const r = oembedSettled[i];
      if (r.status === "fulfilled" && r.value) youtubeById[id] = r.value;
    });

    // 2) Genius는 레이트 리밋 고려해 순차 조회
    const out = {};
    for (const id of uniqueIds) {
      const yt = youtubeById[id] || null;
      const title = sanitizeTitle(yt?.title || "");
      const artist = sanitizeArtist(yt?.artist || "");
      let genius = null;
      try {
        genius = await fetchGenius(title, artist, token); // 가사 스크래핑 로직 포함
      } catch (e) {
        console.error(`Error fetching Genius data for videoId ${id}:`, e);
        genius = null;
      }
      out[id] = {
        youtube: yt, // { title, artist } | null
        genius, // { songTitle, artistName, albumArt, lyrics, ... } | null
      };
      // 간단 슬립(필요 시 조정) - Genius API와 스크래핑 부하를 줄이기 위함
      await new Promise((r) => setTimeout(r, 150));
    }

    return res.status(200).json(out);
  } catch (e) {
    console.error("getSongDetails error:", e);
    return res
      .status(500)
      .json({ error: e?.message || "Internal Server Error" });
  }
}
