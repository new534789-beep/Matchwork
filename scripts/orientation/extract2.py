import pdfplumber, re

path = r"C:\Users\hp\AppData\Local\Temp\claude\C--Users-hp-reelle-mathwork\0b7c6af1-7029-4cf4-805b-1bcbbd83912f\scratchpad\guide_rot2.pdf"
out = []
with pdfplumber.open(path) as pdf:
    for i, page in enumerate(pdf.pages, 1):
        out.append(f"\n===== PAGE {i} =====\n")
        out.append(page.extract_text(layout=True) or "")
t = "".join(out)
t = re.sub(r"[ \t]{2,}", " || ", t)
t = re.sub(r"\n{3,}", "\n\n", t)
with open(r"C:\Users\hp\AppData\Local\Temp\claude\C--Users-hp-reelle-mathwork\0b7c6af1-7029-4cf4-805b-1bcbbd83912f\scratchpad\guide_rot2.txt", "w", encoding="utf-8") as f:
    f.write(t)
print("ok", len(t))
