// The Aegis × Burrow film: a 70-second walkthrough drawn in HTML.
// Every frame is a pure function of the time t, so the scrubber and the
// chapters can jump anywhere, the same way a video would.
import { ROWS } from "./film-data.js?v=4.0.0";

const W = 1280, H = 720;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x) => 1 - Math.pow(1 - x, 3);
const typed = (s, t, a, cps = 16) => s.slice(0, clamp(Math.floor((t - a) * cps), 0, s.length));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const B = "assets/brand/";

// a browser window: dots, the address, then whatever is inside
const win = (url, body, cls = "") => `
  <div class="f-win ${cls}">
    <div class="f-bar"><i></i><i></i><i></i><div class="f-url"><svg viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v6H4z"/></svg><span class="u">${url}</span></div></div>
    <div class="f-body">${body}</div>
  </div>`;
const aegisNav = (on) => `
  <div class="a-nav"><img src="${B}aegis.svg" alt=""><b>Aegis</b>
    ${["Home", "Termix", "Burrow", "Settings"].map((n) => `<span class="${n === on ? "on" : ""}">${n}</span>`).join("")}
    <em><i></i>LIVE</em></div>`;

/* ───────── the scenes ───────── */
const SCENES = [];
const scene = (o) => { o.start = SCENES.reduce((s, x) => s + x.dur, 0); SCENES.push(o); };

// 0 · title
scene({
  id: "title", chapter: "Aegis × Burrow", dur: 5,
  caption: "Aegis × Burrow: one post-quantum login in front of everything you run, on a tunnel engine.",
  html: `
    <div class="f-title">
      <svg class="t-logo" viewBox="0 0 128 128">
        <defs>
          <linearGradient id="ft-tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1b1f"/><stop offset="1" stop-color="#060607"/></linearGradient>
          <linearGradient id="ft-ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#bfc3c9"/></linearGradient>
          <radialGradient id="ft-light" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
          <clipPath id="ft-in"><path d="M64 26.5 38 35.5v21.5c0 19.6 11.2 35.4 26 42.6 14.8-7.2 26-23 26-42.6V35.5z"/></clipPath>
        </defs>
        <rect class="t-tile" x="3" y="3" width="122" height="122" rx="30" fill="url(#ft-tile)" stroke="rgba(255,255,255,.14)"/>
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
      <p class="t-by">a film in HTML · by alexd-aero</p>
    </div>`,
  render(t, $) {
    $(".t-logo").style.cssText = `opacity:${seg(t, 0, 0.5)};transform:scale(${0.9 + 0.1 * eo(seg(t, 0, 1.2))})`;
    $(".t-shield").style.strokeDashoffset = 1 - io(seg(t, 0.2, 1.6));
    $(".t-arch1").style.strokeDashoffset = 1 - io(seg(t, 0.9, 2));
    $(".t-arch2").style.strokeDashoffset = 1 - io(seg(t, 1.2, 2.2));
    const g = seg(t, 1.9, 2.5);
    $(".t-glow").style.opacity = g * (0.75 + 0.25 * Math.sin(t * 3));
    $(".t-dot").style.opacity = g;
    $(".t-name").style.cssText = `opacity:${seg(t, 1.8, 2.5)};transform:translateY(${12 * (1 - eo(seg(t, 1.8, 2.6)))}px)`;
    $(".t-tag").style.opacity = seg(t, 2.4, 3.1);
    $(".t-by").style.opacity = seg(t, 3, 3.6) * 0.6;
  },
});

// 1 · install
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
  caption: "One line installs it. Node.js, cloudflared and the service come with it, nothing to configure by hand.",
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

// 2 · sign in
const HEX = "9f3a0c7e41d2b85f06ae1c93d47b20f8e5a1c6930b7d2f48ea51c0379b6d4e21f0a8c35d97b1e46a2c08f";
scene({
  id: "login", chapter: "Sign in", dur: 9,
  caption: "Your password is sealed twice in your browser before it leaves. Anything in between, Cloudflare included, only sees ciphertext.",
  html: win("aegis.example.com", `
    <div class="l-wrap">
      <div class="l-card">
        <img src="${B}aegis.svg" alt="">
        <h3>Sign in</h3>
        <p class="sub">aegis.example.com</p>
        <label>Username</label><div class="fld f-user"><span></span><i class="c"></i></div>
        <label>Password</label><div class="fld f-pass"><span></span><i class="c"></i></div>
        <div class="btn-w">Sign in</div>
        <p class="ok-line"><i>✓</i> Signed in</p>
      </div>
      <div class="l-seal">
        <p class="k">what leaves your browser</p>
        <div class="st s1"><code>{ user: "alex", pass: "••••••••••" }</code></div>
        <div class="st s2"><span>sealed with K<sub>inner</sub></span><code>AES-256-GCM</code></div>
        <div class="st s3"><span>sealed again with K<sub>outer</sub></span><code>AES-256-GCM</code></div>
        <div class="st s4"><span>what anyone in between sees</span><code class="hex"></code></div>
        <p class="xw">keys from an <b>X-Wing</b> exchange: ML-KEM-768 + X25519, single-use</p>
      </div>
    </div>`),
  cursor: [[0, 980, 640], [0.6, 455, 300, 1], [1.7, 455, 372, 1], [3.1, 470, 438], [3.5, 470, 440, 1], [5, 520, 500], [9, 520, 500]],
  render(t, $) {
    $(".f-user span").textContent = typed("alex", t, 0.85, 9);
    $(".f-pass span").textContent = "•".repeat(clamp(Math.floor((t - 1.95) * 10), 0, 10));
    $(".f-user").classList.toggle("focus", t > 0.6 && t < 1.7);
    $(".f-pass").classList.toggle("focus", t > 1.7 && t < 3.5);
    $(".btn-w").classList.toggle("press", t > 3.5 && t < 3.75);
    const st = [3.8, 4.4, 5, 5.6];
    ["s1", "s2", "s3", "s4"].forEach((s, i) => {
      const k = seg(t, st[i], st[i] + 0.35);
      $("." + s).style.cssText = `opacity:${0.18 + 0.82 * k};transform:translateX(${10 * (1 - eo(k))}px)`;
      $("." + s).classList.toggle("lit", t > st[i] && t < (st[i + 1] ?? 99));
    });
    const n = clamp(Math.floor((t - 5.6) * 34), 0, HEX.length);
    $(".hex").textContent = n ? HEX.slice(0, n).replace(/(..)/g, "$1 ").trim() + (n < HEX.length ? " ▍" : " …") : "";
    $(".xw").style.opacity = seg(t, 6.3, 6.9);
    $(".ok-line").style.opacity = seg(t, 7.2, 7.6);
  },
});

// 3 · burrow: publish a port
const spark = (t, seed, n = 28, w = 120, h = 26) => {
  let pts = [];
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * w;
    const v = 0.5 + 0.28 * Math.sin(i * 0.9 + seed + t * 2.2) + 0.2 * Math.sin(i * 2.3 + seed * 3 - t * 1.3);
    pts.push(`${x.toFixed(1)},${(h - v * h).toFixed(1)}`);
  }
  return pts.join(" ");
};
const tunnelRow = (cls, name, port, access) => `
  <div class="tn ${cls}"><i class="dot"></i>
    <div class="nm"><b>${name}</b><span>→ 127.0.0.1:${port}</span></div>
    <span class="chip">${access}</span>
    <svg class="sp" viewBox="0 0 120 26"><polyline points=""/></svg>
    <span class="cl"></span><span class="cp">⧉</span></div>`;
scene({
  id: "burrow", chapter: "Publish a port", dur: 13,
  caption: "Burrow gives any port its own HTTPS address. Pick who can open it: your Aegis login, a password of its own, or anyone.",
  html: win("aegis.example.com/burrow", `
    ${aegisNav("Burrow")}
    <div class="b-page">
      <div class="b-head"><img src="${B}burrow.svg" alt=""><div><h3>Burrow</h3><p>Any port on this machine, at its own HTTPS address.</p></div><span class="btn-w new">+ New tunnel</span></div>
      <div class="tabs"><span class="on">Tunnels <i class="n">2</i></span><span>Addons <i>4</i></span><span>Machines <i>3</i></span></div>
      <div class="tlist">
        <div class="tn-new">${tunnelRow("fresh", "grafana.example.com", 3000, "Aegis login")}</div>
        ${tunnelRow("a", "termix.example.com", 4300, "Aegis login")}
        ${tunnelRow("b", "forge.example.com", 8787, "Aegis login")}
      </div>
    </div>
    <div class="dlg-wrap"><div class="dlg">
      <h4>New tunnel</h4>
      <label>Port on this machine</label><div class="fld d-port"><span></span><i class="c"></i></div>
      <label>Address</label><div class="fld d-addr"><span></span><i class="c"></i><em>.example.com</em></div>
      <label>Who can open it</label>
      <div class="seg"><span class="on">Aegis login</span><span>Its own password</span><span>Anyone</span></div>
      <div class="d-foot"><span class="ghost">Cancel</span><span class="btn-w pub">Publish</span></div>
    </div></div>
    <div class="toast"><i>✓</i> grafana.example.com is live</div>`),
  cursor: [[0, 640, 600], [1.0, 1048, 214], [1.25, 1048, 214, 1], [1.8, 560, 300, 1], [2.6, 560, 372, 1], [3.9, 520, 446], [4.2, 520, 446, 1], [4.9, 790, 520], [5.15, 790, 520, 1], [6.5, 900, 420], [9.6, 1102, 270], [9.85, 1102, 270, 1], [11.3, 330, 262], [12.4, 330, 262, 1], [13, 330, 262]],
  render(t, $, root) {
    const dlg = seg(t, 1.3, 1.6) * (1 - seg(t, 5.2, 5.45));
    $(".dlg-wrap").style.cssText = `opacity:${dlg};pointer-events:none`;
    $(".dlg").style.transform = `translateY(${14 * (1 - eo(seg(t, 1.3, 1.7)))}px) scale(${0.98 + 0.02 * eo(seg(t, 1.3, 1.7))})`;
    $(".d-port span").textContent = typed("3000", t, 2.0, 9);
    $(".d-addr span").textContent = typed("grafana", t, 2.8, 10);
    $(".d-port").classList.toggle("focus", t > 1.8 && t < 2.6);
    $(".d-addr").classList.toggle("focus", t > 2.6 && t < 4.2);
    $(".pub").classList.toggle("press", t > 5.15 && t < 5.4);
    $(".new").classList.toggle("press", t > 1.25 && t < 1.45);
    const grow = eo(seg(t, 5.4, 5.9));
    $(".tn-new").style.cssText = `height:${grow * 64}px;opacity:${grow}`;
    const fresh = $(".fresh");
    const live = t > 7.2;
    fresh.classList.toggle("starting", !live);
    fresh.querySelector(".cl").textContent = live ? `${t > 8.6 ? 2 : 1} client${t > 8.6 ? "s" : ""}` : "starting · DNS + tunnel";
    for (const [cls, seed, n] of [["fresh", 1, live ? 1 : 0], ["a", 4, 1], ["b", 7, 1]]) {
      const row = root.querySelector("." + cls);
      row.querySelector("polyline").setAttribute("points", n ? spark(t, seed) : "");
      if (cls !== "fresh") row.querySelector(".cl").textContent = cls === "a" ? "1 client" : "3 clients";
    }
    $(".n").textContent = t > 5.4 ? 3 : 2;
    $(".toast").style.cssText = `opacity:${seg(t, 7.3, 7.6) * (1 - seg(t, 9.3, 9.6))};transform:translateY(${10 * (1 - eo(seg(t, 7.3, 7.7)))}px)`;
    fresh.querySelector(".cp").textContent = t > 9.85 && t < 11 ? "copied" : "⧉";
    fresh.classList.toggle("hov", t > 11.3);
  },
});

// 4 · open it
const panel = (title, kind) => `<div class="g-p"><p>${title}</p><svg viewBox="0 0 300 110" preserveAspectRatio="none"><path class="ln ${kind}" d=""/><path class="ar ${kind}" d=""/></svg><b class="big"></b></div>`;
scene({
  id: "open", chapter: "Open it anywhere", dur: 8,
  caption: "Open the address from anywhere. One sign-in per browser covers every tunnel: it passes a single-use 60-second ticket.",
  html: win("https://grafana.example.com", `
    <div class="tabsbar"><span>Aegis</span><span class="on">grafana.example.com</span></div>
    <div class="gate"><img src="${B}aegis.svg" alt=""><p>Signing you in…</p><code>one login per browser · single-use 60-second ticket</code><div class="bar"><i></i></div></div>
    <div class="app">
      <div class="g-top"><b>node-exporter</b><span>Last 15 minutes · refresh 5s</span></div>
      <div class="g-grid">${panel("CPU busy", "a")}${panel("Memory used", "b")}${panel("Network in", "c")}${panel("Disk I/O", "d")}</div>
    </div>`),
  cursor: [[0, 330, 230], [1, 700, 460], [8, 760, 500]],
  render(t, $, root) {
    const k = seg(t, 1.5, 1.9);
    $(".gate").style.opacity = 1 - k;
    $(".gate .bar i").style.width = 100 * eo(seg(t, 0.2, 1.5)) + "%";
    $(".app").style.opacity = k;
    const f = [(x) => 0.45 + 0.2 * Math.sin(x * 9 + t * 1.6) + 0.1 * Math.sin(x * 23 - t), (x) => 0.62 + 0.05 * Math.sin(x * 4 + t * 0.5), (x) => 0.3 + 0.25 * Math.abs(Math.sin(x * 7 - t * 2.1)), (x) => 0.2 + 0.18 * Math.sin(x * 15 + t * 3) ** 2];
    const big = [(v) => Math.round(v * 100) + "%", (v) => (v * 16).toFixed(1) + " GB", (v) => (v * 90).toFixed(0) + " Mb/s", (v) => (v * 200).toFixed(0) + " MB/s"];
    root.querySelectorAll(".g-p").forEach((p, i) => {
      const reveal = eo(seg(t, 1.8 + i * 0.15, 2.8 + i * 0.15));
      let d = "";
      const n = 60;
      for (let j = 0; j <= n * reveal; j++) { const x = j / n; d += `${j ? "L" : "M"}${(x * 300).toFixed(1)} ${(110 - f[i](x) * 100).toFixed(1)}`; }
      p.querySelector(".ln").setAttribute("d", d);
      p.querySelector(".ar").setAttribute("d", d ? d + `L${(reveal * 300).toFixed(1)} 110L0 110Z` : "");
      p.querySelector(".big").textContent = reveal > 0.5 ? big[i](f[i](1)) : "";
    });
  },
});

// 5 · bulwark
const bwRow = ([, m, p, ip, kind, cat, color, ban]) => `<div class="r ${kind}${ban ? " ban" : ""}"><span class="ip">${ip}</span><span class="pth"><s>${m}</s> ${esc(p.length > 46 ? p.slice(0, 46) + "…" : p)}</span><span class="ct" style="--cc:${color || "#5b616a"}">${cat ? esc(cat) : "clean"}</span><span class="vd">${ban ? "banned · every tunnel" : kind === "drop" ? "dropped" : kind === "warn" ? "probe" : "through"}</span></div>`;
scene({
  id: "bulwark", chapter: "Bulwark", dur: 13,
  caption: "Bulwark judges every request before your app sees it. It names the attack, spots the wave, and bans the address on every tunnel at once.",
  html: win("aegis.example.com/bulwark", `
    <div class="bw">
      <div class="bw-top"><img src="${B}bulwark.svg" alt=""><b>Bulwark</b>
        <span class="on">Live</span><span>Overview</span><span>Patterns</span><span>Lists</span><span>Inspector</span>
        <em><i></i>guarding 3 tunnels</em></div>
      <div class="kpis"><div><b class="k1">0</b><span>requests</span></div><div><b class="k2">0</b><span>dropped</span></div><div><b class="k3">0</b><span>banned</span></div><div><b class="k4">~3 µs</b><span>a decision</span></div></div>
      <div class="bw-grid">
        <div class="log"><div class="lh"><span>address</span><span>request</span><span>category</span><span>verdict</span></div><div class="rows"></div></div>
        <div class="side">
          <div class="wave"><p class="wt"><i></i> Wave · secret hunting</p><p class="wd"><b class="wn">0</b> addresses, one playbook<br><span>/.env · /.git/config</span></p><svg viewBox="0 0 240 50" preserveAspectRatio="none"><path class="wl" d=""/></svg><p class="strict">strict mode on</p></div>
          <div class="after"><p class="k">what they're after</p><div class="bars"></div></div>
        </div>
      </div>
    </div>`),
  render(t, $, root) {
    const seen = ROWS.filter((r) => r[0] <= t);
    $(".rows").innerHTML = seen.slice(-11).reverse().map(bwRow).join("");
    const first = root.querySelector(".rows .r");
    if (first) first.style.opacity = clamp((t - seen[seen.length - 1][0]) / 0.25);
    $(".k1").textContent = (18342 + seen.length * 7).toLocaleString("en-US");
    $(".k2").textContent = seen.filter((r) => r[4] === "drop").length;
    $(".k3").textContent = seen.filter((r) => r[7]).length + 41;
    const wave = seg(t, 4.4, 4.9);
    $(".wave").style.cssText = `opacity:${wave};transform:translateY(${12 * (1 - eo(wave))}px)`;
    $(".wn").textContent = new Set(seen.filter((r) => r[0] > 4.2 && r[0] < 8.4 && r[3].startsWith("203.")).map((r) => r[3])).size;
    let d = "";
    for (let i = 0; i <= 48; i++) { const x = i / 48, tt = x * 13; if (tt > t) break; const v = tt > 4.2 && tt < 8.4 ? 0.85 - 0.25 * Math.cos((tt - 4.2) * 1.5) : 0.15 + 0.06 * Math.sin(tt * 4); d += `${i ? "L" : "M"}${x * 240} ${50 - v * 46}`; }
    $(".wl").setAttribute("d", d);
    $(".strict").style.opacity = seg(t, 5.6, 6);
    const counts = {};
    for (const r of seen) if (r[5]) counts[r[5]] = [(counts[r[5]]?.[0] || 0) + 1, r[6]];
    const top = Object.entries(counts).sort((a, b) => b[1][0] - a[1][0]).slice(0, 5);
    const max = top[0]?.[1][0] || 1;
    $(".bars").innerHTML = top.map(([c, [n, col]]) => `<div class="bar"><span>${esc(c)}</span><i style="width:${(n / max) * 100}%;background:${col}"></i><b>${n}</b></div>`).join("");
  },
});

// 6 · machines
const MACH = [["nas", "4 cores · 31% load", 150], ["vps", "relay for *.tunnel", 330], ["desktop", "through its agent", 510]];
scene({
  id: "machines", chapter: "Machines", dur: 8,
  caption: "Link another machine with one command. The gate checks each one every minute and only calls it down after three misses in a row.",
  html: win("aegis.example.com/burrow#machines", `
    <div class="m-canvas">
      <svg class="m-lines" viewBox="0 0 1098 600">${MACH.map((_, i) => `<path class="ml l${i}" pathLength="1" d="M330 330 C 430 330, 420 ${MACH[i][2] + 34}, 520 ${MACH[i][2] + 34}"/>`).join("")}
        ${MACH.map((_, i) => `<path class="ma ap${i}" pathLength="1" d="M770 ${MACH[i][2] + 34} C 820 ${MACH[i][2] + 34}, 820 ${MACH[i][2] + 34}, 860 ${MACH[i][2] + 34}"/>`).join("")}
        <g class="pk"></g></svg>
      <div class="hub"><img src="${B}aegis-burrow.svg" alt=""><b>this gate</b><span>aegis.example.com</span></div>
      ${MACH.map(([n, s, y], i) => `<div class="mc m${i}" style="top:${y}px"><i class="dot"></i><b>${n}</b><span class="ms">${s}</span></div>`).join("")}
      <div class="apps" style="top:150px">Termix · Bulwark</div>
      <div class="apps" style="top:330px">Burrow relay</div>
      <div class="apps" style="top:510px">Selkies Forge · 3 desktops</div>
      <div class="m-note"></div>
    </div>`),
  cursor: [[0, 760, 520], [6, 640, 560], [6.8, 640, 545], [8, 640, 545]],
  render(t, $, root) {
    MACH.forEach((_, i) => {
      root.querySelector(".l" + i).style.strokeDashoffset = 1 - io(seg(t, 0.3 + i * 0.2, 1.4 + i * 0.2));
      root.querySelector(".ap" + i).style.strokeDashoffset = 1 - io(seg(t, 1.2 + i * 0.2, 1.9 + i * 0.2));
      root.querySelector(".m" + i).style.opacity = seg(t, 0.6 + i * 0.2, 1 + i * 0.2);
    });
    const down = t > 3.4 && t < 5.8;
    root.querySelector(".l2").classList.toggle("down", down);
    root.querySelector(".m2").classList.toggle("down", down);
    root.querySelector(".m2 .ms").textContent = t < 3.4 ? "through its agent" : down ? "missed 3 checks · down" : "back · through its agent";
    $(".m-note").textContent = down ? "desktop missed three checks in a row" : t > 5.8 ? "desktop is back" : "";
    $(".m-note").style.opacity = t > 3.4 && t < 7.4 ? 1 : 0;
    let g = "";
    MACH.forEach((_, i) => {
      if (i === 2 && down) return;
      for (let j = 0; j < 2; j++) {
        const k = ((t * 0.45 + j * 0.5 + i * 0.17) % 1);
        if (t < 1.6) continue;
        const p = root.querySelector(".l" + i), L = p.getTotalLength(), pt = p.getPointAtLength(k * L);
        g += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3.5"/>`;
      }
    });
    $(".pk").innerHTML = g;
  },
});

// 7 · end
scene({
  id: "end", chapter: "Get it", dur: 6,
  caption: "Free and MIT-licensed. Node 18+ and nothing else.",
  html: `
    <div class="f-end">
      <img src="${B}aegis-burrow.svg" alt="">
      <h2>Aegis <span>×</span> Burrow</h2>
      <div class="e-cmd"><span>$</span> curl -fsSL https://raw.githubusercontent.com/alexd-aero/aegis-burrow/main/install.sh | bash</div>
      <p class="e-with"><img src="${B}bulwark.svg" alt=""> with Bulwark on by default · <img src="${B}weft.svg" alt=""> addons in the Weft format</p>
      <p class="e-gh">github.com/alexd-aero/aegis-burrow</p>
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

// where the cursor is at t, from a scene's keyframes [t, x, y, click]
function cursorAt(kf, t) {
  let i = 0;
  while (i < kf.length - 1 && kf[i + 1][0] <= t) i++;
  const a = kf[i], b = kf[Math.min(i + 1, kf.length - 1)];
  const k = b[0] > a[0] ? io(seg(t, a[0], b[0])) : 1;
  let click = -1;
  for (const f of kf) if (f[3] && t >= f[0] && t - f[0] < 0.45) click = t - f[0];
  return { x: a[1] + (b[1] - a[1]) * k, y: a[2] + (b[2] - a[2]) * k, click };
}

export function film(host, { reduced = false } = {}) {
  host.innerHTML = `
    <div class="screen">
      <div class="stage">
        ${SCENES.map((s) => `<section class="sc sc-${s.id}">${s.html}</section>`).join("")}
        <div class="f-cursor"><svg viewBox="0 0 24 24"><path d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.5-6.8L4 20z"/></svg><i></i></div>
      </div>
      <button class="bigplay" type="button" aria-label="Play the film"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
    </div>
    <div class="controls">
      <button class="pp" type="button" aria-label="Play"><svg viewBox="0 0 24 24"><path class="i-play" d="M8 5v14l11-7z"/><path class="i-pause" d="M7 5h4v14H7zM13 5h4v14h-4z"/><path class="i-replay" d="M12 5a7 7 0 1 1-7 7h2a5 5 0 1 0 5-5v3L7 6l5-4z"/></svg></button>
      <span class="tm">0:00</span>
      <div class="track"><div class="fill"></div>${SCENES.slice(1).map((s) => `<i class="tick" style="left:${(s.start / TOTAL) * 100}%"></i>`).join("")}
        <input type="range" min="0" max="${TOTAL * 10}" value="0" aria-label="Seek"></div>
      <span class="tm tot">${fmt(TOTAL)}</span>
      <span class="chap"></span>
    </div>`;
  const stage = host.querySelector(".stage"), screen = host.querySelector(".screen");
  const els = SCENES.map((s, i) => {
    const root = stage.children[i];
    const cache = new Map();
    const $ = (sel) => { let e = cache.get(sel); if (!e) { e = root.querySelector(sel); cache.set(sel, e); } return e; };
    return { s, root, $ };
  });
  const cur = stage.querySelector(".f-cursor"), ripple = cur.querySelector("i");
  const pp = host.querySelector(".pp"), range = host.querySelector("input"), fill = host.querySelector(".fill");
  const tm = host.querySelector(".tm"), chap = host.querySelector(".chap"), big = host.querySelector(".bigplay");
  const listeners = [];

  new ResizeObserver(() => { stage.style.transform = `scale(${screen.clientWidth / W})`; }).observe(screen);

  let t = 0, playing = false, userPaused = false, last = 0, raf = 0, scene = -1;
  function draw() {
    let active = 0;
    els.forEach(({ s, root, $ }, i) => {
      const lt = t - s.start;
      const fadeIn = i === 0 ? 1 : clamp(lt / 0.35 + 1);   // overlaps the previous scene's last 0.35 s
      const fadeOut = i === els.length - 1 ? 1 : clamp((s.dur - lt) / 0.35);
      const vis = lt > -0.35 && lt <= s.dur;
      root.style.opacity = vis ? Math.min(fadeIn, fadeOut) : 0;
      root.style.visibility = vis ? "visible" : "hidden";
      if (vis) { s.render(clamp(lt, 0, s.dur), $, root); }
      if (lt >= 0 && lt < s.dur) active = i;
    });
    if (t >= TOTAL) active = els.length - 1;
    const a = SCENES[active], kf = a.cursor;
    if (kf) {
      const p = cursorAt(kf, t - a.start);
      cur.style.cssText = `opacity:${clamp((t - a.start) / 0.3) * clamp((a.dur - (t - a.start)) / 0.3)};transform:translate(${p.x}px,${p.y}px)`;
      ripple.style.cssText = p.click >= 0 ? `opacity:${1 - p.click / 0.45};transform:translate(-50%,-50%) scale(${0.4 + p.click * 2.4})` : "opacity:0";
    } else cur.style.opacity = 0;
    fill.style.width = (t / TOTAL) * 100 + "%";
    range.value = Math.round(t * 10);
    tm.textContent = fmt(t);
    if (active !== scene) { scene = active; chap.textContent = a.chapter; listeners.forEach((f) => f(active, SCENES)); }
    host.classList.toggle("ended", t >= TOTAL);
    host.classList.toggle("started", t > 0.05);
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
    if (t >= TOTAL) t = 0;
    playing = true; last = 0; host.classList.add("playing");
    pp.setAttribute("aria-label", "Pause");
    raf = requestAnimationFrame(loop);
  }
  function pause() { playing = false; cancelAnimationFrame(raf); host.classList.remove("playing"); pp.setAttribute("aria-label", "Play"); }
  function seek(s) { t = clamp(s, 0, TOTAL); draw(); }

  pp.addEventListener("click", () => { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } });
  big.addEventListener("click", () => { userPaused = false; play(); });
  screen.addEventListener("click", (e) => { if (e.target.closest(".bigplay")) return; if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } });
  let wasPlaying = false;
  range.addEventListener("pointerdown", () => { wasPlaying = playing; pause(); });
  range.addEventListener("input", () => seek(range.value / 10));
  range.addEventListener("change", () => { if (wasPlaying) play(); });
  host.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "k") { e.preventDefault(); pp.click(); }
    if (e.key === "ArrowRight") seek(t + 5);
    if (e.key === "ArrowLeft") seek(t - 5);
  });

  // play while it's on screen, unless someone paused it
  if (!reduced) {
    new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.45 && !userPaused && !document.hidden && t < TOTAL) play();
      else if (e.intersectionRatio < 0.2) pause();
    }, { threshold: [0, 0.2, 0.45, 0.7] }).observe(screen);
    document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  }
  seek(reduced ? 3.2 : 0);
  return {
    scenes: SCENES, total: TOTAL,
    jump(i) { userPaused = false; seek(SCENES[i].start + 0.01); play(); },
    onScene(f) { listeners.push(f); f(scene, SCENES); },
    seek, play, pause,
  };
}
