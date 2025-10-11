import * as cheerio from "cheerio";

// 이 함수는 서버 환경에서만 호출되어야 합니다.
export async function fetchGeniusDataForSong(title, artist) {
  const accessToken = process.env.GENIUS_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("Genius Access Token is missing!");
    return null;
  }

  try {
    const q = encodeURIComponent(`${title} ${artist}`);
    const searchUrl = `https://api.genius.com/search?q=${q}`;

    const searchResponse = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const searchData = await searchResponse.json();
    const hit = searchData.response?.hits?.[0]?.result;

    if (!hit) return null;

    // 가사 스크레이핑
    const lyricsResponse = await fetch(hit.url);
    const html = await lyricsResponse.text();
    const $ = cheerio.load(html);
    let lyrics = "";
    $('div[data-lyrics-container="true"]').each((i, elem) => {
      const verse = $(elem)
        .html()
        .replace(/<br\s*\/?>/g, "\n");
      lyrics += $(`<div>${verse}</div>`).text().trim() + "\n\n";
    });

    return {
      title: hit.title,
      artist: hit.primary_artist.name,
      albumArt: hit.song_art_image_url || hit.header_image_url,
      lyrics: lyrics.trim(),
    };
  } catch (error) {
    console.error(`Failed to fetch Genius data for ${title}:`, error);
    return null;
  }
}
