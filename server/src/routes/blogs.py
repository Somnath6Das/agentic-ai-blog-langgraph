from __future__ import annotations
import re
import uuid
import asyncio
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..pipeline.graph import  app as graph_app 
from ..pipeline.image_search import get_image_urls

IMAGE_RESULTS_COUNT = 15

router = APIRouter(prefix="/blogs", tags=["blogs"])

BLOG_FILES_DIR = Path("blog_files")
BLOG_FILES_DIR.mkdir(parents=True, exist_ok=True)


class BlogRequest(BaseModel):
    topic: str


class BlogResponse(BaseModel):
    title: str
    path: str  # e.g. "blog_files/fine-tuning-in-2026-ab12cd.html"
    images: List[str] = []  # array of full-size image URLs

def slugify(text: str, max_len: int = 30) -> str:
    """Turn a blog title into a filesystem-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    if not text:
        text = "blog"
    return text[:max_len].rstrip("-")


def generate_filename(blog_title: str) -> str:
    """Generate a short, unique, safe filename for the blog file (no directory)."""
    slug = slugify(blog_title)
    suffix = uuid.uuid4().hex[:6]
    return f"{slug}-{suffix}.html"

@router.post("/create", response_model=BlogResponse)
async def create_blog(body: BlogRequest):
    if not body.topic or not body.topic.strip():
        raise HTTPException(status_code=422, detail="topic must not be empty.")

    initial_state = {
        "topic": body.topic.strip(),
        "mode": "",
        "needs_research": False,
        "queries": [],
        "evidence": [],
        "plan": None,
        "sections": [],
        "final": "",
    }

    try:
        result = await asyncio.to_thread(graph_app.invoke, initial_state) # type: ignore
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Blog generation failed: {exc}") from exc

    plan = result.get("plan") # type: ignore
    final_html = result.get("final") # type: ignore

    if plan is None or not final_html:
        raise HTTPException(status_code=500, detail="Pipeline did not produce a final blog post.")

    blog_title = plan.blog_title
    filename = generate_filename(blog_title)
    file_path = BLOG_FILES_DIR / filename

    file_path.write_text(final_html, encoding="utf-8")

    try:
        image_urls = await asyncio.to_thread(
            lambda: get_image_urls(blog_title, max_results=IMAGE_RESULTS_COUNT, engine="google")
        )
    except Exception as exc:
        print(f"[create_blog] image search failed: {exc}")
        image_urls = []

    return BlogResponse(
        title=blog_title,
        path=str(file_path).replace("\\", "/"),  # normalize for Windows too
        images=image_urls,
    )