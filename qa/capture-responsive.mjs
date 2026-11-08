import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9333;
const baseUrl = `http://127.0.0.1:${port}`;
const siteUrl = 'http://127.0.0.1:4173/';
const outputDir = path.resolve('qa', 'screenshots');
const profileDir = path.resolve('qa', 'chrome-profile', 'cdp');

await mkdir(outputDir, { recursive: true });
await mkdir(profileDir, { recursive: true });

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

const iPhoneSafari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const androidChrome = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';

const viewports = [
  { name: 'mobile-390x844.png', width: 390, height: 844, mobile: true },
  { name: 'iphone-se-375x667.png', width: 375, height: 667, mobile: true, userAgent: iPhoneSafari },
  { name: 'iphone-15-pro-393x852.png', width: 393, height: 852, mobile: true, userAgent: iPhoneSafari },
  { name: 'galaxy-s23-360x780.png', width: 360, height: 780, mobile: true, userAgent: androidChrome },
  { name: 'pixel-9-412x915.png', width: 412, height: 915, mobile: true, userAgent: androidChrome },
  { name: 'tablet-768x1024.png', width: 768, height: 1024, mobile: true },
  { name: 'desktop-1440x900.png', width: 1440, height: 900, mobile: false },
];

for (const viewport of viewports) {
  await send('Network.setUserAgentOverride', { userAgent: viewport.userAgent || '' });
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
      const finish = () => setTimeout(() => resolve({ width: innerWidth, height: innerHeight }), 2200);
      if (document.readyState === 'complete') finish();
      else addEventListener('load', finish, { once: true });
    })`,
    awaitPromise: true,
    returnByValue: true,
  });
  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
    clip: { x: 0, y: 0, width: viewport.width, height: viewport.height, scale: 1 },
  });
  await writeFile(path.join(outputDir, viewport.name), Buffer.from(screenshot.data, 'base64'));
  process.stdout.write(`${viewport.name}\n`);
}

await send('Browser.close');
socket.close();
chrome.unref();
