from pydantic import BaseModel
from pydantic import BaseModel, Field, ConfigDict

from portfolio_backend.chat.enum import MatchType, RequirementImportance, Verdict

class ChatRequestSchema(BaseModel):
    question: str


class ChatResponseSchema(BaseModel):
    answer: str


class CategoryScores(BaseModel):
    technical_skills: int = Field(
        ge=0,
        le=100,
        description="Candidate's technical skill alignment with the job description."
    )
    relevant_experience: int = Field(
        ge=0,
        le=100,
        description="Alignment of the candidate's relevant professional experience."
    )
    responsibilities_alignment: int = Field(
        ge=0,
        le=100,
        description="Alignment between candidate's past responsibilities and JD responsibilities."
    )
    seniority_scope: int = Field(
        ge=0,
        le=100,
        description="Alignment of candidate's seniority, ownership, and scope."
    )
    required_qualifications: int = Field(
        ge=0,
        le=100,
        description="Alignment with required qualifications."
    )
    domain_alignment: int = Field(
        ge=0,
        le=100,
        description="Alignment with the relevant industry/domain."
    )


class MatchedRequirement(BaseModel):
    requirement: str = Field(
        description="Requirement from the job description."
    )
    evidence: str = Field(
        description="Specific evidence from the resume supporting the match."
    )
    match_type: MatchType


class MissingRequirement(BaseModel):
    requirement: str = Field(
        description="Requirement from the job description that is missing or unsupported."
    )
    importance: RequirementImportance
    reason: str = Field(
        description="Why the requirement is considered missing."
    )


class PartialMatch(BaseModel):
    requirement: str = Field(
        description="Job requirement for which the candidate has only partial alignment."
    )
    resume_evidence: str = Field(
        description="Relevant evidence from the resume."
    )
    reason: str = Field(
        description="Why this is considered a partial rather than exact match."
    )


class ResumeJDMatchResponse(BaseModel):
    model_config = ConfigDict(
        use_enum_values=True,
        extra="forbid",
    )

    overall_score: int = Field(
        ge=0,
        le=100,
        description="Overall resume-to-job-description match score."
    )

    verdict: Verdict

    summary: str = Field(
        description="Concise explanation of the overall match."
    )

    category_scores: CategoryScores

    matched_requirements: list[MatchedRequirement] = Field(
        default_factory=list
    )

    missing_requirements: list[MissingRequirement] = Field(
        default_factory=list
    )

    partial_matches: list[PartialMatch] = Field(
        default_factory=list
    )

    strengths: list[str] = Field(
        default_factory=list
    )

    concerns: list[str] = Field(
        default_factory=list
    )

    recommendation_reasons: list[str] = Field(
        default_factory=list
    )
