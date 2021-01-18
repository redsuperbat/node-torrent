export async function fetchData({ query } = {}) {
  const queryString = query?.replaceAll(" ", "+");
  const url = `https://thepiratebay.org/search.php?q=${queryString}&all=on&search=Pirate+Search&page=0&orderby=`;
  createCra;
  // const $ = cheerio.load(res.);
  // return $;
}

async function crawlThePirateBay(query) {
  await fetchData({ query: "hello world" });

  process.exit();
}

crawlThePirateBay();
