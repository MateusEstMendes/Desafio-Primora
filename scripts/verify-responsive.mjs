import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'vite';

// Browser smoke checks against the mobile and desktop layouts, without extra dependencies.
const output = join(tmpdir(), 'primora-visual-check');
await mkdir(output, { recursive: true });
const server = await createServer({ server: { host: '127.0.0.1', port: 5188, strictPort: true, open: false } });
await server.listen();
const browser = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
  '--remote-debugging-port=9237', '--remote-allow-origins=*', '--user-data-dir=' + join(output, 'profile'), 'about:blank'
], { windowsHide: true, stdio: 'ignore' });
let socket;
const pending = new Map();
let id = 0;
const errors = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let targets;
  for (let i = 0; i < 60; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9237/json')).json(); if (targets.length) break; } catch {}
    await delay(500);
  }
  if (!targets?.length) throw new Error('Chrome debugging endpoint did not start.');
  socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = e => {
    const message = JSON.parse(e.data);
    if (message.id) { const p = pending.get(message.id); pending.delete(message.id); if (message.error) p.reject(new Error(JSON.stringify(message.error))); else p.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + (message.params.exceptionDetails.exception?.description || ''));
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(a => a.value || a.description).join(' '));
  };
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const callId = ++id; pending.set(callId, { resolve, reject }); socket.send(JSON.stringify({ id: callId, method, params })); });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async expression => { for (let i = 0; i < 180; i++) { if (await evaluate('Boolean(' + expression + ')')) return; await delay(500); } throw new Error('Timed out: ' + expression); };
  await cdp('Runtime.enable');
  await cdp('Page.enable');
  await cdp('Page.bringToFront');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await cdp('Page.navigate', { url: 'http://127.0.0.1:5188' });
  await waitFor('document.querySelector(".executive-dashboard")');
  await evaluate('localStorage.removeItem("color-scheme"); location.reload(); true');
  await waitFor('document.querySelectorAll(".reference-kpi").length === 4');
  await delay(1500);
  const inspect = async (width, tab, theme) => {
    const result = await evaluate(`(() => {
      const main = document.querySelector('main');
      const bad = [...main.querySelectorAll('*')].filter(e => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && (r.right > innerWidth + 2 || r.left < -2) && getComputedStyle(e).position !== 'absolute' && !e.closest('.recharts-wrapper, .ant-table-content, .table-responsive-wrapper, .table-region-wrapper');
      }).slice(0, 8).map(e => e.tagName + '.' + e.className);
      return { width: innerWidth, pageWidth: document.documentElement.scrollWidth, bad, charts: document.querySelectorAll('.recharts-surface').length, theme: document.documentElement.dataset.theme,
        chartSizes: [...document.querySelectorAll('.reference-spark, .reference-donut, .focus-chart')].map(e => ({ parent: Math.round(e.getBoundingClientRect().width), svg: e.querySelector('svg')?.getAttribute('width'), height: e.querySelector('svg')?.getAttribute('height') })) };
    })()`);
    if (result.bad.length || result.pageWidth > width + 2) throw new Error('Overflow: ' + JSON.stringify({ tab, theme, ...result }));
    console.log(JSON.stringify({ tab, ...result }));
  };
  const screenshot = async name => {
    await evaluate('document.fonts.ready.then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)))))');
    const { cssContentSize } = await cdp('Page.getLayoutMetrics');
    const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 } });
    await writeFile(join(output, name + '.png'), Buffer.from(shot.data, 'base64'));
  };
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: width < 1024 ? 900 : 1000, deviceScaleFactor: 1, mobile: width < 768 });
    await evaluate('location.reload(); true');
    await waitFor('document.querySelectorAll(".reference-kpi").length === 4');
    await delay(1500);
    await inspect(width, 'overview', 'light');
    if ([390, 1440].includes(width)) {
      const chartReady = await evaluate(`(() => { const visible = [...document.querySelectorAll('.reference-spark, .reference-donut, .focus-chart')].filter(e => e.getBoundingClientRect().width); return visible.every(e => e.querySelector('.recharts-area-area, .recharts-pie-sector')); })()`);
      if (!chartReady) throw new Error('A visible overview chart has not rendered.');
      await screenshot('final-executive-' + width);
    }
  }
  await evaluate(`document.querySelector('.period-control button:last-child').click(); true`);
  await delay(300);
  if (!(await evaluate(`document.querySelector('.period-badge').textContent.includes('6 meses')`))) throw new Error('Period control failed.');
  await evaluate(`document.querySelectorAll('.territory-list button')[2].click(); true`);
  await delay(300);
  if (!(await evaluate(`document.querySelector('.reference-kpi strong').textContent === '400'`))) throw new Error('Regional filter failed.');
  const focusedName = await evaluate(`document.querySelector('.company-heading p').childNodes[0].textContent`);
  await evaluate(`document.querySelector('.company-heading').click(); true`);
  await waitFor(`document.querySelector('.clientes-container')`);
  if (!(await evaluate(`document.querySelector('.client-crud-bar')?.textContent.includes(${JSON.stringify(focusedName)})`))) throw new Error('Client navigation failed.');
  for (const width of [390, 1440]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 768 });
    for (const tab of ['comparativo', 'historico-clientes']) {
      await evaluate(`document.querySelectorAll('.reference-desktop-nav button')[${tab === 'comparativo' ? 1 : 2}].click(); true`);
      await delay(1500);
      await inspect(width, tab, 'light');
      await screenshot(tab + '-' + width);
    }
  }
  await evaluate(`document.querySelector('.reference-sidebar-bottom .reference-theme').click(); true`);
  await delay(300);
  await inspect(1440, 'journey', 'dark');
  await screenshot('journey-dark');
  if (errors.length) throw new Error('Browser errors: ' + errors.join('\n'));
  console.log('PASS: responsive widths, tabs, period, regional filter, client navigation and theme. Screenshots: ' + output);
} finally {
  socket?.close();
  browser.kill();
  await server.close();
}
