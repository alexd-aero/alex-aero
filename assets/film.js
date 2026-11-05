// The film: who I am, then Aegis × Burrow and Bulwark at work, drawn in HTML.
// Every frame is a pure function of the time t, so the scrubber and the
// chapters can jump anywhere, the same way a video would.
//
// The Aegis, Burrow, Machines and Bulwark screens are the real interfaces:
// each one's own stylesheet and the DOM its own code rendered (from demo data,
// see assets/real/README.md), kept in a shadow root and scaled into a window.

const W = 1280, H = 720;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x) => 1 - Math.pow(1 - x, 3);
const typed = (s, t, a, cps = 16) => s.slice(0, clamp(Math.floor((t - a) * cps), 0, s.length));
const B = "assets/brand/";
const V = "4.3.0";

/* ───────── real screens ───────── */
// a browser window around a real page: the page renders at 1280 x 674 and is scaled to fit
const WX = 32, WY = 18, WW = 1216, BAR = 38;
const WK = WW / 1280, WH = BAR + Math.round(674 * WK);
const chrome = (url, inner, cls = "") => `
  <div class="f-win real ${cls}" style="left:${WX}px;top:${WY}px;width:${WW}px;height:${WH}px">
    <div class="f-bar"><i></i><i></i><i></i><div class="f-url"><svg viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v6H4z"/></svg><span class="u">${url}</span></div></div>
    <div class="f-body" style="top:${BAR}px">${inner}</div>
  </div>`;
// a slot for one snapshot; filled once the snapshots arrive
const slot = (name) => `<div class="rv" data-snap="${name}" style="transform:scale(${WK})"></div>`;
const CSS = { aegis: `assets/real/aegis-ui.css?v=${V}`, login: `assets/real/aegis-login.css?v=${V}`, bulwark: `assets/real/bulwark.css?v=${V}` };
const KIND = { login: "login", list: "aegis", form: "aegis", formFilled: "aegis", detail: "aegis", created: "aegis", machines: "aegis", machinesDown: "aegis", machinesNas: "aegis",
               bwOverview: "bulwark", bwLog: "bulwark", bwWaves: "bulwark", bwPatterns: "bulwark", bwBlocklist: "bulwark" };
function mountSnap(el, snap) {
  const root = el.attachShadow({ mode: "open" });
  const attrs = Object.entries(snap.body || {}).map(([k, v]) => `${k}="${String(v).replace(/"/g, "&quot;")}"`).join(" ");
  root.innerHTML = `<link rel="stylesheet" href="${CSS[KIND[el.dataset.snap]]}">
    <style>:host{all:initial;display:block}.x-html,.x-body{height:100%;min-height:0!important}.x-body{overflow:hidden!important}
      *{animation-play-state:running}.rv-hide{display:none!important}</style>
    <div class="x-html ${snap.htmlClass || ""}"><div class="x-body" ${attrs}>${snap.html.replace(/\sautofocus(="[^"]*")?/g, "")}</div></div>`;
  return root;
}

/* ───────── the scenes ───────── */
const SCENES = [];
const scene = (o) => { o.start = SCENES.reduce((s, x) => s + x.dur, 0); SCENES.push(o); };
// which snapshot is showing at t: [[from, name], ...]
const showing = (list, t) => { let n = list[0][1]; for (const [a, name] of list) if (t >= a) n = name; return n; };
function swap($$, list, t, fade = 0.25) {
  const cur = showing(list, t);
  let prev = null, since = 0;
  for (let i = 0; i < list.length; i++) if (list[i][1] === cur && t >= list[i][0]) { since = list[i][0]; prev = list[i - 1]?.[1]; }
  for (const el of $$(".rv")) {
    const n = el.dataset.snap;
    el.style.opacity = n === cur ? (prev && t - since < fade ? clamp((t - since) / fade) : 1) : n === prev && t - since < fade ? 1 : 0;
    el.style.zIndex = n === cur ? 2 : 1;
  }
  return cur;
}

// 0 · the hook: three cuts of the real thing, full bleed, before anything is explained
const CUTS = [
  [0, 2.35, "bwWaves", "Bulwark", "74 addresses. One attack.<br>Stopped before it lands.", "62% 52%", "#ff6a3d"],
  [2.35, 4.7, "detail", "Burrow", "Any port on your machine,<br>live on HTTPS in seconds.", "48% 58%", "#3ddc97"],
  [4.7, 7.05, "machinesDown", "Aegis", "Every machine you own,<br>behind one login nobody can read.", "40% 62%", "#e8eaed"],
];
scene({
  id: "hook", chapter: "In 7 seconds", dur: 7.5,
  caption: "Bulwark stopping a 74-address attack campaign, Burrow putting a port online, Aegis watching every machine. All real screens. Here's how it works.",
  html: `${CUTS.map(([, , snap, k, line], i) => `<div class="hk-cut" data-i="${i}">${slot(snap)}<div class="hk-shade"></div>
      <div class="hk-txt"><p class="hk-k"><i></i>${k}</p><h3 class="hk-h">${line}</h3></div></div>`).join("")}
    <div class="hk-bar"><i></i><i></i><i></i></div>`,
  render(t, $, root) {
    root.querySelectorAll(".hk-cut").forEach((cut, i) => {
      const [a, b, , , , origin, color] = CUTS[i], u = clamp((t - a) / (b - a));
      const vis = i === 0 ? (t < b ? 1 : clamp((b + 0.2 - t) / 0.2)) : clamp((t - a) / 0.2) * (i === CUTS.length - 1 ? 1 - seg(t, 7.05, 7.5) : t < b ? 1 : clamp((b + 0.2 - t) / 0.2));
      cut.style.opacity = vis;
      cut.style.visibility = vis > 0 ? "visible" : "hidden";
      const rv = cut.querySelector(".rv");
      rv.style.transformOrigin = origin;
      rv.style.transform = `scale(${(720 / 674) * (1.16 - 0.1 * eo(u))})`;
      rv.style.opacity = 1;
      const k = eo(seg(t, a + 0.15, a + 0.75)) * (1 - seg(t, b - 0.25, b));
      cut.querySelector(".hk-txt").style.cssText = `opacity:${k};transform:translateY(${26 * (1 - eo(seg(t, a + 0.15, a + 0.85)))}px);--kc:${color}`;
    });
    root.querySelectorAll(".hk-bar i").forEach((bar, i) => { bar.style.setProperty("--p", clamp((t - CUTS[i][0]) / (CUTS[i][1] - CUTS[i][0]))); });
    $(".hk-bar").style.opacity = 1 - seg(t, 6.9, 7.3);
  },
});

// 1 · title
scene({
  id: "title", chapter: "Aegis × Burrow", dur: 4,
  caption: "Aegis × Burrow: one post-quantum login in front of everything you run, on a tunnel engine that gives any port its own HTTPS address.",
  html: `
    <div class="f-title">
      <svg class="t-logo" viewBox="0 0 128 128">
        <defs>
          <linearGradient id="ft-tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1b1f"/><stop offset="1" stop-color="#060607"/></linearGradient>
          <linearGradient id="ft-ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#bfc3c9"/></linearGradient>
          <radialGradient id="ft-light" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
          <clipPath id="ft-in"><path d="M64 26.5 38 35.5v21.5c0 19.6 11.2 35.4 26 42.6 14.8-7.2 26-23 26-42.6V35.5z"/></clipPath>
        </defs>
        <rect x="3" y="3" width="122" height="122" rx="30" fill="url(#ft-tile)" stroke="rgba(255,255,255,.14)"/>
        <path class="t-shield" pathLength="1" d="M64 18 30 29.5v27.5c0 24.4 14.4 44 34 53 19.6-9 34-28.6 34-53V29.5z" fill="none" stroke="url(#ft-ink)" stroke-width="8" stroke-linejoin="round"/>
        <g clip-path="url(#ft-in)">
          <path class="t-arch1" pathLength="1" d="M43 104V64a21 21 0 0 1 42 0v40" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
          <path class="t-arch2" pathLength="1" d="M54 104V66a10 10 0 0 1 20 0v38" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="5.5" stroke-linecap="round"/>
          <circle class="t-glow" cx="64" cy="78" r="16" fill="url(#ft-light)"/>
          <circle class="t-dot" cx="64" cy="78" r="5" fill="#fff"/>
        </g>
      </svg>
      <h2 class="t-name">Aegis <span>×</span> Burrow</h2>
      <p class="t-tag">A post-quantum gate, on a tunnel engine.</p>
    </div>`,
  render(t, $) {
    $(".t-shield").style.strokeDashoffset = 1 - io(seg(t, 0, 1.1));
    $(".t-arch1").style.strokeDashoffset = 1 - io(seg(t, 0.5, 1.5));
    $(".t-arch2").style.strokeDashoffset = 1 - io(seg(t, 0.7, 1.7));
    const g = seg(t, 1.4, 2);
    $(".t-glow").style.opacity = g * (0.75 + 0.25 * Math.sin(t * 3));
    $(".t-dot").style.opacity = g;
    $(".t-name").style.cssText = `opacity:${seg(t, 1.2, 1.9)};transform:translateY(${12 * (1 - eo(seg(t, 1.2, 2)))}px)`;
    $(".t-tag").style.opacity = seg(t, 1.8, 2.5);
  },
});

// 2 · install
const CMD = "curl -fsSL https://raw.githubusercontent.com/alexd-aero/aegis-burrow/main/install.sh | bash";
const TERM = [
  [2.9, `<b>Aegis × Burrow</b> <s>installer</s>`],
  [3.2, `<g>✓</g> Node.js 22 found`],
  [3.45, `<g>✓</g> cloudflared downloaded`],
  [3.7, `<g>✓</g> installed in <s>~/.local/share/aegis</s>`],
  [3.95, `<g>✓</g> aegis.service started <s>(systemd user service)</s>`],
  [4.4, ``],
  [4.4, `Where would you like to set it up?`],
  [4.6, `<span class="sel">❯ Here, in this terminal</span>      <s>step by step, a minute or two</s>`],
  [4.6, `  In a browser                <s>on this machine, or your phone</s>`],
];
scene({
  id: "install", chapter: "Install", dur: 8,
  caption: "One line installs it. Node.js, cloudflared and the service come with it; nothing to configure by hand.",
  html: `
    <div class="f-term">
      <div class="f-bar"><i></i><i></i><i></i><div class="f-url mono">alex@pi: ~</div></div>
      <pre class="term"><span class="p">alex@pi:~$</span> <span class="tcmd"></span><span class="caret"></span>
<span class="out"></span></pre>
    </div>`,
  render(t, $) {
    $(".tcmd").textContent = typed(CMD, t, 0.4, 40);
    const lines = TERM.filter(([at]) => t >= at).map(([, l]) => l);
    if (t >= 5.6) lines.push(`<s>login</s>     alex`, `<s>password</s>  ${"•".repeat(clamp(Math.floor((t - 5.9) * 14), 0, 12))}`);
    if (t >= 6.5) lines.push(`<s>pack</s>      <g>✓</g> Selkies Forge  <g>✓</g> Termix  <g>✓</g> Burrow`);
    if (t >= 6.9) lines.push(`<s>domain</s>    example.com <s>(authorized in a browser)</s>`);
    if (t >= 7.3) lines.push(``, `<g>✓ Ready:</g> <u>https://aegis.example.com</u>`);
    $(".out").innerHTML = lines.join("\n");
    $(".caret").style.display = t > 2.8 ? "none" : "";
  },
});

// 3 · sign in (the real login page)
const HEX = "9f3a0c7e41d2b85f06ae1c93d47b20f8e5a1c6930b7d2f48ea51c0379b6d4e21f0a8c35d97b1e46a2c08f";
scene({
  id: "login", chapter: "Sign in", dur: 7,
  caption: "The real sign-in. Your password is sealed twice in the browser, with keys from an ML-KEM-768 + X25519 exchange, before it leaves. Cloudflare only ever sees ciphertext.",
  html: chrome("aegis.example.com", slot("login")) + `
    <div class="f-note seal"><p class="k">what leaves your browser</p><code class="hex"></code><p class="s">X-Wing key exchange (ML-KEM-768 + X25519) → AES-256-GCM, twice</p></div>`,
  cursor: [[0, 1100, 640], [0.6, "login@#username", 1], [1.6, "login@#password", 1], [3.0, "login@button[type=submit],form button:not(.peek)"], [3.25, "login@button[type=submit],form button:not(.peek)", 1], [7, 900, 560]],
  render(t, $, root, R) {
    const v = R("login"); if (!v) return;
    const u = v.querySelector("#username"), p = v.querySelector("#password"), body = v.querySelector(".x-body");
    u.value = typed("alex", t, 0.85, 9);
    p.value = "x".repeat(clamp(Math.floor((t - 1.85) * 10), 0, 12));
    body.dataset.state = t < 3.3 ? "idle" : t < 5.2 ? "busy" : "ok";
    const msg = v.querySelector("#msg"); if (msg) msg.textContent = t >= 5.2 ? "Welcome back" : "";
    const n = clamp(Math.floor((t - 3.4) * 40), 0, HEX.length);
    $(".seal").style.cssText = `opacity:${seg(t, 3.3, 3.6) * (1 - seg(t, 6.5, 6.9))};transform:translateY(${10 * (1 - eo(seg(t, 3.3, 3.7)))}px)`;
    $(".hex").textContent = n ? HEX.slice(0, n).replace(/(..)/g, "$1 ").trim() : "";
  },
});

// 4 · burrow: publish a port (the real Burrow page)
const BURROW = [[0, "list"], [1.45, "form"], [4.6, "formFilled"], [5.6, "detail"], [10.2, "created"]];
scene({
  id: "burrow", chapter: "Publish a port", dur: 14,
  caption: "Burrow gives any port its own HTTPS address. Port 3000, the name grafana, behind the Aegis login: published, with its own live traffic page.",
  html: chrome("aegis.example.com/__gate/tunnels", ["list", "form", "formFilled", "detail", "created"].map(slot).join("")),
  cursor: [[0, 700, 600], [1.0, "list@[data-act=new]"], [1.25, "list@[data-act=new]", 1], [1.9, "form@#fPort", 1], [2.8, "form@#fName", 1], [3.5, "form@#fSub", 1],
           [4.8, "formFilled@#fGo"], [5.3, "formFilled@#fGo", 1], [6.6, 760, 420], [9.6, "detail@.back"], [9.95, "detail@.back", 1], [11.6, "created@.tcard"], [14, "created@.tcard"]],
  render(t, $, root, R) {
    if (!R("list")) return;
    const cur = swap((s) => root.querySelectorAll(s), BURROW, t);
    if (cur === "form") {
      const f = R("form");
      f.querySelector("#fPort").value = typed("3000", t, 2.0, 9);
      f.querySelector("#fName").value = typed("Grafana", t, 2.9, 12);
      f.querySelector("#fSub").value = typed("grafana", t, 3.6, 12);
    }
    const d = R("detail"), toast = d?.querySelector(".toast");
    if (toast) toast.style.opacity = cur === "detail" ? seg(t, 5.7, 6) * (1 - seg(t, 8.4, 8.8)) : 0;
  },
});

// 5 · open it (the app on the other end: not mine, just something to look at)
const panel = (title, kind) => `<div class="g-p"><p>${title}</p><svg viewBox="0 0 300 110" preserveAspectRatio="none"><path class="ln ${kind}" d=""/><path class="ar ${kind}" d=""/></svg><b class="big"></b></div>`;
scene({
  id: "open", chapter: "Open it anywhere", dur: 6,
  caption: "Open the address from anywhere. One sign-in per browser covers every tunnel: the gate hands it a single-use 60-second ticket.",
  html: `<div class="f-win" style="left:${WX}px;top:${WY}px;width:${WW}px;height:${WH}px">
    <div class="f-bar"><i></i><i></i><i></i><div class="f-url"><svg viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v6H4z"/></svg><span class="u">https://grafana.example.com</span></div></div>
    <div class="f-body" style="top:${BAR}px">
    <div class="gate"><img src="${B}aegis-burrow.svg" alt=""><p>Signing you in…</p><code>one login per browser · single-use 60-second ticket</code><div class="bar"><i></i></div></div>
    <div class="app">
      <div class="g-top"><b>node-exporter</b><span>Last 15 minutes · refresh 5s</span></div>
      <div class="g-grid">${panel("CPU busy", "a")}${panel("Memory used", "b")}${panel("Network in", "c")}${panel("Disk I/O", "d")}</div>
    </div></div></div>`,
  cursor: [[0, 640, 360], [1, 700, 460], [6, 760, 500]],
  render(t, $, root) {
    const k = seg(t, 1.3, 1.7);
    $(".gate").style.opacity = 1 - k;
    $(".gate .bar i").style.width = 100 * eo(seg(t, 0.1, 1.3)) + "%";
    $(".app").style.opacity = k;
    const f = [(x) => 0.45 + 0.2 * Math.sin(x * 9 + t * 1.6) + 0.1 * Math.sin(x * 23 - t), (x) => 0.62 + 0.05 * Math.sin(x * 4 + t * 0.5), (x) => 0.3 + 0.25 * Math.abs(Math.sin(x * 7 - t * 2.1)), (x) => 0.2 + 0.18 * Math.sin(x * 15 + t * 3) ** 2];
    const big = [(v) => Math.round(v * 100) + "%", (v) => (v * 16).toFixed(1) + " GB", (v) => (v * 90).toFixed(0) + " Mb/s", (v) => (v * 200).toFixed(0) + " MB/s"];
    root.querySelectorAll(".g-p").forEach((p, i) => {
      const reveal = eo(seg(t, 1.6 + i * 0.15, 2.6 + i * 0.15));
      let d = "";
      for (let j = 0; j <= 60 * reveal; j++) { const x = j / 60; d += `${j ? "L" : "M"}${(x * 300).toFixed(1)} ${(110 - f[i](x) * 100).toFixed(1)}`; }
      p.querySelector(".ln").setAttribute("d", d);
      p.querySelector(".ar").setAttribute("d", d ? d + `L${(reveal * 300).toFixed(1)} 110L0 110Z` : "");
      p.querySelector(".big").textContent = reveal > 0.5 ? big[i](f[i](1)) : "";
    });
  },
});

// 6 · bulwark (the real dashboard, with what a scratch Bulwark saw)
const BW = [[0, "bwOverview"], [7.4, "bwLog"], [15.2, "bwWaves"], [20.6, "bwPatterns"], [24.4, "bwBlocklist"]];
const BWNOTES = [
  [1.8, 4.6, "bwOverview@.banner", "Critical: 74 addresses, one playbook. Bulwark flags it, with a forecast for the next hour."],
  [4.6, 7.0, "bwOverview@.grid.g4", "Every request judged in microseconds, inside the gateway"],
  [8.8, 14.6, "bwLog@tbody tr.d-block:not(.rv-hide),tbody tr.d-drop:not(.rv-hide),tbody tr:not(.rv-hide)", "Payloads are dropped before your app sees them"],
  [16.2, 20.2, "bwWaves@.alert", "Many addresses, one playbook: a campaign. Strict mode turns on by itself."],
  [21.4, 24.2, "bwPatterns@.card,.grid", "Named: MITRE ATT&CK, OWASP and the CVE, for every hit"],
  [25.1, 28.4, "bwBlocklist@table", "Two payloads ban an address on every tunnel at once"],
];
scene({
  id: "bulwark", chapter: "Bulwark", dur: 29,
  caption: "Bulwark, on by default in Aegis × Burrow. Everything here is its real dashboard, after a scratch copy judged eleven minutes of made-up traffic, attacks included.",
  captions: [[0, "Bulwark, on by default in Aegis × Burrow. This is its real dashboard, after a scratch copy judged eleven minutes of made-up traffic, attacks included."],
             [7.4, "The live log: every request in full. Who, what, where, what Bulwark decided, and how long it took."],
             [15.2, "Waves: surges, campaigns and clusters, each with a forecast. A critical one switches strict mode on, so the first payload bans."],
             [20.6, "Patterns: what they're after, by category, with the addresses and campaigns behind each."],
             [24.4, "The blocklist: every ban and why. Bans cover every tunnel and the dashboard, and export to nginx, iptables or CSV."]],
  html: `
    <div class="bw-intro"><img src="${B}bulwark.svg" alt=""><div><b>Bulwark</b><span>every request, judged before your app sees it</span></div></div>
    ${chrome("aegis.example.com/__gate/bulwark/", BW.map(([, n]) => slot(n)).join(""), "bwwin")}
    <div class="f-note bwn"><i></i><span></span></div>`,
  cursor: [[0, 1000, 620], [2.4, "bwOverview@.banner"], [5.6, "bwOverview@.grid.g4"], [6.9, "bwOverview@a[data-v=log]"], [7.25, "bwOverview@a[data-v=log]", 1],
           [10, 760, 380], [14.6, "bwLog@a[data-v=waves]"], [15.0, "bwLog@a[data-v=waves]", 1], [17.5, "bwWaves@.alert"], [20.0, "bwWaves@a[data-v=patterns]"], [20.4, "bwWaves@a[data-v=patterns]", 1],
           [22.6, 700, 360], [23.9, "bwPatterns@a[data-v=addresses]"], [24.25, "bwPatterns@a[data-v=addresses]", 1], [26.5, 720, 330], [29, 720, 330]],
  render(t, $, root, R, at) {
    const intro = seg(t, 0, 0.4) * (1 - seg(t, 1.3, 1.7));
    $(".bw-intro").style.cssText = `opacity:${intro};transform:translate(-50%,-50%) scale(${0.96 + 0.04 * eo(seg(t, 0, 0.6))})`;
    $(".bwwin").style.opacity = seg(t, 1.1, 1.6);
    if (!R("bwOverview")) return;
    swap((s) => root.querySelectorAll(s), BW, t);
    // the live log fills in: the oldest rows first, the newest arriving on top
    const log = R("bwLog"), rows = log?._rows;
    if (rows) {
      const lt = t - 7.4, show = clamp(Math.floor(6 + lt * 3.2), 6, rows.length);
      rows.forEach((r, i) => r.classList.toggle("rv-hide", i < rows.length - show));
    }
    const note = BWNOTES.find(([a, b]) => t >= a && t < b);
    const n = $(".bwn");
    if (note) {
      const p = at(note[2]);
      const k = seg(t, note[0], note[0] + 0.3) * (1 - seg(t, note[1] - 0.3, note[1]));
      n.querySelector("span").textContent = note[3];
      // just under what it's about, or above it when there's no room below
      const x = clamp(p ? p.cx : 640, 280, 1000), y = !p ? 120 : p.bottom + 64 < 690 ? p.bottom + 10 : Math.max(60, p.top - 56);
      n.style.cssText = `opacity:${k};transform:translate(${x}px,${y}px) translateX(-50%) scale(${0.96 + 0.04 * k})`;
    } else n.style.opacity = 0;
  },
});

// 7 · machines (the real Machines tab)
const MACH = [[0, "machines"], [3.6, "machinesDown"], [6.4, "machines"]];
scene({
  id: "machines", chapter: "Machines", dur: 9,
  caption: "Machines: link another box with one command. The gate checks each one every minute, calls it down only after three misses in a row, and marks the standby that takes over if this one stops.",
  html: chrome("aegis.example.com/__gate/tunnels#/machines", ["machines", "machinesDown"].map(slot).join("")) + `<div class="f-note mn"><i></i><span></span></div>`,
  cursor: [[0, 900, 600], [2, "machines@.fw-node.machine,.fl-node"], [5, 700, 560], [9, 720, 540]],
  render(t, $, root, R, at) {
    if (!R("machines")) return;
    swap((s) => root.querySelectorAll(s), MACH, t, 0.4);
    const n = $(".mn"), down = t >= 3.6 && t < 6.4, back = t >= 6.4 && t < 8.6;
    n.querySelector("span").textContent = down ? "desktop missed three checks in a row: down" : back ? "desktop answers again" : "";
    n.className = "f-note mn" + (down ? " err" : back ? " ok" : "");
    const p = at("machinesDown@.fw-node.machine.down,.fl-node.down");
    n.style.cssText = `opacity:${(down || back) ? 1 : 0};transform:translate(${p ? p.cx : 640}px,${p ? p.bottom + 10 : 600}px) translateX(-50%)`;
  },
});

// 8 · end
scene({
  id: "end", chapter: "Get it", dur: 6,
  caption: "Free and MIT-licensed. Node 18+ and nothing else. Bulwark comes with it.",
  html: `
    <div class="f-end">
      <img src="${B}aegis-burrow.svg" alt="">
      <h2>Aegis <span>×</span> Burrow</h2>
      <div class="e-cmd"><span>$</span> curl -fsSL https://raw.githubusercontent.com/alexd-aero/aegis-burrow/main/install.sh | bash</div>
      <p class="e-with"><img src="${B}bulwark.svg" alt=""> Bulwark on by default · <img src="${B}weft.svg" alt=""> addons in the Weft format</p>
      <p class="e-gh">github.com/alexd-aero · alex-aero.com</p>
    </div>`,
  render(t, $) {
    $(".f-end > img").style.cssText = `opacity:${seg(t, 0, 0.5)};transform:scale(${0.92 + 0.08 * eo(seg(t, 0, 0.8))})`;
    $(".f-end h2").style.opacity = seg(t, 0.3, 0.9);
    $(".e-cmd").style.opacity = seg(t, 0.8, 1.4);
    $(".e-with").style.opacity = seg(t, 1.4, 2);
    $(".e-gh").style.opacity = seg(t, 1.9, 2.5);
  },
});

const TOTAL = SCENES.reduce((s, x) => s + x.dur, 0);
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function film(host, { reduced = false } = {}) {
  host.innerHTML = `
    <div class="screen">
      <div class="stage">
        ${SCENES.map((s) => `<section class="sc sc-${s.id}">${s.html}</section>`).join("")}
        <div class="f-cursor"><svg viewBox="0 0 24 24"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.5-6.8L4 20z"/></svg><i></i></div>
        <div class="f-loading">loading the real screens…</div>
      </div>
      <button class="bigplay" type="button" aria-label="Play the film"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
      <p class="bigplay-label">Watch it work · ${fmt(SCENES.reduce((s, x) => s + x.dur, 0))}</p>
    </div>
    <div class="controls">
      <button class="pp" type="button" aria-label="Play"><svg viewBox="0 0 24 24"><path class="i-play" d="M8 5v14l11-7z"/><path class="i-pause" d="M7 5h4v14H7zM13 5h4v14h-4z"/><path class="i-replay" d="M12 5a7 7 0 1 1-7 7h2a5 5 0 1 0 5-5v3L7 6l5-4z"/></svg></button>
      <span class="tm">0:00</span>
      <div class="track"><div class="fill"></div>${SCENES.slice(1).map((s) => `<i class="tick" style="left:${(s.start / TOTAL) * 100}%"></i>`).join("")}
        <input type="range" min="0" max="${TOTAL * 10}" value="0" aria-label="Seek"></div>
      <span class="tm tot">${fmt(TOTAL)}</span>
      <span class="chap"></span>
      <button class="fs" type="button" aria-label="Full screen" title="Full screen (f)"><svg viewBox="0 0 24 24"><path class="i-full" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><path class="i-exit" d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg></button>
    </div>`;
  const stage = host.querySelector(".stage"), screen = host.querySelector(".screen");
  const views = new Map();               // snapshot name -> its shadow root
  const R = (name) => views.get(name) || null;
  const els = SCENES.map((s, i) => {
    const root = stage.children[i], cache = new Map();
    const $ = (sel) => { let e = cache.get(sel); if (!e) { e = root.querySelector(sel); cache.set(sel, e); } return e; };
    return { s, root, $ };
  });
  // "snap@selector, selector" -> the middle of the first match, in stage pixels
  let k = 1;
  function at(spec) {
    const [snap, sel] = spec.split("@");
    const v = R(snap); if (!v) return null;
    let el = null;
    for (const s of sel.split(",")) { try { el = v.querySelector(s.trim()); } catch {} if (el) break; }
    if (!el) return null;
    const r = el.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return { x: (r.left + Math.min(r.width / 2, 120) - sr.left) / k, y: (r.top + r.height / 2 - sr.top) / k,
             cx: (r.left + r.width / 2 - sr.left) / k, top: (r.top - sr.top) / k, bottom: (r.bottom - sr.top) / k };
  }
  const cur = stage.querySelector(".f-cursor"), ripple = cur.querySelector("i");
  const pp = host.querySelector(".pp"), range = host.querySelector("input"), fill = host.querySelector(".fill");
  const tm = host.querySelector(".tm"), chap = host.querySelector(".chap"), big = host.querySelector(".bigplay"), fsBtn = host.querySelector(".fs");
  const listeners = [];

  const fit = () => { k = screen.clientWidth / W; stage.style.transform = `scale(${k})`; };
  new ResizeObserver(fit).observe(screen);

  // the real screens: one JSON of snapshots, fetched when the film is first near the screen
  let loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    fetch(`assets/real/screens.json?v=${V}`).then((r) => r.json()).then((snaps) => {
      for (const el of stage.querySelectorAll(".rv[data-snap]")) {
        const s = snaps[el.dataset.snap]; if (!s) continue;
        const root = mountSnap(el, s);
        if (el.dataset.snap === "bwLog") el.shadowRoot._rows = [...root.querySelectorAll(s.rows || "tbody tr")];
        views.set(el.dataset.snap, root);
      }
      stage.classList.add("ready");
      draw();
    }).catch((e) => { console.warn("film screens:", e); stage.querySelector(".f-loading").textContent = "the screens didn't load"; });
  }

  let t = 0, playing = false, userPaused = false, last = 0, raf = 0, scene = -1, capNow = "", fresh = true;
  function cursorAt(kf, lt) {
    const pos = (f) => typeof f[1] === "string" ? at(f[1]) || { x: 640, y: 360 } : { x: f[1], y: f[2] };
    let i = 0;
    while (i < kf.length - 1 && kf[i + 1][0] <= lt) i++;
    const a = kf[i], b = kf[Math.min(i + 1, kf.length - 1)];
    const pa = pos(a), pb = pos(b);
    const e = b[0] > a[0] ? io(seg(lt, a[0], b[0])) : 1;
    let click = -1;
    for (const f of kf) { const c = typeof f[1] === "string" ? f[2] : f[3]; if (c && lt >= f[0] && lt - f[0] < 0.45) click = lt - f[0]; }
    return { x: pa.x + (pb.x - pa.x) * e, y: pa.y + (pb.y - pa.y) * e, click };
  }
  function draw() {
    let active = 0;
    els.forEach(({ s, root, $ }, i) => {
      const lt = t - s.start;
      const fadeIn = i === 0 ? 1 : clamp(lt / 0.35 + 1);
      const fadeOut = i === els.length - 1 ? 1 : clamp((s.dur - lt) / 0.35);
      const vis = lt > -0.35 && lt <= s.dur;
      root.style.opacity = vis ? Math.min(fadeIn, fadeOut) : 0;
      root.style.visibility = vis ? "visible" : "hidden";
      if (vis) { try { s.render(clamp(lt, 0, s.dur), $, root, R, at); } catch (e) { console.warn(s.id, e); } }
      if (lt >= 0 && lt < s.dur) active = i;
    });
    if (t >= TOTAL) active = els.length - 1;
    const a = SCENES[active], kf = a.cursor, lt = t - a.start;
    if (kf) {
      const p = cursorAt(kf, lt);
      cur.style.cssText = `opacity:${clamp(lt / 0.3) * clamp((a.dur - lt) / 0.3)};transform:translate(${p.x}px,${p.y}px)`;
      ripple.style.cssText = p.click >= 0 ? `opacity:${1 - p.click / 0.45};transform:translate(-50%,-50%) scale(${0.4 + p.click * 2.4})` : "opacity:0";
    } else cur.style.opacity = 0;
    fill.style.width = (t / TOTAL) * 100 + "%";
    range.value = Math.round(t * 10);
    tm.textContent = fmt(t);
    let cap = a.caption;
    if (a.captions) for (const [from, c] of a.captions) if (lt >= from) cap = c;
    if (active !== scene || cap !== capNow) { const changed = active !== scene; scene = active; capNow = cap; chap.textContent = a.chapter; listeners.forEach((f) => f(active, SCENES, cap, changed)); }
    host.classList.toggle("ended", t >= TOTAL);
    host.classList.toggle("started", !fresh);
  }
  function loop(now) {
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    t = Math.min(TOTAL, t + dt);
    draw();
    if (t >= TOTAL) { pause(); return; }
    raf = requestAnimationFrame(loop);
  }
  function play() {
    if (playing) return;
    load();
    if (t >= TOTAL || fresh) t = 0;
    fresh = false;
    playing = true; last = 0; host.classList.add("playing");
    pp.setAttribute("aria-label", "Pause");
    raf = requestAnimationFrame(loop);
  }
  function pause() { playing = false; cancelAnimationFrame(raf); host.classList.remove("playing"); pp.setAttribute("aria-label", "Play"); }
  function seek(s) { t = clamp(s, 0, TOTAL); draw(); }
  function poster() { t = 1.2; draw(); }

  // full screen: the real thing where the browser has it, a fixed overlay where it doesn't (iPhone)
  const isFs = () => document.fullscreenElement === host || document.webkitFullscreenElement === host || host.classList.contains("fs-on");
  async function toggleFs() {
    if (isFs()) {
      if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      host.classList.remove("fs-on"); document.documentElement.classList.remove("fs-lock");
      return;
    }
    const req = host.requestFullscreen || host.webkitRequestFullscreen;
    try { if (!req) throw 0; await req.call(host, { navigationUI: "hide" }); try { await screen.orientation?.lock?.("landscape"); } catch {} }
    catch { host.classList.add("fs-on"); document.documentElement.classList.add("fs-lock"); }
    if (!playing) { userPaused = false; play(); }
  }
  const fsSync = () => { host.classList.toggle("fs", isFs()); fsBtn.setAttribute("aria-label", isFs() ? "Exit full screen" : "Full screen"); requestAnimationFrame(fit); };
  document.addEventListener("fullscreenchange", fsSync); document.addEventListener("webkitfullscreenchange", fsSync);
  fsBtn.addEventListener("click", async (e) => { e.stopPropagation(); await toggleFs(); fsSync(); });

  pp.addEventListener("click", () => { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } });
  big.addEventListener("click", (e) => { e.stopPropagation(); userPaused = false; play(); });
  screen.addEventListener("click", () => { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } });
  screen.addEventListener("dblclick", async () => { await toggleFs(); fsSync(); });
  let wasPlaying = false;
  range.addEventListener("pointerdown", () => { wasPlaying = playing; fresh = false; pause(); load(); });
  range.addEventListener("input", () => seek(range.value / 10));
  range.addEventListener("change", () => { if (wasPlaying) play(); });
  host.addEventListener("keydown", async (e) => {
    if (e.key === " " || e.key === "k") { e.preventDefault(); pp.click(); }
    if (e.key === "f") { await toggleFs(); fsSync(); }
    if (e.key === "Escape" && host.classList.contains("fs-on")) { await toggleFs(); fsSync(); }
    if (e.key === "ArrowRight") seek(t + 5);
    if (e.key === "ArrowLeft") seek(t - 5);
  });

  new IntersectionObserver(([e]) => {
    if (e.intersectionRatio > 0) load();
    if (reduced) return;
    if (e.intersectionRatio >= 0.45 && !userPaused && !document.hidden && t < TOTAL) play();
    else if (e.intersectionRatio < 0.2 && !isFs()) pause();
  }, { threshold: [0, 0.2, 0.45, 0.7], rootMargin: "400px 0px" }).observe(screen);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  poster();
  return {
    scenes: SCENES, total: TOTAL,
    jump(i) { userPaused = false; fresh = false; load(); seek(SCENES[i].start + 0.01); play(); },
    onScene(f) { listeners.push(f); if (scene >= 0) f(scene, SCENES, capNow, true); },
    seek, play, pause,
  };
}
