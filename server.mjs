import { createServer } from "https";
import { readFileSync } from "fs";
import next from "next";
import { parse } from "url";

// ▼▼▼ SSL 인증서 에러 무시 설정 (이 줄이 중요합니다!) ▼▼▼
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// ▲▲▲

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: readFileSync("./certs/dev.cloudify.lol-key.pem"),
  cert: readFileSync("./certs/dev.cloudify.lol.pem"),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on https://localhost:3000");
    console.log("> Ready on https://dev.cloudify.lol:3000");
  });
});
