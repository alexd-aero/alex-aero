import json, re, sys
SP, SITE = sys.argv[1], sys.argv[2]
def block_end(s, i):
    depth = 0
    for m in re.finditer(r'<div\b|</div>', s[i:]):
        depth += 1 if m.group(0) == '<div' else -1
        if depth == 0: return i + m.end()
    return len(s)
out = {}
for f in ["burrow-snaps.json", "mach-snaps.json", "bw-snaps.json"]:
    out.update(json.load(open(f"{SP}/{f}")))
out.pop("live", None)
w = out["bwWaves"]["html"]; st = w.find('<div class="stack">'); a = st + len('<div class="stack">'); en = block_end(w, st) - len('</div>')
blocks, i = [], a
while True:
    k = w.find('<div class="alert', i)
    if k < 0 or k >= en: break
    e = block_end(w, k); blocks.append(w[k:e]); i = e
blocks.sort(key=lambda b: 0 if '>critical<' in b else 1 if 'campaign' in b else 2)
out["bwWaves"]["html"] = w[:a] + "".join(blocks[:4]) + w[en:]
L = out["bwLog"]["html"]; tb = L.find("<tbody"); s0 = L.find(">", tb) + 1; tbe = L.find("</tbody>", tb)
rows = re.findall(r'<tr\b.*?</tr>', L[s0:tbe], re.S)
out["bwLog"]["html"] = L[:s0] + "".join(rows[:48]) + L[tbe:]
out["bwLog"]["rows"] = "tbody tr"
vpx = lambda m, k: f"{float(m.group(1)) * k:.1f}px"
def pin(style):     # viewport units inside a style attribute only (never inside image data)
    style = re.sub(r"(-?\d*\.?\d+)(?:d|s|l)?vh\b", lambda m: vpx(m, 6.74), style)
    return re.sub(r"(-?\d*\.?\d+)(?:d|s|l)?vw\b", lambda m: vpx(m, 12.8), style)
for v in out.values():
    v["html"] = re.sub(r'style="([^"]*)"', lambda m: 'style="' + pin(m.group(1)) + '"', v["html"])
    v["html"] = re.sub(r'\sautofocus(="[^"]*")?', "", v["html"])     # a snapshot must never grab focus (and scroll the page)
    v["html"] = v["html"].replace("/__gate/logos/", "assets/real/logos/").replace('src="logo.svg', 'src="assets/brand/bulwark.svg')
s = json.dumps(out)
for bad in ["/home/", "/Users/", "192.168.", "src=\"logo.svg"]:   # nothing from a real machine
    assert bad not in s, bad
open(f"{SITE}/assets/real/screens.json", "w").write(s)
print("screens.json", len(s) // 1024, "KB;", len(blocks), "waves ->", min(4, len(blocks)), ";", len(rows), "rows -> 48")
