import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

export default async function handler(req, res) {
  if (req.method === "GET") {
    let client;
    try {
      client = await MongoClient.connect(MONGODB_URI);
      const db = client.db(MONGODB_DB);

      // 'songs' 컬렉션에서 10개의 문서를 가져옵니다.
      const playlist = await db
        .collection("playlist")
        .find()
        .limit(10)
        .toArray();

      res.status(200).json({ playlist });
    } catch (error) {
      res.status(500).json({ message: "데이터베이스 연결에 실패했습니다." });
    } finally {
      if (client) {
        client.close();
      }
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
