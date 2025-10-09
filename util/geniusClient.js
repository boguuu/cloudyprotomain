// 이 함수는 브라우저(클라이언트)에서 사용됩니다.
export async function getSongDetailsFromGenius(title, artist) {
  try {
    const response = await fetch(
      `/api/genius?title=${encodeURIComponent(
        title
      )}&artist=${encodeURIComponent(artist)}`
    );

    const json = await response.json();

    if (!response.ok || !json?.ok) {
      console.warn(`Could not find song: ${title} - ${artist}`);
      return null;
    }

    // ✅ 항상 평탄화된 data만 반환
    return json.data; // { songTitle, artistName, albumArt, ... }
  } catch (error) {
    console.error("Error fetching from our Genius API route:", error);
    return null;
  }
}
