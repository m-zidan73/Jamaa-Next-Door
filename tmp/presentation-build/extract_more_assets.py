from pathlib import Path

import fitz


ROOT = Path(r"C:\Users\mohit\Documents\hda\Assignment\AVRD-E4 Agentic AI\Jamaa-Next-Door")
OUT = ROOT / "tmp" / "presentation-build" / "assets"
OUT.mkdir(parents=True, exist_ok=True)


def extract_xref(pdf_path: Path, xref: int, output_stem: str) -> None:
    doc = fitz.open(pdf_path)
    image = doc.extract_image(xref)
    (OUT / f"{output_stem}.{image['ext']}").write_bytes(image["image"])
    doc.close()


portfolio = ROOT / "output" / "documentation" / "jamaa-next-door-project-portfolio.pdf"
extract_xref(portfolio, 63, "architecture-diagram")
extract_xref(portfolio, 84, "product-flow")

reference = ROOT / "Research" / "App Interface and Interaction.pdf"
for index, xref in enumerate((9, 8, 7, 6), start=1):
    extract_xref(reference, xref, f"reference-phone-{index}")
