# Make a page's stylesheet work inside a shadow root, as if its window were 1280 x 674:
# :root -> :host, html/body -> wrapper classes, @media decided for that window, vh/vw -> px.
import re, sys
VW, VH = 1280, 674
src, dst = sys.argv[1], sys.argv[2]
css = re.sub(r"/\*.*?\*/", "", open(src).read(), flags=re.S)

def media_true(q):
    def one(part):
        part = part.strip().lower()
        if not part: return True
        neg = part.startswith("not ")
        if neg: part = part[4:]
        ok = True
        if re.match(r"^(only\s+)?(print|speech)\b", part): ok = False
        for f, v in re.findall(r"\(\s*([a-z-]+)\s*(?::\s*([^)]+))?\)", part):
            v = (v or "").strip()
            num = float(re.match(r"[\d.]+", v).group(0)) if re.match(r"[\d.]+", v) else None
            if v.endswith("em") and num is not None: num *= 16
            r = {"min-width": lambda: VW >= num, "max-width": lambda: VW <= num, "min-height": lambda: VH >= num, "max-height": lambda: VH <= num,
                 "hover": lambda: v == "hover", "any-hover": lambda: v == "hover", "pointer": lambda: v == "fine", "any-pointer": lambda: v == "fine",
                 "prefers-reduced-motion": lambda: v == "no-preference", "prefers-color-scheme": lambda: v == "dark",
                 "orientation": lambda: v == "landscape", "prefers-contrast": lambda: v == "no-preference"}.get(f)
            ok = ok and (r() if r else True)
        return not ok if neg else ok
    return any(one(p) for p in q.split(","))

def unwrap_media(s):
    out, i = [], 0
    while True:
        k = s.find("@media", i)
        if k < 0: out.append(s[i:]); break
        out.append(s[i:k])
        b = s.find("{", k); depth, j = 0, b
        while j < len(s):
            if s[j] == "{": depth += 1
            elif s[j] == "}":
                depth -= 1
                if depth == 0: break
            j += 1
        cond, inner = s[k + 6:b], s[b + 1:j]
        if media_true(cond): out.append(unwrap_media(inner))
        i = j + 1
    return "".join(out)
css = unwrap_media(css)

def fix(sel):
    if sel.strip().startswith("@"): return sel
    sel = sel.replace(":root", ":host")
    sel = re.sub(r"(?<![\w.#-])html(?![\w-])", ".x-html", sel)
    return re.sub(r"(?<![\w.#-])body(?![\w-])", ".x-body", sel)
res, buf = [], ""
for ch in css:
    if ch == "{": res.append(fix(buf)); res.append("{"); buf = ""
    elif ch in "};": res.append(buf); res.append(ch); buf = ""
    else: buf += ch
res.append(buf)
out = "".join(res)
out = re.sub(r"(-?\d*\.?\d+)(?:d|s|l)?vh\b", lambda m: f"{float(m.group(1)) * VH / 100:.1f}px", out)
out = re.sub(r"(-?\d*\.?\d+)(?:d|s|l)?vw\b", lambda m: f"{float(m.group(1)) * VW / 100:.1f}px", out)
open(dst, "w").write(out)
print(dst, len(out))
