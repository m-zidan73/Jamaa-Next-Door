from pathlib import Path

import fitz


ROOT = Path(r"C:\Users\mohit\Documents\hda\Assignment\AVRD-E4 Agentic AI\Jamaa-Next-Door")
CASES = [
    (ROOT / "output" / "documentation" / "jamaa-next-door-project-portfolio.pdf", 14),
    (ROOT / "output" / "documentation" / "jamaa-next-door-project-portfolio.pdf", 19),
    (ROOT / "Research" / "App Interface and Interaction.pdf", 1),
    (ROOT / "Research" / "safe-change-workflow.updated.pdf", 1),
]


for path, page_number in CASES:
    doc = fitz.open(path)
    page = doc[page_number - 1]
    print(f"\n{path.name} page {page_number}: {page.rect}")
    for image in page.get_images(full=True):
        xref = image[0]
        for rect in page.get_image_rects(xref):
            print(f"  image xref={xref} rect={rect}")
    for block in page.get_text("blocks"):
        text = " ".join(block[4].split())
        if text:
            print(f"  text rect={tuple(round(value, 1) for value in block[:4])}: {text[:180]}")
    doc.close()
