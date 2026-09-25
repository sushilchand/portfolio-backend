# Portfolio backend

This repository contains the FastAPI backend and the static portfolio frontend.

## Run locally

Install the locked dependencies and start the application from the repository root:

```bash
uv sync
uv run uvicorn portfolio_backend.server:app --reload
```

Open <http://localhost:8000>. The API is available at `/health`, `/chat`, and
`/match-jd`; the OpenAPI UI is at `/docs`.

The chat endpoints require these values in a local `.env` file:

```dotenv
GROQ_API_KEY=your-groq-api-key
LLM_MODEL_NAME=your-groq-model-name
```

Do not commit `.env` or API keys.

## Deploy to Vercel

Import this repository into Vercel with the project root as the root directory.
Vercel detects `api/index.py` as the Python serverless function and uses
`vercel.json` to route the portfolio files and API requests. Add the same
`GROQ_API_KEY` and `LLM_MODEL_NAME` environment variables in the Vercel project
settings, then deploy. No build command is required.