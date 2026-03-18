#!/usr/bin/env python3
"""Generate thumbnail for ai-investment-roi-7-factors post."""
from PIL import Image, ImageDraw, ImageFont
import math, random

W, H = 2752, 1536
FONT_DIR = "../../../assets/fonts"

def load_font(name, size):
    return ImageFont.truetype(f"{FONT_DIR}/{name}", size)

def draw_gradient(draw, w, h, c1, c2):
    for y in range(h):
        r = int(c1[0] + (c2[0] - c1[0]) * y / h)
        g = int(c1[1] + (c2[1] - c1[1]) * y / h)
        b = int(c1[2] + (c2[2] - c1[2]) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

def main():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background gradient - deep navy to dark teal
    draw_gradient(draw, W, H, (15, 23, 42), (10, 40, 55))

    # Subtle grid pattern
    for x in range(0, W, 80):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 8), width=1)
    for y in range(0, H, 80):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 8), width=1)

    # Decorative circles (abstract data viz feel)
    circle_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    circle_draw = ImageDraw.Draw(circle_overlay)
    random.seed(42)
    for _ in range(15):
        cx = random.randint(0, W)
        cy = random.randint(0, H)
        r = random.randint(80, 300)
        alpha = random.randint(8, 20)
        color = random.choice([
            (56, 189, 248, alpha),   # sky blue
            (251, 146, 60, alpha),   # orange
            (52, 211, 153, alpha),   # emerald
        ])
        circle_draw.ellipse([(cx-r, cy-r), (cx+r, cy+r)], fill=color)
    img = Image.alpha_composite(img, circle_overlay)
    draw = ImageDraw.Draw(img)

    # ---- 7 hexagonal nodes in a circular arrangement ----
    center_x = W * 0.5
    center_y = H * 0.52
    radius = 420

    principles = [
        ("1", "가치 정의", (56, 189, 248)),    # sky blue
        ("2", "CFO 책임", (251, 146, 60)),     # orange
        ("3", "AI 유형", (52, 211, 153)),       # emerald
        ("4", "측정 성숙도", (168, 85, 247)),   # purple
        ("5", "교육", (251, 113, 133)),         # rose
        ("6", "데이터", (250, 204, 21)),        # yellow
        ("7", "선제 투자", (96, 165, 250)),     # blue
    ]

    node_positions = []
    for i in range(7):
        angle = -math.pi / 2 + i * 2 * math.pi / 7
        nx = center_x + radius * math.cos(angle)
        ny = center_y + radius * math.sin(angle)
        node_positions.append((nx, ny))

    # Draw connecting lines between all nodes (network effect)
    line_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    line_draw = ImageDraw.Draw(line_overlay)
    for i in range(7):
        for j in range(i + 1, 7):
            x1, y1 = node_positions[i]
            x2, y2 = node_positions[j]
            line_draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255, 18), width=2)
    # Highlight adjacent connections
    for i in range(7):
        j = (i + 1) % 7
        x1, y1 = node_positions[i]
        x2, y2 = node_positions[j]
        line_draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255, 50), width=3)
    img = Image.alpha_composite(img, line_overlay)
    draw = ImageDraw.Draw(img)

    # Draw nodes
    font_num = load_font("Pretendard-ExtraBold.ttf", 64)
    font_label = load_font("Pretendard-Bold.ttf", 38)
    node_r = 85

    for i, (num, label, color) in enumerate(principles):
        nx, ny = node_positions[i]

        # Glow effect
        glow_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_overlay)
        for gr in range(node_r + 40, node_r, -2):
            alpha = int(15 * (1 - (gr - node_r) / 40))
            glow_draw.ellipse([(nx-gr, ny-gr), (nx+gr, ny+gr)], fill=(*color, alpha))
        img = Image.alpha_composite(img, glow_overlay)
        draw = ImageDraw.Draw(img)

        # Node circle
        node_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        node_draw = ImageDraw.Draw(node_overlay)
        node_draw.ellipse([(nx-node_r, ny-node_r), (nx+node_r, ny+node_r)], fill=(*color, 200))
        # Border
        node_draw.ellipse([(nx-node_r, ny-node_r), (nx+node_r, ny+node_r)], outline=(255, 255, 255, 100), width=3)
        img = Image.alpha_composite(img, node_overlay)
        draw = ImageDraw.Draw(img)

        # Number text
        bbox = draw.textbbox((0, 0), num, font=font_num)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((nx - tw / 2, ny - th / 2 - 8), num, fill=(255, 255, 255), font=font_num)

        # Label below node
        bbox = draw.textbbox((0, 0), label, font=font_label)
        tw = bbox[2] - bbox[0]
        draw.text((nx - tw / 2, ny + node_r + 16), label, fill=(255, 255, 255, 220), font=font_label)

    # Center badge: "7"
    badge_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    badge_draw = ImageDraw.Draw(badge_overlay)
    badge_r = 110
    # Glow
    for gr in range(badge_r + 60, badge_r, -3):
        alpha = int(20 * (1 - (gr - badge_r) / 60))
        badge_draw.ellipse([(center_x-gr, center_y-gr), (center_x+gr, center_y+gr)],
                           fill=(251, 146, 60, alpha))
    # Circle
    badge_draw.ellipse([(center_x-badge_r, center_y-badge_r),
                         (center_x+badge_r, center_y+badge_r)],
                        fill=(15, 23, 42, 230))
    badge_draw.ellipse([(center_x-badge_r, center_y-badge_r),
                         (center_x+badge_r, center_y+badge_r)],
                        outline=(251, 146, 60, 180), width=4)
    img = Image.alpha_composite(img, badge_overlay)
    draw = ImageDraw.Draw(img)

    font_big = load_font("Pretendard-Black.ttf", 120)
    bbox = draw.textbbox((0, 0), "7", font=font_big)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((center_x - tw / 2, center_y - th / 2 - 10), "7", fill=(251, 146, 60), font=font_big)

    # Title text at top
    font_title = load_font("Pretendard-ExtraBold.ttf", 88)
    font_sub_title = load_font("Pretendard-Bold.ttf", 56)

    title1 = "AI 투자 수익률을 결정하는"
    title2 = "7가지 경영 원칙"

    bbox1 = draw.textbbox((0, 0), title1, font=font_sub_title)
    tw1 = bbox1[2] - bbox1[0]
    draw.text(((W - tw1) / 2, 55), title1, fill=(200, 210, 230), font=font_sub_title)

    bbox2 = draw.textbbox((0, 0), title2, font=font_title)
    tw2 = bbox2[2] - bbox2[0]
    draw.text(((W - tw2) / 2, 120), title2, fill=(255, 255, 255), font=font_title)

    # Accent line under title
    line_y = 230
    line_w = 200
    draw.line([((W - line_w) / 2, line_y), ((W + line_w) / 2, line_y)],
              fill=(251, 146, 60), width=4)

    # Source badge
    font_source = load_font("Pretendard-SemiBold.ttf", 36)
    source_text = "HBR  |  AI ROASTING"
    bbox = draw.textbbox((0, 0), source_text, font=font_source)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, H - 70), source_text, fill=(150, 160, 180), font=font_source)

    # Convert and save
    img = img.convert("RGB")
    img.save("thumbnail.png", "PNG", optimize=True)
    print(f"Saved: thumbnail.png ({img.size})")

if __name__ == "__main__":
    main()
