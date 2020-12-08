import express from "express";
import cors from "cors";
import http from "http";
import socketio from "socket.io";
import { v4 } from "uuid";
import { add } from "date-fns";
import path from "path";
import Webtorrent from "webtorrent";
import auth from "./middleware/auth.js";
import state from "./tokens.js";
import bodyParser from "body-parser";
import fs from "fs";
import { fromEventPattern } from "rxjs";
import { throttleTime } from "rxjs/operators";
import rimraf from "rimraf";
import directoryTree from "directory-tree";

// Constants
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketio(server);
const client = new Webtorrent();

// Credentials
const pwd = process.env.PASSWORD || "pwd123";
const usr = process.env.USER_NAME || "admin";
const downloadDir = process.env.DOWNLOAD_DIR || "./node_torrent";
const movieDir = `${downloadDir}/movies`;
const seriesDir = `${downloadDir}/series`;

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}
if (!fs.existsSync(movieDir)) {
  fs.mkdirSync(movieDir);
}
if (!fs.existsSync(seriesDir)) {
  fs.mkdirSync(seriesDir);
}

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
    state.add({ token, date: add(new Date(), { weeks: 1 }) });
    return res.json({ msg: "Logged in!", token });
  }

  return res.status(400).send();
});

app.post("/torrent", auth, (req, res, next) => {
  const { magnetUri, isMovie, customDirPath, customName } = req.body;
  const torrent = client.add(magnetUri);

  console.log(req.body);
  // Checks if user selected a custom directory to save torrent
  // If not defaults to selected predetermied directory
  const dir = customDirPath || (isMovie ? movieDir : seriesDir);
  torrent.on("metadata", async () => {
    // Checks if user specified a custom name.
    // Defaults to the torrent name if none was specified
    const userDir = `${dir}/${customName || torrent.name}`;
    // Save a copy of the userDirectory on the torrent object
    // This is to enable deletion of the files later
    torrent.userDir = userDir;
    // Wrap in promise to await
    await new Promise((res) => fs.mkdir(userDir, res));

    torrent.files.forEach((f) => {
      const fullDir = `${dir}/${customName || torrent.name}/${f.name}`;
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
  // Throttle the events to not overload the sockets
  // Maximum of one event per second
  // Currently using rxjs TODO: implement natively
  const downloadSub = fromEventPattern(downloadHandler)
    .pipe(throttleTime(1000))
    .subscribe(() => {
      console.log(torrent.uploadSpeed, torrent.downloadSpeed);
      io.emit(torrent.infoHash, extractTorrentInfo(torrent));
    });

  torrent.on("done", () => {
    console.log("Torrent", torrent.infoHash, "done!");
    io.emit(`${torrent.infoHash}-done`, extractTorrentInfo(torrent));
    downloadSub.unsubscribe();
  });

  const extractTorrentInfo = (torrent) => ({
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

app.get("/fileTree", auth, async (req, res) => {
  const tree = directoryTree(downloadDir);
  res.json(tree);
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
    if (torrent.userDir !== "/") {
      rimraf(torrent.userDir, () => {
        console.log("Removed files @", torrent.userDir);
      });
    }
  }
  client.remove(torrent);
  return res.send();
});

app.get("/ping", auth);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "/index.html"));
});

console.log(process.env.NODE_ENV);
const port = process.env.NODE_ENV ? 3333 : 3030;
server.listen(port, () => console.log(`Listening on http://localhost:${port}`));
