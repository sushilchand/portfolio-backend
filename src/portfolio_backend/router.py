from fastapi import APIRouter, File, Form, UploadFile

from portfolio_backend.chat.service import PortfolioChat
from portfolio_backend.chat.schema import ChatRequestSchema, ChatResponseSchema, ResumeJDMatchResponse

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "message": "App is running"
    }

@router.post("/chat")
def chat_request(request: ChatRequestSchema):
    chat_service = PortfolioChat()

    answer: ChatResponseSchema = chat_service.run_llm(user_prompt=request.question)
    response = answer.model_dump(mode="json")
    return response

@router.post("/match-jd")
async def match_jd(file: UploadFile = File(...)):
    chat_service = PortfolioChat()

    answer: ResumeJDMatchResponse = await chat_service.parse_jd(file=file)
    return answer
