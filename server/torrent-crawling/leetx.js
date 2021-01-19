import { createCrawler } from "./crawler";
import { TorrentDataModel } from "./torrent-data-model";
import cheerio from "cheerio";
import axios from "axios";

export async function crawlLeetX({ query } = {}) {
  const queryString = query?.replaceAll(" ", "%20");
  const url = `https://www.1377x.to/sort-search/${queryString}/seeders/desc/1/`;
  console.log("Querying LeetX", url);
  const page = await createCrawler();
  await page.goto(url);
  const torrents = (await page.$$("tbody >> tr")).slice(0, 10);
  // const newPage = await createCrawler();
  const parsedTorrents = [];
  for await (const torrent of torrents) {
    try {
      const seeds = await torrent.$eval("td.seeds", (s) => Number(s.innerText));
      const leech = await torrent.$eval(".leeches", (l) => Number(l.innerText));
      const name = await torrent.$eval(".name", (n) => n.innerText);
      const size = await torrent.$eval(".size", (s) => s.innerText);
      const uploaded = await torrent.$eval(".coll-date", (s) => s.innerText);
      const linkToMagnet = await torrent.$$eval(
        ".name >> a",
        ([, el]) => el.href
      );
      // await newPage.goto(linkToMagnet);
      // const magnetUri = await newPage.$eval("a >> text=magnet", (a) => a.href);
      const html = await axios.get(linkToMagnet);
      const $ = cheerio.load(html.data);

      const magnetUri = $("li")
        .children()
        .find("a")
        .filter((i, val) =>
          $(val)
            .attr("href")
            .includes("magnet")
        )
        .attr("href");

      parsedTorrents.push({
        magnetUri,
        seeds,
        leech,
        name,
        size,
        uploaded,
        site: "Leetx",
      });
    } catch (e) {
      console.log(e);
    }
  }
  console.log("Result from LeetX finished");
  return parsedTorrents.map((t) => new TorrentDataModel(t));
}
