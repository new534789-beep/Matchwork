from pypdf import PdfReader, PdfWriter

src = r"C:\Users\hp\Downloads\GUIDE D'INFORMATION ANNEE 2026-2027.pdf"
dst = r"C:\Users\hp\AppData\Local\Temp\claude\C--Users-hp-reelle-mathwork\0b7c6af1-7029-4cf4-805b-1bcbbd83912f\scratchpad\guide_rot2.pdf"

reader = PdfReader(src)
writer = PdfWriter()
for p in reader.pages:
    p.rotate(270)
    writer.add_page(p)
with open(dst, "wb") as f:
    writer.write(f)
print("ok", len(reader.pages))
