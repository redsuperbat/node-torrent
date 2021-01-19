import { chromium } from "playwright";

const promiseBrowser = chromium.launch();

export async function createCrawler() {
  const browser = await promiseBrowser;
  const page = await browser.newPage();
  return page;
}
