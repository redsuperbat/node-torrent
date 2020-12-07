const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { v4 } = require("uuid");
const add = require("date-fns/add");
const path = require("path");
const Webtorrent = require("webtorrent");
const auth = require("./middleware/auth");
const client = new Webtorrent();
const state = require("./tokens");
const bodyParser = require("body-parser");
const fs = require("fs");
const { fromEventPattern } = require("rxjs");
const { throttleTime } = require("rxjs/operators");
const rimraf = require("rimraf");
// Credentials
const pwd = process.env.PASSWORD || "dev";
const usr = process.env.USER_NAME || "dev";
const movieDir = process.env.MOVIE_DIR || "./downloads";
const seriesDir = process.env.SERIES_DIR || "./downloads";

// Vue app
app.use(express.static("dist"));

// Body parser
const jsonParser = bodyParser.json();
app.use(jsonParser);
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);

// connection event
io.on("connection", () => {
  const torrents = client.torrents.map((t) => ({
    name: t.name,
    infoHash: t.infoHash,
  }));
  io.emit("init_torrents", torrents);
});

// generate token and login
app.post("/login", (req, res) => {
  const { password, username } = req.body;
  console.log(password, username, pwd, usr, req.body);

  if (password === pwd && username === usr) {
    const token = v4();
    // set to month when in production
    state.add({ token, date: add(new Date(), { weeks: 1 }) });
    return res.json({ msg: "Logged in!", token });
  }

  return res.status(400).send();
});

app.post("/torrent", auth, (req, res, next) => {
  const { magnetUri, isMovie } = req.body;
  const torrent = client.add(magnetUri);
  const dir = isMovie ? movieDir : seriesDir;

  torrent.on("metadata", async () => {
    const userDir = `${dir}/${torrent.name}`;
    torrent.userDir = userDir;
    await new Promise((res) => fs.mkdir(userDir, res));
    torrent.files.forEach((f) => {
      const fullDir = `${dir}/${torrent.name}/${f.name}`;
      console.log(fullDir);
      const writeStream = fs.createWriteStream(fullDir);
      const fileStream = f.createReadStream();
      fileStream.pipe(writeStream);
    });
    res.status(201).json({ name: torrent.name, infoHash: torrent.infoHash });
  });

  const downloadHandler = (handler) => {
    torrent.on("download", handler);
  };
  const downloadSub = fromEventPattern(downloadHandler)
    .pipe(throttleTime(1000))
    .subscribe(() => {
      console.log(torrent.uploadSpeed, torrent.downloadSpeed);
      io.emit(torrent.infoHash, {
        progress: torrent.progress,
        uploadSpeed: torrent.uploadSpeed,
        downloadSpeed: torrent.downloadSpeed,
        uploaded: torrent.uploaded,
        downloaded: torrent.downloaded,
        size: torrent.length,
        timeRemaining: torrent.timeRemaining,
        peers: torrent.numPeers,
      });
    });

  torrent.on("done", () => {
    console.log("Torrent", torrent.infoHash, "done!");
    io.emit(`${torrent.infoHash}-done`, { progress: torrent.progress });
    downloadSub.unsubscribe();
  });
});

app.patch("/pause/:infoHash", auth, (req, res) => {
  const { infoHash } = req.params;
  const torrent = client.torrents.find((t) => t.infoHash === infoHash);
  torrent.pause();
  return res.send();
});
app.patch("/resume/:infoHash", auth, (req, res) => {
  const { infoHash } = req.params;
  const torrent = client.torrents.find((t) => t.infoHash === infoHash);
  torrent.resume();
  return res.send();
});
app.delete("/remove/:infoHash", auth, (req, res) => {
  const { infoHash } = req.params;
  const { removeData } = req.body;
  const torrent = client.torrents.find((t) => t.infoHash === infoHash);
  rimraf(torrent.path, () => {
    console.log("Removed torrent cache");
  });
  console.log(
    "Torrent path is:",
    torrent.path,
    "Torrent userdir is:",
    torrent.userDir
  );
  if (removeData) {
    rimraf(torrent.userDir, () => {
      console.log("Removed files @", torrent.userDir);
    });
  }
  client.remove(torrent);
  return res.send();
});

app.get("/ping", auth);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "/index.html"));
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Listening on http://localhost:${port}`));
