import { chromium } from "playwright";

export async function createCrawler() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  return page;
}
