#!/usr/bin/env python3
"""Generate blog thumbnails with OpenAI image generation via the Responses API."""

import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


CATEGORY_COLORS = {
    "research": "#1A1A1A",
    "leader": "#C43500",
    "company": "#1A4A7A",
    "tech": "#145C35",
    "survival": "#7A1F1F",
}


def build_prompt(title: str, category: str, tags: str, summary: str) -> str:
    category_color = CATEGORY_COLORS.get(category, "#1A1A1A")
    return f"""Create a blog thumbnail image for an executive Korean business audience.

Content context:
- Title: {title}
- Category: {category}
- Keywords: {tags or "None"}
- Summary: {summary or "None"}

Design direction:
- Highly detailed 3D papercraft and realistic origami art
- One core visual object or metaphor, not a collage
- Zoomed out composition, dead center subject
- Very large negative space at the top and bottom
- Full subject visible without touching the edges
- Soft matte paper texture and geometric low-poly surfaces
- Clean studio lighting with soft shadows
- Bright and refined pastel gradient background
- Category accent color: {category_color}
- Premium editorial thumbnail for a serious business publication
- No text, no letters, no numbers, no watermark, no logo
- Do not place any UI, screenshot, chart, or caption in the image
- Landscape composition optimized for a blog hero image

Prompt refinement workflow:
- First, draft the image concept prompt from the article context
- Then simulate a review by a 20-year veteran Vogue magazine designer and photographer
- In review round 1, critique the concept for editorial clarity, focal hierarchy, luxury composition, lighting, texture realism, and emotional restraint
- Revise the prompt after round 1
- In review round 2, critique the revised prompt again for sophistication, originality, negative space discipline, and premium magazine-cover impact
- Revise the prompt after round 2
- Use only the final improved prompt for the image generation
- Keep the final result elegant, intentional, minimal, and worthy of a top-tier editorial publication
"""


def create_response(prompt: str, api_key: str, model: str, size: str, quality: str) -> dict:
    payload = {
        "model": model,
        "input": prompt,
        "tools": [
            {
                "type": "image_generation",
                "size": size,
                "quality": quality,
                "background": "opaque",
            }
        ],
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode("utf-8"))


def extract_image_data(response: dict) -> tuple[str, str]:
    for output in response.get("output", []):
        if output.get("type") == "image_generation_call" and output.get("result"):
            return output["result"], output.get("revised_prompt", "")
    raise ValueError("OpenAI 응답에서 이미지 데이터를 찾지 못했습니다.")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate blog thumbnail with OpenAI")
    parser.add_argument("--slug", required=True, help="포스트 slug, 예: 2026-03-19-hyperagents-self-improving-ai")
    parser.add_argument("--category", required=True, choices=CATEGORY_COLORS.keys(), help="카테고리")
    parser.add_argument("--title", required=True, help="포스트 제목")
    parser.add_argument("--tags", default="", help="태그, 쉼표 구분")
    parser.add_argument("--summary", default="", help="포스트 요약")
    parser.add_argument("--output", required=True, help="출력 PNG 경로")
    parser.add_argument("--model", default="gpt-5", help="Responses API model")
    parser.add_argument("--size", default="1536x1024", help="이미지 크기")
    parser.add_argument("--quality", default="high", choices=["low", "medium", "high", "auto"], help="렌더링 품질")
    args = parser.parse_args()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("오류: OPENAI_API_KEY 환경변수가 필요합니다.", file=sys.stderr)
        return 1

    prompt = build_prompt(args.title, args.category, args.tags, args.summary)

    try:
        response = create_response(prompt, api_key, args.model, args.size, args.quality)
        image_base64, revised_prompt = extract_image_data(response)
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8", errors="replace")
        print(f"오류: OpenAI API 호출 실패 ({err.code})", file=sys.stderr)
        print(body, file=sys.stderr)
        return 1
    except urllib.error.URLError as err:
        print(f"오류: OpenAI API 연결 실패: {err}", file=sys.stderr)
        return 1
    except Exception as err:
        print(f"오류: {err}", file=sys.stderr)
        return 1

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(base64.b64decode(image_base64))

    print(f"Saved: {output_path}")
    print(f"Model: {args.model}")
    print(f"Size: {args.size}")
    if revised_prompt:
        print("Revised prompt:")
        print(revised_prompt)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
