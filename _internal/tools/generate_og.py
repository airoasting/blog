"""
AI ROASTING — OG 이미지 자동 생성기
사용법: python generate_og.py <posts-index.json 경로>

출력: assets/og/YYYY-MM-DD-slug.png (1200×630px)
의존성: pip install Pillow
"""

import json
import sys
import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow가 필요합니다: pip install Pillow")
    sys.exit(1)


# --- 카테고리 설정 ---
CATEGORY_CONFIG = {
    "research": {"label": "리서치", "color": "#1A1A1A", "bg": "#FAFAF9"},
    "leader":   {"label": "리더",   "color": "#C43500", "bg": "#FFF8F5"},
    "company":  {"label": "기업",   "color": "#1A4A7A", "bg": "#F5F8FF"},
    "tech":     {"label": "기술",   "color": "#145C35", "bg": "#F5FFF8"},
    "survival": {"label": "생존",   "color": "#7A1F1F", "bg": "#FFF5F5"},
}

WIDTH = 1200
HEIGHT = 630
BAR_WIDTH = 12
PADDING = 60


def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))


def get_font(size, bold=False):
    """시스템 폰트 fallback 체인"""
    font_paths = []

    if bold:
        font_paths = [
            # macOS
            "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
            "/Library/Fonts/NotoSerifKR-ExtraBold.otf",
            "/Library/Fonts/NotoSansKR-Bold.otf",
            # Linux
            "/usr/share/fonts/truetype/noto/NotoSansKR-Bold.ttf",
            # Windows
            "C:/Windows/Fonts/malgunbd.ttf",
        ]
    else:
        font_paths = [
            "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
            "/Library/Fonts/NotoSansKR-Regular.otf",
            "/usr/share/fonts/truetype/noto/NotoSansKR-Regular.ttf",
            "C:/Windows/Fonts/malgun.ttf",
        ]

    for path in font_paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)

    # fallback: default
    return ImageFont.load_default()


def wrap_text(text, font, max_width, draw):
    """한국어 텍스트 줄바꿈"""
    lines = []
    current = ""

    for char in text:
        test = current + char
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] > max_width:
            if current:
                lines.append(current)
            current = char
        else:
            current = test

    if current:
        lines.append(current)

    return lines


def generate_og_image(post, output_dir):
    """단일 포스트 OG 이미지 생성"""
    category = post.get("category", "research")
    config = CATEGORY_CONFIG.get(category, CATEGORY_CONFIG["research"])

    # 캔버스 생성
    bg_color = hex_to_rgb(config["bg"])
    img = Image.new("RGB", (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)

    # 좌측 카테고리 컬러 바
    cat_color = hex_to_rgb(config["color"])
    draw.rectangle([0, 0, BAR_WIDTH, HEIGHT], fill=cat_color)

    # 카테고리 배지
    font_meta = get_font(24)
    cat_label = config["label"]
    draw.text((PADDING + BAR_WIDTH, PADDING), cat_label, fill=cat_color, font=font_meta)

    # 날짜
    date_text = post.get("date", "")
    bbox = draw.textbbox((0, 0), date_text, font=font_meta)
    date_w = bbox[2] - bbox[0]
    draw.text((WIDTH - PADDING - date_w, PADDING), date_text, fill=(136, 136, 136), font=font_meta)

    # 제목
    font_title = get_font(48, bold=True)
    title = post.get("title", "")
    max_title_w = WIDTH - PADDING * 2 - BAR_WIDTH - 20
    lines = wrap_text(title, font_title, max_title_w, draw)
    lines = lines[:3]  # 최대 3줄

    y = 160
    for line in lines:
        draw.text((PADDING + BAR_WIDTH, y), line, fill=(26, 26, 26), font=font_title)
        y += 64

    # 하단: AI ROASTING + 소스 태그
    font_bottom = get_font(22)
    bottom_y = HEIGHT - PADDING - 30

    draw.text((PADDING + BAR_WIDTH, bottom_y), "AI ROASTING", fill=(26, 26, 26), font=font_bottom)

    source = post.get("source", "")
    if source:
        source_text = f"#{source}"
        bbox = draw.textbbox((0, 0), source_text, font=font_bottom)
        sw = bbox[2] - bbox[0]
        draw.text((WIDTH - PADDING - sw, bottom_y), source_text, fill=cat_color, font=font_bottom)

    # 구분선
    draw.line(
        [(PADDING + BAR_WIDTH + 140, bottom_y + 12), (WIDTH - PADDING - 100, bottom_y + 12)],
        fill=(232, 232, 232), width=1
    )

    # 저장
    slug = post.get("slug", "untitled")
    output_path = os.path.join(output_dir, f"{slug}.png")
    img.save(output_path, "PNG", quality=95)
    print(f"  ✅ {output_path}")

    return output_path


def main():
    # 경로 설정
    if len(sys.argv) > 1:
        index_path = sys.argv[1]
    else:
        index_path = os.path.join(os.path.dirname(__file__), "..", "posts-index.json")

    index_path = os.path.abspath(index_path)
    base_dir = os.path.dirname(index_path)
    output_dir = os.path.join(base_dir, "assets", "og")

    os.makedirs(output_dir, exist_ok=True)

    # JSON 읽기
    with open(index_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    posts = data.get("posts", [])
    print(f"OG 이미지 생성 시작 ({len(posts)}편)")

    for post in posts:
        generate_og_image(post, output_dir)

    print(f"\n완료! {len(posts)}개 이미지 → {output_dir}")


if __name__ == "__main__":
    main()
