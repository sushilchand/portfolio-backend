import os
from pathlib import Path

from dotenv import load_dotenv
from pypdf import PdfReader

load_dotenv()

PACKAGE_DIR = Path(__file__).resolve().parent
STATIC_DIR = PACKAGE_DIR / "static"

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME")
SYSTEM_PROMPT = (STATIC_DIR / "system_prompt.txt").read_text(encoding="utf-8")
RESUME_PATH = STATIC_DIR / "sushil_resume.pdf"
PARSED_RESUME = "\n\n".join(
	page.extract_text() or "" for page in PdfReader(RESUME_PATH, strict=False).pages
)
JD_PROMPT = (STATIC_DIR / "jd_prompt.txt").read_text(encoding="utf-8")
