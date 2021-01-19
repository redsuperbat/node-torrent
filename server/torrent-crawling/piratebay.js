import { createCrawler } from "./crawler";
import { TorrentDataModel } from "./torrent-data-model";

export async function crawlPiratebay({ query } = {}) {
  const queryString = query?.replaceAll(" ", "+");
  const url = `https://thepiratebay.org/search.php?q=${queryString}&video=on`;
  console.log("Querying TPB", url);
  const page = await createCrawler();
  await page.goto(url);
  const torrents = await page.$$("li.list-entry");
  const parsedTorrents = [];
  for await (const torrent of torrents) {
    const magnetUri = await torrent.$eval(
      "span.item-icons >> a",
      (a) => a.href
    );
    const seeds = await torrent.$eval(".item-seed", (s) => Number(s.innerText));
    const leech = await torrent.$eval(".item-leech", (l) =>
      Number(l.innerText)
    );
    const name = await torrent.$eval(".item-name", (n) => n.innerText);
    const size = await torrent.$eval(".item-size", (s) => s.innerText);
    const uploaded = await torrent.$eval(".item-uploaded", (s) => s.innerText);
    parsedTorrents.push({ magnetUri, seeds, leech, name, size, uploaded });
  }

  return parsedTorrents.map((t) => new TorrentDataModel(t));
}
