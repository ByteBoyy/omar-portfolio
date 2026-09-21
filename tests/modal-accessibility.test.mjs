import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { after, before, test } from "node:test";
import { chromium } from "playwright-core";
import { createServer } from "vite";

let browser;
let server;
let siteUrl;

before(async () => {
  server = await createServer({
    logLevel: "error",
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();

  const address = server.httpServer.address();
  siteUrl = `http://127.0.0.1:${address.port}`;
  const managedChromium = chromium.executablePath();
  const executablePath = existsSync(managedChromium)
    ? managedChromium
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  browser = await chromium.launch({
    executablePath,
    headless: true,
  });
});

after(async () => {
  await browser?.close();
  await server?.close();
});

test("the modal isolates the page and restores its trigger", async () => {
  const page = await browser.newPage();

  try {
    await page.goto(siteUrl);
    const trigger = page.getByRole("button", { name: "Open CasePeer case study" });
    await trigger.click();

    await page.getByRole("dialog", { name: "CasePeer" }).waitFor();
    assert.equal(await page.locator("#root").evaluate((root) => root.inert), true);
    assert.equal(await page.locator("body").evaluate((body) => body.style.overflow), "hidden");
    assert.equal(await page.locator(":focus").getAttribute("aria-label"), "Close case study");

    await page.keyboard.press("Escape");

    assert.equal(await page.getByRole("dialog").count(), 0);
    assert.equal(await page.locator("#root").evaluate((root) => root.inert), false);
    assert.equal(await page.locator("body").evaluate((body) => body.style.overflow), "");
    assert.equal(await page.locator(":focus").getAttribute("aria-label"), "Open CasePeer case study");
  } finally {
    await page.close();
  }
});

test("keyboard focus wraps within the modal", async () => {
  const page = await browser.newPage();

  try {
    await page.goto(siteUrl);
    await page.getByRole("button", { name: "Open BiteWise case study" }).click();

    const closeButton = page.getByRole("button", { name: "Close case study" });
    const playButton = page.getByRole("button", { name: "Play demo" });
    await playButton.waitFor({ state: "visible" });
    await page.waitForFunction(() => !document.querySelector('.audio-console button')?.disabled);

    await closeButton.focus();
    await page.keyboard.press("Shift+Tab");
    assert.equal(await page.locator(":focus").getAttribute("aria-label"), "Play demo");

    await page.keyboard.press("Tab");
    assert.equal(await page.locator(":focus").getAttribute("aria-label"), "Close case study");
  } finally {
    await page.close();
  }
});
