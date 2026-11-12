import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9334;
const baseUrl = `http://127.0.0.1:${port}`;
const siteUrl = 'http://127.0.0.1:4173/';
const outputDir = path.resolve('qa', 'screenshots');
const profileDir = await mkdtemp(path.join(os.tmpdir(), 'hoangyen-product-qa-'));

await mkdir(outputDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  'about:blank',
], { stdio: 'ignore', windowsHide: true });

async function waitForChrome() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/json/version`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Chrome DevTools endpoint did not start.');
}

await waitForChrome();
const targetResponse = await fetch(`${baseUrl}/json/new?${encodeURIComponent(siteUrl)}`, { method: 'PUT' });
const target = await targetResponse.json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let commandId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function send(method, params = {}) {
  commandId += 1;
  return new Promise((resolve, reject) => {
    pending.set(commandId, { resolve, reject });
    socket.send(JSON.stringify({ id: commandId, method, params }));
  });
}

await send('Page.enable');
await send('Runtime.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });

const viewports = [
  { name: 'product-showcase-mobile-390x844.png', width: 390, height: 844, mobile: true },
  { name: 'product-showcase-desktop-1440x900.png', width: 1440, height: 900, mobile: false },
];

for (const viewport of viewports) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  });
  await send('Page.navigate', { url: siteUrl });
  await send('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      const prepare = async () => {
        await new Promise((done) => setTimeout(done, 1500));
        const popup = document.querySelector('#promoPopup');
        if (popup) {
          popup.hidden = true;
          popup.classList.remove('active');
          popup.setAttribute('aria-hidden', 'true');
        }
        document.body.style.overflow = '';
        const section = document.querySelector('#homecare');
        section.querySelectorAll('.fade-up').forEach((element) => element.classList.add('visible'));
        window.scrollTo({ top: section.offsetTop, behavior: 'instant' });
        await document.fonts.ready;
        await new Promise((done) => setTimeout(done, 350));
        resolve(true);
      };
      if (document.readyState === 'complete') prepare();
      else addEventListener('load', prepare, { once: true });
    })`,
    awaitPromise: true,
    returnByValue: true,
  });
  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(path.join(outputDir, viewport.name), Buffer.from(screenshot.data, 'base64'));
  process.stdout.write(`${viewport.name}\n`);
}

await send('Browser.close');
socket.close();
chrome.unref();
