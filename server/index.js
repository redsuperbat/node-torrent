const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const { v4 } = require("uuid");
const add = require("date-fns/add");
const Webtorrent = require("webtorrent");
const auth = require("./middleware/auth");
const client = new Webtorrent();
const state = require("./tokens");

// Credentials
const pwd = process.env.PASSWORD || "dev";
const usr = process.env.USER_NAME || "dev";

// Vue app
app.use(express.static("dist"));

// Body parser
app.use(express.json());

// Socket events
io.on("connection", () => {
  console.log("Connected!");
});

app.get("/", () => {});

// generate token and login
app.post("/login", (req, res) => {
  const { password, username } = req.body;
  console.log(password, username, pwd, usr);

  if (password === pwd && username === usr) {
    const token = v4();
    // set to month when in production
    state.add({ token, date: add(new Date(), { seconds: 30 }) });
    return res.json({ msg: "Logged in!", token });
  }

  return res.status(400).send();
});

app.post("/torrent", auth, (req, res) => {
  const { magnetUri } = req.body;
  client.add(magnetUri, (torrent) => {
    torrent.on("download", () => {
      io.emit("download", torrent);
    });
    torrent.on("done", () => {
      torrent.pause();
      io.emit("pause", torrent);
    });
  });
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
