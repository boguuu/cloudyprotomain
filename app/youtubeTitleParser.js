/**
 * 유튜브 영상 제목에서 불필요한 문구를 제거하고 아티스트와 제목을 분리합니다.
 * @param {string} rawTitle - 원본 YouTube 영상 제목
 * @returns {{artist: string | null, title: string}} - 파싱된 아티스트와 제목 객체
 */
function parseYoutubeTitle(rawTitle) {
  if (!rawTitle) {
    return { artist: null, title: "" };
  }

  let cleanedTitle = rawTitle;

  // 1. 괄호 안의 내용 제거 (MV, Official Video, Audio, Live 등)
  // 예: "Artist - Title (Official MV)" -> "Artist - Title"
  cleanedTitle = cleanedTitle.replace(
    /\s*\(.*?(Official|MV|Audio|Video|Live|Remastered|Lyrics|가사|자막).*?\)\s*/gi,
    " "
  );
  cleanedTitle = cleanedTitle.replace(
    /\s*\[.*?(Official|MV|Audio|Video|Live|Remastered|Lyrics|가사|자막).*?\]\s*/gi,
    " "
  );

  // 2. 제목 앞/뒤의 불필요한 태그 제거
  // 예: "[M/V] Artist - Title" -> "Artist - Title"
  cleanedTitle = cleanedTitle.replace(/^\[.*?\]\s*/, "");
  cleanedTitle = cleanedTitle.replace(/\s*\[.*?\]$/, "");

  // 3. 자주 쓰이는 구분자로 아티스트와 제목 분리 시도 (긴 대시, 일반 대시 순)
  const delimiters = ["–", "-"];
  let artist = null;
  let title = cleanedTitle;

  for (const delimiter of delimiters) {
    if (cleanedTitle.includes(delimiter)) {
      const parts = cleanedTitle.split(delimiter);
      // 아티스트 부분이 너무 길지 않고, 제목 부분이 내용이 있을 경우 분리
      if (parts.length > 1 && parts[0].length < 40 && parts[1].trim() !== "") {
        artist = parts.shift().trim(); // 첫 부분을 아티스트로
        title = parts.join(delimiter).trim(); // 나머지 부분을 제목으로
        break; // 성공하면 루프 중단
      }
    }
  }

  // 4. "feat." 또는 "ft." 같은 피처링 정보는 제목의 일부로 유지 (또는 별도 처리 가능)
  // 여기서는 별도 처리 없이 제목에 포함시킵니다.

  // 5. 남은 제목에서 일반적인 불필요한 단어 제거
  title = title.replace(/(audio|official video|mv|lyrics|가사)/gi, " ");

  // 6. 최종적으로 양쪽 공백 제거
  if (artist) {
    artist = artist.trim();
  }
  title = title.trim();

  // 만약 아티스트가 분리되지 않았다면, title을 그대로 반환
  // 이 경우, title 전체를 검색어로 사용해 볼 수 있습니다.
  return { artist, title };
}

// --- 함수 테스트 ---
if (require.main === module) {
  const testTitles = [
    "아이유(IU) - 라일락(LILAC) Official MV",
    "BTS (방탄소년단) 'Dynamite' Official MV",
    "[1시간] 로스트아크 떠돌이 상인 BGM / Lost Ark Wandering Merchant BGM",
    "Red Velvet - Psycho",
    "BLACKPINK – ‘뚜두뚜두 (DDU-DU DDU-DU)’ M/V",
    "AKMU - '어떻게 이별까지 사랑하겠어, 널 사랑하는 거지' (Official Video)",
    "Coldplay - Higher Power (Official Audio)",
    "aespa 에스파 'Next Level' MV",
  ];

  console.log("--- 유튜브 제목 파싱 테스트 ---");
  testTitles.forEach((title) => {
    const parsed = parseYoutubeTitle(title);
    console.log(`\nOriginal : ${title}`);
    console.log(
      `Parsed   : { artist: '${parsed.artist}', title: '${parsed.title}' }`
    );
  });
}

// 다른 파일에서 사용하려면 export
// module.exports = { parseYoutubeTitle };
