#!/usr/bin/env python3
"""Generate abstract thumbnail for blog posts — bright gradient + origami style."""
import argparse
import math
import random
import hashlib
from pathlib import Path
from PIL import Image, ImageDraw

W, H = 2400, 1260

# Bright, light palettes per category
PALETTES = {
    'research': {
        'bg1': (245, 245, 250), 'bg2': (225, 230, 245),
        'accents': [(100, 140, 210), (130, 165, 225), (80, 120, 190), (160, 185, 235), (60, 100, 170)],
        'fold': (200, 210, 230),
    },
    'leader': {
        'bg1': (255, 248, 240), 'bg2': (250, 235, 220),
        'accents': [(220, 85, 30), (240, 120, 55), (200, 65, 15), (255, 155, 80), (180, 55, 10)],
        'fold': (240, 220, 200),
    },
    'company': {
        'bg1': (240, 248, 255), 'bg2': (220, 235, 250),
        'accents': [(40, 120, 200), (60, 140, 220), (80, 160, 240), (30, 100, 180), (110, 175, 245)],
        'fold': (210, 225, 240),
    },
    'tech': {
        'bg1': (242, 252, 245), 'bg2': (225, 245, 230),
        'accents': [(40, 180, 100), (30, 160, 80), (60, 200, 120), (20, 140, 70), (95, 220, 145)],
        'fold': (210, 235, 215),
    },
    'survival': {
        'bg1': (255, 245, 245), 'bg2': (245, 228, 228),
        'accents': [(200, 60, 60), (180, 40, 40), (220, 80, 80), (160, 30, 30), (240, 115, 115)],
        'fold': (235, 215, 215),
    },
}


def draw_gradient(draw, w, h, c1, c2):
    """Draw smooth vertical gradient."""
    for y in range(h):
        t = y / h
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))


def draw_origami_polygon(draw, cx, cy, size, sides, rotation, fill_color, fold_color, alpha, rng):
    """Draw an origami-style polygon with fold lines."""
    # Main polygon vertices
    pts = []
    for i in range(sides):
        angle = rotation + i * 2 * math.pi / sides
        pts.append((cx + size * math.cos(angle), cy + size * math.sin(angle)))

    # Draw the main shape
    draw.polygon(pts, fill=(*fill_color, alpha))

    # Draw fold lines from center to each vertex (origami crease)
    fold_alpha = min(alpha + 20, 120)
    for pt in pts:
        draw.line([(cx, cy), pt], fill=(*fold_color, fold_alpha), width=2)

    # Draw internal triangulation lines (alternate vertices)
    if sides >= 4:
        for i in range(0, sides - 2, 2):
            draw.line([pts[i], pts[i + 2]], fill=(*fold_color, fold_alpha // 2), width=1)


def draw_origami_shapes(img, accents, fold_color, rng):
    """Draw multiple origami-style geometric shapes."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(rng.randint(6, 12)):
        color = rng.choice(accents)
        alpha = rng.randint(25, 65)
        cx = rng.randint(-100, W + 100)
        cy = rng.randint(-100, H + 100)
        size = rng.randint(80, 350)
        sides = rng.choice([3, 4, 5, 6])
        rotation = rng.uniform(0, math.pi * 2)
        draw_origami_polygon(draw, cx, cy, size, sides, rotation, color, fold_color, alpha, rng)

    return Image.alpha_composite(img, overlay)


def draw_paper_folds(img, fold_color, rng):
    """Draw long diagonal fold lines across the canvas."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(rng.randint(3, 6)):
        alpha = rng.randint(15, 40)
        x1 = rng.randint(-200, W)
        y1 = rng.randint(-200, H)
        x2 = x1 + rng.randint(400, W)
        y2 = y1 + rng.randint(-400, 400)
        draw.line([(x1, y1), (x2, y2)], fill=(*fold_color, alpha), width=rng.randint(1, 3))

    return Image.alpha_composite(img, overlay)


def draw_soft_circles(img, accents, rng):
    """Draw soft, large circles for depth."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(rng.randint(3, 6)):
        color = rng.choice(accents)
        alpha = rng.randint(8, 25)
        cx = rng.randint(-100, W + 100)
        cy = rng.randint(-100, H + 100)
        r = rng.randint(150, 500)
        draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=(*color, alpha))

    return Image.alpha_composite(img, overlay)


def draw_light_glow(img, accents, rng):
    """Draw soft white/light glow spots."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(rng.randint(2, 4)):
        # Use white-ish glow
        cx = rng.randint(int(W * 0.1), int(W * 0.9))
        cy = rng.randint(int(H * 0.1), int(H * 0.9))
        max_r = rng.randint(200, 450)

        for r in range(max_r, 0, -8):
            alpha = int(4 * (1 - r / max_r))
            if alpha > 0:
                draw.ellipse(
                    [(cx - r, cy - r), (cx + r, cy + r)],
                    fill=(255, 255, 255, alpha),
                )

    return Image.alpha_composite(img, overlay)


def draw_small_triangles(img, accents, fold_color, rng):
    """Draw small scattered origami triangles."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(rng.randint(8, 18)):
        color = rng.choice(accents)
        alpha = rng.randint(15, 45)
        cx = rng.randint(0, W)
        cy = rng.randint(0, H)
        size = rng.randint(20, 80)
        rotation = rng.uniform(0, math.pi * 2)

        pts = []
        for i in range(3):
            angle = rotation + i * 2 * math.pi / 3
            pts.append((cx + size * math.cos(angle), cy + size * math.sin(angle)))
        draw.polygon(pts, fill=(*color, alpha))

        # Fold line
        mid = ((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2)
        draw.line([mid, pts[2]], fill=(*fold_color, alpha + 10), width=1)

    return Image.alpha_composite(img, overlay)


def main():
    parser = argparse.ArgumentParser(description='Generate abstract thumbnail')
    parser.add_argument('--category', required=True, choices=PALETTES.keys())
    parser.add_argument('--output', required=True, help='Output file path')
    parser.add_argument('--seed', type=str, default='default', help='Seed string for randomness')
    args = parser.parse_args()

    seed_hash = int(hashlib.md5(args.seed.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed_hash)

    palette = PALETTES[args.category]
    accents = palette['accents']
    fold_color = palette['fold']

    # Base: bright gradient
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_gradient(draw, W, H, palette['bg1'], palette['bg2'])

    # Layers
    img = draw_light_glow(img, accents, rng)
    img = draw_soft_circles(img, accents, rng)
    img = draw_paper_folds(img, fold_color, rng)
    img = draw_origami_shapes(img, accents, fold_color, rng)
    img = draw_small_triangles(img, accents, fold_color, rng)

    # Convert and save
    img = img.convert("RGB")
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    print(f"Saved: {args.output} ({img.size})")


if __name__ == "__main__":
    main()
