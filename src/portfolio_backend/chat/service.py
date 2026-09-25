from io import BytesIO
import json

from docx import Document
from fastapi import UploadFile
from groq import Groq
from pypdf import PdfReader

from portfolio_backend.chat.schema import ChatResponseSchema, ResumeJDMatchResponse
from portfolio_backend.constants import GROQ_API_KEY, LLM_MODEL_NAME, SYSTEM_PROMPT, PARSED_RESUME, JD_PROMPT

class PortfolioChat:
    def __init__(self):
        self.client = Groq(
            api_key=GROQ_API_KEY
        )

    def run_llm(self, user_prompt: str) -> ChatResponseSchema:
        user_msg = {
            "role": "user",
            "content": user_prompt
        }

        sys_msg = {
            "role": "system",
            "content": SYSTEM_PROMPT.format(resume_text=PARSED_RESUME)
        }

        response = self.client.chat.completions.create(
            model=LLM_MODEL_NAME,
            messages=[sys_msg, user_msg],
        )
        return ChatResponseSchema(answer=response.choices[0].message.content)

    async def parse_jd(self, file: UploadFile) -> ResumeJDMatchResponse:
        file_bytes = await file.read()
        content_type = file.content_type or ""

        if content_type == "application/pdf":
            file_content = "\n\n".join(
                page.extract_text() or ""
                for page in PdfReader(BytesIO(file_bytes), strict=False).pages
            )
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            document = Document(BytesIO(file_bytes))
            file_content = "\n".join(paragraph.text for paragraph in document.paragraphs)
        else:
            file_content = file_bytes.decode("utf-8")

        user_msg = {
            "role": "user",
            "content": f"Job description to compare:\n\n{file_content}"
        }

        response_format = ResumeJDMatchResponse.model_json_schema()

        sys_msg = {
            "role": "system",
            "content": JD_PROMPT.format(resume_data=PARSED_RESUME, jd_data=file_content, response_format=response_format)
        }
        response = self.client.chat.completions.create(
            model=LLM_MODEL_NAME,
            messages=[sys_msg, user_msg],
            response_format={"type": "json_object"}
        )
        response_data = json.loads(response.choices[0].message.content)
        return ResumeJDMatchResponse(**response_data)
