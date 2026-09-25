from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn

from portfolio_backend.constants import STATIC_DIR
from portfolio_backend.router import router

app = FastAPI()

app.include_router(router)
app.mount("/", StaticFiles(directory=STATIC_DIR.parent.parent / "frontend", html=True), name="frontend")


def main() -> None:
    uvicorn.run("portfolio_backend.server:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
