// import { connectDB } from "@/util/database";
// import MusicPlayerClient from "./MusicPlayerClient";
// import Link from "next/link";

// export default async function MusicList() {
//   const db = (await connectDB).db("cloudytest");
//   let result = await db.collection("playlist").find().toArray();
//   result = result.map((a) => {
//     a._id = a._id.toString();
//   });
//   console.log(result);

//   return <MusicPlayerClient MusicList={result} />;
// }
