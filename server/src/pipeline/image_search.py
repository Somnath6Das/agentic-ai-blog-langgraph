from __future__ import annotations
import os
import re
import json
import requests
from typing import List, Dict, Optional
from urllib.parse import urlparse

def search_google_images(topic: str, max_results: int = 15) -> List[Dict]:
    """Real Google Image Search results via Serper.dev. Requires SERPER_API_KEY."""
    if not os.environ.get("SERPER_API_KEY"):
        print("Missing SERPER_API_KEY — skipping Google image search.")
        return []

    url = "https://google.serper.dev/images"
    payload = {"q": topic, "num": max_results}
    headers = {"X-API-KEY": os.environ.get("SERPER_API_KEY"), "Content-Type": "application/json"}

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=20)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"[search_google_images] Network error: {e}")
        return []

    data = resp.json()
    images = data.get("images", [])
    if not images:
        return []

    return [
        {
            "title": img.get("title", ""),
            "url": img.get("imageUrl"),       # full-size image
            "thumb": img.get("thumbnailUrl"),  # preview
            "source": img.get("source", ""),   # website it came from
            "width": img.get("imageWidth"),
            "height": img.get("imageHeight"),
        }
        for img in images[:max_results]
    ]


def search_bing_images(topic: str, max_results: int = 15) -> List[Dict]:
    """Free Bing image search — no API key required. Used as a fallback."""
    url = "https://www.bing.com/images/async"
    params = {"q": topic, "first": str(max_results), "count": str(max_results)}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    }

    try:
        resp = requests.get(url, params=params, headers=headers, timeout=20)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"[search_bing_images] Network error: {e}")
        return []

    # Bing returns a JSON blob embedded in <script> tags. Extract it.
    matches = re.findall(r'm\s*=\s*"(\{.*?\})"', resp.text)
    if not matches:
        return []

    try:
        data = json.loads(matches[0].encode().decode("unicode_escape"))
    except Exception:
        print("[search_bing_images] Could not parse Bing response.")
        return []

    results = []
    for item in data.get("items", [])[:max_results]:
        media = item.get("media", {})
        results.append({
            "title": item.get("title", ""),
            "url": media.get("m"),
            "thumb": media.get("m"),
            "source": item.get("desc", ""),
            "width": None,
            "height": None,
        })
    return results


VALID_IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png")


def _has_valid_extension(url: Optional[str]) -> bool:
    """Check whether a URL points to a .jpg/.jpeg/.png file (query strings ignored)."""
    if not url:
        return False
    path = urlparse(url).path.lower()
    return path.endswith(VALID_IMAGE_EXTENSIONS)

def get_image_urls(topic: str, max_results: int = 15, engine: str = "google") -> List[str]:
    """
    Returns a flat list of full-size image URLs for the given topic,
    filtered to only .jpg, .jpeg, or .png links.
    Tries `engine` first (default: google/Serper); falls back to Bing if
    that yields nothing (e.g. missing/invalid API key, no results).
    """
    results: List[Dict] = []

    if engine == "google":
        results = search_google_images(topic, max_results=max_results)
        if not results:
            results = search_bing_images(topic, max_results=max_results)

    urls: List[str] = [
        r["url"] for r in results
        if r.get("url") and _has_valid_extension(r["url"])
    ]
    return urls
