import pdfplumber, json, re

path = r"C:\Users\hp\AppData\Local\Temp\claude\C--Users-hp-reelle-mathwork\0b7c6af1-7029-4cf4-805b-1bcbbd83912f\scratchpad\guide_rot2.pdf"

def clean(s):
    if s is None:
        return ""
    s = s.replace("(cid:2220)", "")
    return re.sub(r"\s+", " ", s).strip()

pages = []
with pdfplumber.open(path) as pdf:
    for n, page in enumerate(pdf.pages, 1):
        tabs = page.extract_tables()
        if not tabs:
            continue
        rows = []
        for t in tabs:
            for row in t:
                rows.append([clean(c) for c in row])
        pages.append({"page": n, "rows": rows})

with open(r"C:\Users\hp\AppData\Local\Temp\claude\C--Users-hp-reelle-mathwork\0b7c6af1-7029-4cf4-805b-1bcbbd83912f\scratchpad\tables_all.json", "w", encoding="utf-8") as f:
    json.dump(pages, f, ensure_ascii=False, indent=1)

print("pages avec tableaux:", len(pages))
print("lignes totales:", sum(len(p["rows"]) for p in pages))
