// Snapshot real pages' rendered DOM at chosen states. Usage: node snap.mjs <plan.json> <out.json>
import fs from "node:fs";
const [,, planFile, outFile] = process.argv;
const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
const base = process.env.CDP || "http://127.0.0.1:9222";
const t = await (await fetch(`${base}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl.replace(/ws:\/\/[^/]+/, base.replace("http", "ws")));
await new Promise((r) => ws.onopen = r);
let id = 0; const pend = new Map(); const errs = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } if (d.method === "Runtime.exceptionThrown") errs.push(JSON.stringify(d.params.exceptionDetails).slice(0, 300)); };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result?.result?.value; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await send("Runtime.enable"); await send("Page.enable"); await send("Network.enable"); await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Emulation.setDeviceMetricsOverride", { width: plan.width || 1280, height: plan.height || 674, deviceScaleFactor: 1, mobile: false });
const out = {};
for (const step of plan.steps) {
  if (step.go) { await send("Page.navigate", { url: step.go }); await sleep(step.wait ?? 3000); }
  if (step.js) { await ev(step.js); await sleep(step.wait ?? 800); }
  if (step.snap) {
    out[step.snap] = await ev(`(() => {
      const b = document.body.cloneNode(true);
      b.querySelectorAll("script").forEach((s) => s.remove());
      ${step.keep ? `` : ``}
      // inputs keep what was typed
      const src = document.body.querySelectorAll("input,textarea,select"), dst = b.querySelectorAll("input,textarea,select");
      src.forEach((e, i) => { if (e.type === "checkbox" || e.type === "radio") { e.checked ? dst[i].setAttribute("checked", "") : dst[i].removeAttribute("checked"); } else if (e.tagName === "SELECT") { dst[i].querySelectorAll("option").forEach((o, k) => o.toggleAttribute("selected", k === e.selectedIndex)); } else dst[i].setAttribute("value", e.value); });
      // canvases (charts) become pictures of themselves
      const cs = document.body.querySelectorAll("canvas"), cd = b.querySelectorAll("canvas");
      cs.forEach((c, i) => { try { const img = document.createElement("img"); img.src = c.toDataURL("image/png"); img.style.cssText = "display:block;width:" + c.clientWidth + "px;height:" + c.clientHeight + "px"; cd[i].replaceWith(img); } catch {} });
      const attrs = {}; for (const a of document.body.attributes) attrs[a.name] = a.value;
      return { html: b.innerHTML, body: attrs, htmlClass: document.documentElement.className, scrollY };
    })()`);
    console.log(step.snap, Math.round(out[step.snap].html.length / 1024) + " KB");
  }
}
fs.writeFileSync(outFile, JSON.stringify(out));
console.log(errs.length ? errs.join("\n") : "no page errors");
await fetch(`${base}/json/close/${t.id}`); process.exit(0);
