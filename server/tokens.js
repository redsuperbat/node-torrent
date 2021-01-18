import fs from "fs/promises";

const auth = {
  tokens: [],
  async onStart() {
    const tokens = await fs.readFile("./dist-server/tokens.json", {
      encoding: "utf-8",
    });
    const parsedTokens = JSON.parse(tokens).map((t) => ({
      token: t.token,
      date: new Date(t.date),
    }));
    auth.tokens = parsedTokens;
  },
  add(token) {
    this.tokens.push(token);
    writeTokenToMemory(token);
  },
};

export async function writeTokenToMemory(token) {
  console.log("Writing new token to tokens.json", token || "refreshing token");
  fs.writeFile("./dist-server/tokens.json", JSON.stringify(auth.tokens), {
    encoding: "utf-8",
  });
}

// On process startup read all tokens written to disk
auth.onStart();

export default auth;
