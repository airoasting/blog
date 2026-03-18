#!/usr/bin/env python3
"""Generate thumbnail for llm-stock-picking-bias post."""
from PIL import Image, ImageDraw, ImageFont
import math, random

W, H = 2752, 1536
FONT_DIR = "assets/fonts"

def load_font(name, size):
    return ImageFont.truetype(f"{FONT_DIR}/{name}", size)

def draw_gradient(draw, w, h, c1, c2):
    for y in range(h):
        r = int(c1[0] + (c2[0] - c1[0]) * y / h)
        g = int(c1[1] + (c2[1] - c1[1]) * y / h)
        b = int(c1[2] + (c2[2] - c1[2]) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

def smooth_curve(points, iterations=3):
    """Chaikin's corner cutting for smoother curves."""
    for _ in range(iterations):
        new_pts = [points[0]]
        for i in range(len(points) - 1):
            x0, y0 = points[i]
            x1, y1 = points[i + 1]
            new_pts.append((x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25))
            new_pts.append((x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75))
        new_pts.append(points[-1])
        points = new_pts
    return points

def main():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background gradient - soft warm cream to soft cool blue
    draw_gradient(draw, W, H, (250, 245, 238), (228, 235, 248))

    # Chart area - centered vertically
    chart_left = int(W * 0.08)
    chart_right = int(W * 0.78)
    chart_top = int(H * 0.10)
    chart_bottom = int(H * 0.95)
    chart_mid = int(H * 0.72)

    # Subtle grid
    for x in range(chart_left, chart_right + 1, 140):
        draw.line([(x, chart_top), (x, chart_bottom)], fill=(230, 232, 238), width=1)
    for y in range(chart_top, chart_bottom + 1, 90):
        draw.line([(chart_left, y), (chart_right, y)], fill=(230, 232, 238), width=1)

    # Baseline (actual price)
    draw.line([(chart_left, chart_mid), (chart_right, chart_mid)], fill=(195, 195, 195), width=4)

    # Generate diverging curves
    random.seed(77)
    n = 30  # control points

    # ChatGPT: starts near baseline, diverges upward (optimistic bias)
    chatgpt_raw = []
    for i in range(n + 1):
        t = i / n
        x = chart_left + t * (chart_right - chart_left)
        # Smooth upward divergence with some wave
        diverge = t ** 1.3 * 550
        wave = math.sin(t * math.pi * 2.5) * 50 * (0.3 + t * 0.7)
        y = chart_mid - diverge - wave
        chatgpt_raw.append((x, y))

    # DeepSeek: stays closer to baseline (more accurate)
    deepseek_raw = []
    for i in range(n + 1):
        t = i / n
        x = chart_left + t * (chart_right - chart_left)
        diverge = t ** 1.5 * 120
        wave = math.sin(t * math.pi * 2.8 + 1) * 35 * (0.3 + t * 0.5)
        y = chart_mid - diverge - wave
        deepseek_raw.append((x, y))

    chatgpt_pts = smooth_curve(chatgpt_raw)
    deepseek_pts = smooth_curve(deepseek_raw)

    # Fill between ChatGPT and baseline with semi-transparent orange
    fill_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fill_draw = ImageDraw.Draw(fill_overlay)
    fill_poly = list(chatgpt_pts) + [(chart_right, chart_mid), (chart_left, chart_mid)]
    fill_draw.polygon(fill_poly, fill=(255, 69, 0, 25))
    img = Image.alpha_composite(img, fill_overlay)

    # Fill between DeepSeek and baseline
    fill_overlay2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fill_draw2 = ImageDraw.Draw(fill_overlay2)
    fill_poly2 = list(deepseek_pts) + [(chart_right, chart_mid), (chart_left, chart_mid)]
    fill_draw2.polygon(fill_poly2, fill=(50, 80, 160, 18))
    img = Image.alpha_composite(img, fill_overlay2)

    draw = ImageDraw.Draw(img)

    # Draw lines
    for i in range(len(chatgpt_pts) - 1):
        draw.line([chatgpt_pts[i], chatgpt_pts[i + 1]], fill=(255, 69, 0), width=7)
    for i in range(len(deepseek_pts) - 1):
        draw.line([deepseek_pts[i], deepseek_pts[i + 1]], fill=(50, 80, 160), width=7)

    # Decorative origami triangles
    tri_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tri_draw = ImageDraw.Draw(tri_overlay)

    def draw_tri(d, cx, cy, size, color, rot=0):
        pts = []
        for i in range(3):
            a = rot + i * 2 * math.pi / 3 - math.pi / 2
            pts.append((cx + size * math.cos(a), cy + size * math.sin(a)))
        d.polygon(pts, fill=color)

    random.seed(99)
    # Warm triangles (top-left area)
    for _ in range(6):
        x = random.randint(int(W * 0.02), int(W * 0.25))
        y = random.randint(int(H * 0.03), int(H * 0.30))
        s = random.randint(25, 65)
        draw_tri(tri_draw, x, y, s, (255, 120, 70, random.randint(25, 50)), random.uniform(0, math.pi * 2))
    # Cool triangles (bottom-right area)
    for _ in range(6):
        x = random.randint(int(W * 0.75), int(W * 0.97))
        y = random.randint(int(H * 0.70), int(H * 0.95))
        s = random.randint(25, 65)
        draw_tri(tri_draw, x, y, s, (80, 110, 190, random.randint(25, 50)), random.uniform(0, math.pi * 2))

    img = Image.alpha_composite(img, tri_overlay)
    draw = ImageDraw.Draw(img)

    # Labels on the right side
    label_x = chart_right + 40
    font_name = load_font("Pretendard-Bold.ttf", 52)
    font_pct = load_font("Pretendard-SemiBold.ttf", 44)
    font_sub = load_font("Pretendard-Regular.ttf", 38)

    # ChatGPT end position
    cg_end_y = chatgpt_pts[-1][1]
    draw.text((label_x, cg_end_y - 35), "ChatGPT", fill=(255, 69, 0), font=font_name)
    draw.text((label_x, cg_end_y + 25), "+12.5%", fill=(255, 69, 0), font=font_pct)

    # DeepSeek end position
    ds_end_y = deepseek_pts[-1][1]
    draw.text((label_x, ds_end_y - 30), "DeepSeek", fill=(50, 80, 160), font=font_name)

    # Actual baseline label
    draw.text((label_x, chart_mid - 22), "Actual", fill=(170, 170, 170), font=font_sub)

    # Bias bracket at ~70% point
    bx = int(chart_left + 0.7 * (chart_right - chart_left))
    # Find nearest points
    def y_at_x(pts, target_x):
        for i in range(len(pts) - 1):
            if pts[i][0] <= target_x <= pts[i + 1][0]:
                t = (target_x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]) if pts[i + 1][0] != pts[i][0] else 0
                return pts[i][1] + t * (pts[i + 1][1] - pts[i][1])
        return pts[-1][1]

    bt = y_at_x(chatgpt_pts, bx)
    bb = y_at_x(deepseek_pts, bx)

    # Bracket line
    bracket_color = (107, 58, 42)
    draw.line([(bx, bt), (bx, bb)], fill=bracket_color, width=3)
    draw.line([(bx - 12, bt), (bx + 12, bt)], fill=bracket_color, width=3)
    draw.line([(bx - 12, bb), (bx + 12, bb)], fill=bracket_color, width=3)

    font_bias = load_font("Pretendard-Bold.ttf", 36)
    bias_text = "Bias"
    bbox = draw.textbbox((0, 0), bias_text, font=font_bias)
    tw = bbox[2] - bbox[0]
    draw.text((bx - tw // 2, (bt + bb) / 2 - 20), bias_text, fill=bracket_color, font=font_bias)

    # Convert and save
    img = img.convert("RGB")
    out_path = "research/images/2026_03_17_llm-stock-picking-bias/thumbnail.png"
    img.save(out_path, "PNG", optimize=True)
    print(f"Saved: {out_path} ({img.size})")

if __name__ == "__main__":
    main()
