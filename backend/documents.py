from pypdf import PdfReader
from docx import Document

MAX_CHARS = 30000

def extract_text(file):
    """`file` is the uploaded file object from Flask. Returns its text."""
    name = file.filename.lower()

    if name.endswith(".pdf"):
        reader = PdfReader(file.stream)
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    
    elif name.endswith(".docx"):
        document = Document(file.stream)
        text = "\n".join(paragraph.text for paragraph in document.paragraphs)

    elif name.endswith(".txt"):
        text = file.stream.read().decode("utf-8", errors="ignore")

    else:
        raise ValueError("Podržani formati su PDF, DOCX i TXT.")

    text = text.strip()
    if not text:
        raise ValueError("U dokumentu nije pronađen tekst.")
    return text[:MAX_CHARS]