from pathlib import Path

import fitz


ROOT = Path(r"C:\Users\mohit\Documents\hda\Assignment\AVRD-E4 Agentic AI\Jamaa-Next-Door")
OUT = ROOT / "tmp" / "presentation-build" / "assets"
OUT.mkdir(parents=True, exist_ok=True)


def render_page(pdf_path: Path, page_number: int, output_name: str, zoom: float = 2.0) -> None:
    doc = fitz.open(pdf_path)
    page = doc[page_number - 1]
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    pix.save(OUT / output_name)
    doc.close()


render_page(
    ROOT / "output" / "documentation" / "jamaa-next-door-project-portfolio.pdf",
    14,
    "portfolio-page-14-architecture.png",
)
render_page(
    ROOT / "output" / "documentation" / "jamaa-next-door-project-portfolio.pdf",
    19,
    "portfolio-page-19-product-flow.png",
)
render_page(
    ROOT / "Research" / "App Interface and Interaction.pdf",
    1,
    "reference-interaction-page.png",
)
render_page(
    ROOT / "Research" / "safe-change-workflow.updated.pdf",
    1,
    "safe-change-page-1.png",
)
render_page(
    ROOT / "Research" / "safe-change-workflow.updated.pdf",
    2,
    "safe-change-page-2.png",
)
render_page(
    ROOT / "Research" / "safe-change-workflow.updated.pdf",
    3,
    "safe-change-page-3.png",
)
