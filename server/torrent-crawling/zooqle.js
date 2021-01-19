import { createCrawler } from "./crawler";
import { TorrentDataModel } from "./torrent-data-model";

export async function crawlZooqle({ query } = {}) {
  const searchString = query?.split(" ").join("+");
  const page = await createCrawler();
  await page.goto(`https://zooqle.com/search?q=${searchString}`);

  const torrents = await page.$$("tbody >> tr");
  const parsedTorrents = [];
  for await (const torrent of torrents) {
    try {
      const magnetUri = await torrent.$eval(
        "a[title='Magnet link']",
        (a) => a.href
      );
      const seeds = await torrent.$eval(
        ".progress-bar.smaller.prog-green.prog-l",
        (s) => Number(s.innerText)
      );
      const leech = await torrent.$eval(
        ".progress-bar.smaller.prog-yellow.prog-r",
        (l) => Number(l.innerText)
      );
      const name = await torrent.$eval(
        ".text-trunc.text-nowrap",
        (n) => n.innerText
      );
      const size = await torrent.$eval(
        ".progress-bar.prog-blue.prog-l",
        (s) => s.innerText
      );
      const uploaded = await torrent.$eval(
        ".text-nowrap.text-muted.smaller",
        (s) => s.innerText
      );
      parsedTorrents.push({
        magnetUri,
        seeds,
        leech,
        name,
        size,
        uploaded,
        site: "Zooqle",
      });
    } catch (e) {
      console.log(e);
    }
  }
  console.log("Result from TBP finished", parsedTorrents);
  return parsedTorrents.map((t) => new TorrentDataModel(t));
}
