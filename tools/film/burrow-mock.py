# Serves Aegis × Burrow's real front end (public/) with a pretend API: demo data only.
import json, os, sys, time, math, random
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
PUB = os.path.expanduser(os.environ.get("AEGIS_PUBLIC", "~/pi-work/aegis-burrow/public"))
STATE = {"grafana": False, "down": False}
def spark(seed, n=40, base=20, amp=14):
    r = random.Random(seed); return [max(0, round(base + amp * math.sin(i / 3 + seed) + r.uniform(-6, 6))) for i in range(n)]
def tun(port, sub, name, access, rpm, online, clients, out, reqs, seed, ms, extra=None):
    t = {"port": port, "sub": sub, "name": name, "title": name, "url": f"https://{sub}.example.com", "host": f"{sub}.example.com", "enabled": True,
         "access": access, "kind": "port", "targetHost": "127.0.0.1", "targetPort": port, "health": {"up": True, "ms": ms}, "dns": {"ready": True},
         "spark": spark(seed), "reqPerMin": rpm, "active": max(1, online), "online": online, "clients": clients, "wsActive": 0,
         "totals": {"bytesOut": out, "bytesIn": out // 9, "requests": reqs}, "also": [], "favicon": None, "scheme": "http"}
    if extra: t.update(extra)
    return t
def tunnels():
    L = [tun(4300, "termix", "Termix", "login", 42, 1, 3, 812_000_000, 48_210, 1, 6, {"wsActive": 2}),
         tun(8080, "blog", "Blog", "public", 118, 9, 214, 3_400_000_000, 391_004, 2, 11),
         tun(8090, "files", "Files", "password", 7, 1, 4, 22_600_000_000, 9_120, 3, 14),
         tun(8787, "forge", "Selkies Forge", "login", 19, 1, 2, 5_100_000_000, 12_880, 4, 4)]
    if STATE["grafana"]:
        age = time.time() - STATE["grafana"]
        g = tun(3000, "grafana", "Grafana", "login", 0 if age < 3 else 26, 0 if age < 3 else 1, 0 if age < 3 else 1, 0 if age < 3 else 4_200_000, 0 if age < 3 else 310, 9, 9)
        if age < 3: g["dns"] = {"ready": False}; g["spark"] = [0] * 40
        L.insert(0, g)
    return L
def detail(t):
    r = random.Random(t["port"]); now = time.time() * 1000
    mins = [{"req": max(0, int(18 + 14 * math.sin(i / 9) + r.uniform(-5, 6))) if i > 104 else 0, "err": 1 if i in (112, 117) else 0,
             "outB": int(r.uniform(0.2e6, 1.4e6)) if i > 104 else 0, "inB": int(r.uniform(2e4, 9e4)) if i > 104 else 0} for i in range(120)]
    secs = [{"req": r.choice([0, 0, 1, 1, 2, 3, 5])} for i in range(60)]
    ips = [("2001:db8:11::a", "US", "Safari 18 · macOS"), ("2001:db8:12::7", "DE", "Chrome 131 · Windows"), ("2001:db8:1c::3", "GB", "Firefox 132 · Linux")]
    paths = ["/api/ds/query", "/d/node-exporter?refresh=5s", "/public/build/app.js", "/api/dashboards/home", "/avatar/7f3a", "/api/search?query=cpu", "/api/frontend/settings"]
    d = dict(t)
    d.update({"status": {"2xx": 291, "3xx": 12, "4xx": 6, "5xx": 1}, "totals": {"requests": 310, "errors": 1, "bytesOut": 4_200_000, "bytesIn": 210_000, "ws": 2},
        "seconds": secs, "minutes": mins, "latency": {"p50": 9, "p95": 41}, "first": now - 14 * 60e3, "blocked": [], "ipChecks": True,
        "target": f"http://127.0.0.1:{t['port']}", "health": {"up": True, "ms": 9, "checked": now - 4000}, "healthSince": now - 14 * 60e3, "preserveHost": False,
        "dns": {"ok": True}, "created": now - 15 * 60e3, "pickable": [], "domains": [], "lockSet": None,
        "clientList": [{"ip": ip, "country": cc, "agent": ag, "requests": [212, 71, 27][k], "bytesOut": [3_100_000, 820_000, 280_000][k], "active": [2, 1, 0][k],
                        "first": now - [14, 9, 3][k] * 60e3, "last": now - [1, 6, 50][k] * 1000, "shield": None} for k, (ip, cc, ag) in enumerate(ips)],
        "recent": [{"t": now - k * 2300, "method": "GET", "path": paths[k % len(paths)], "status": 200 if k % 9 else 304, "ms": 6 + (k * 7) % 40, "bytes": 1200 + (k * 9137) % 90000,
                    "ip": ips[k % 3][0], "country": ips[k % 3][1]} for k in range(12)]})
    return d
ME = {"user": "alex", "termix": True, "modules": {"burrow": True, "fleet": True, "termix": True}, "pages": {"installed": False}, "extensions": [{"id": "bulwark"}],
      "dashboards": [], "notices": {"list": [], "unread": 0}, "version": "2.39.0"}
def api(path, method, body):
    p = path.split("?")[0]
    if p == "/__gate/api/me": return ME
    if p == "/__gate/api/tunnels" and method == "GET": return {"tunnels": tunnels(), "mode": "domain", "pattern": "NAME.example.com"}
    if p == "/__gate/api/tunnels" and method == "POST": STATE["grafana"] = time.time(); return tunnels()[0]
    if p.startswith("/__gate/api/tunnels/") and p.split("/")[-1].isdigit():
        port = int(p.split("/")[-1]); t = next((x for x in tunnels() if x["port"] == port), tunnels()[0]); return detail(t)
    if p == "/__gate/api/fleet":
        now = time.time() * 1000; G = 1024 ** 3
        def mach(i, name, os_, via, load, cores, mem, memT, du, dt, apps, up=True, err=None, standby=False):
            return {"id": i, "name": name, "os": os_, "up": up, "misses": 0, "lastError": err, "standby": standby, "via": via, "lastSeen": now - (5000 if up else 190000),
                    "specs": {"cores": cores, "mem": memT}, "usage": {"load": load, "cores": cores, "memUsed": mem, "memTotal": memT, "disk": {"used": du, "total": dt}}, "apps": apps}
        down = STATE["down"]
        return {"enabled": True, "hub": {"name": "pi5 (this gate)", "version": "2.39.0"},
                "here": [{"id": "termix", "name": "Termix", "version": "1.9"}, {"id": "bulwark", "name": "Bulwark", "version": "1.9.0"}],
                "catalog": [{"id": "termix", "name": "Termix"}, {"id": "bulwark", "name": "Bulwark"}, {"id": "selkies-forge", "name": "Selkies Forge"}, {"id": "aegis-burrow", "name": "Aegis × Burrow"}],
                "machines": [mach("nas", "nas", "Debian 13", "ssh", 1.2, 4, 5.1 * G, 16 * G, 2.1e12, 8e12, [{"id": "selkies-forge", "name": "Selkies Forge", "version": "2.0.1"}]),
                             mach("vps", "vps (VPS)", "Ubuntu 24.04", "ssh", 0.2, 2, 0.6 * G, 2 * G, 9e9, 40e9, [{"id": "aegis-burrow", "name": "Aegis × Burrow", "version": "2.39.0"}], standby=True),
                             mach("desk", "desktop", "Ubuntu 26.04", "agent", 3.1, 16, 21 * G, 64 * G, 6e11, 2e12, [{"id": "selkies-forge", "name": "Selkies Forge", "version": "2.0.1"}, {"id": "termix", "name": "Termix", "version": "1.9"}],
                                  up=not down, err="no answer for 3 checks" if down else None)]}
    if p.startswith("/__gate/api/fleet/self"): return {"d": {}}
    if p == "/__gate/api/integrations": return {"integrations": []}
    if p == "/__gate/api/addons/updates": return {"updates": []}
    if p == "/__gate/api/addons/down": return {"down": []}
    if p == "/__gate/api/relay/doctor": return {"last": None}
    if p == "/__gate/api/shield": return {"stats": {"bans": 0}}
    if p == "/__gate/api/addon": return {}
    if p == "/__gate/api/notices": return {"list": [], "unread": 0}
    if p == "/__gate/api/addons": return {"addons": []}
    if p == "/__gate/api/ports": return {"ports": [{"port": 3000, "addrs": ["127.0.0.1"], "local": True, "process": "grafana"}, {"port": 4300, "addrs": ["127.0.0.1"], "local": True, "process": "node", "tunneled": True},
                                                  {"port": 8080, "addrs": ["0.0.0.0"], "process": "caddy", "tunneled": True}, {"port": 9090, "addrs": ["127.0.0.1"], "local": True, "process": "prometheus"}, {"port": 5432, "addrs": ["127.0.0.1"], "local": True, "process": "postgres"}]}
    if p.startswith("/__gate/api/tunnels/check") or p.startswith("/__gate/api/tunnels/name"): return {"ok": True}
    return {}
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def send(self, code, data, ctype):
        self.send_response(code); self.send_header("Content-Type", ctype); self.send_header("Cache-Control", "no-store"); self.end_headers(); self.wfile.write(data)
    def handle_any(self, method):
        path = self.path
        if path.startswith("/__reset"): STATE["grafana"] = False; STATE["down"] = False; return self.send(200, b"ok", "text/plain")
        if path.startswith("/__down"): STATE["down"] = True; return self.send(200, b"ok", "text/plain")
        if path.startswith("/__gate/api/"):
            n = int(self.headers.get("Content-Length") or 0); body = self.rfile.read(n) if n else b""
            return self.send(200, json.dumps(api(path, method, body)).encode(), "application/json")
        p = path.split("?")[0].split("#")[0]
        page = {"/__gate/tunnels": "tunnels.html", "/": "home.html", "/__gate/login": "login.html", "/__gate/settings": "settings.html"}.get(p)
        f = os.path.join(PUB, page) if page else os.path.join(PUB, p.replace("/__gate/", "", 1).lstrip("/"))
        if not os.path.isfile(f): return self.send(404, b"no", "text/plain")
        data = open(f, "rb").read()
        if f.endswith(".html"): data = data.replace(b"{{title}}", b"Aegis").replace(b"{{subtitle}}", b"aegis.example.com")
        ctype = {".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png"}.get(os.path.splitext(f)[1], "application/octet-stream")
        self.send(200, data, ctype)
    def do_GET(self): self.handle_any("GET")
    def do_POST(self): self.handle_any("POST")
    def do_PUT(self): self.handle_any("PUT")
ThreadingHTTPServer((os.environ.get("BIND", "127.0.0.1"), int(os.environ.get("PORT", "8820"))), H).serve_forever()
