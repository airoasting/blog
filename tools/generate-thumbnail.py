#!/usr/bin/env python3
"""Generate abstract thumbnail for blog posts (no text)."""
import argparse
import math
import random
import hashlib
from PIL import Image, ImageDraw

W, H = 2400, 1260

PALETTES = {
    'research': {
        'bg1': (28, 28, 38), 'bg2': (42, 42, 58),
        'accents': [(90, 130, 200), (65, 105, 175), (130, 165, 215), (45, 75, 135), (170, 190, 230)],
    },
    'leader': {
        'bg1': (55, 18, 8), 'bg2': (75, 28, 12),
        'accents': [(215, 75, 25), (195, 55, 15), (250, 135, 55), (175, 45, 5), (255, 180, 100)],
    },
    'company': {
        'bg1': (12, 32, 55), 'bg2': (18, 48, 78),
        'accents': [(35, 115, 195), (55, 135, 215), (75, 155, 235), (25, 95, 175), (120, 180, 250)],
    },
    'tech': {
        'bg1': (8, 38, 22), 'bg2': (12, 52, 32),
        'accents': [(35, 175, 95), (25, 155, 75), (55, 195, 115), (15, 135, 65), (90, 220, 140)],
    },
    'survival': {
        'bg1': (48, 12, 12), 'bg2': (68, 18, 18),
        'accents': [(195, 55, 55), (175, 35, 35), (215, 75, 75), (155, 25, 25), (235, 110, 110)],
    },
}


def draw_gradient(draw, w, h, c1, c2):
    for y in range(h):
        t = y / h
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))


def smooth_curve(points, iterations=3):
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


def draw_flowing_curves(img, accents, rng):
    """Draw organic flowing curves across the canvas."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(rng.randint(4, 7)):
        color = rng.choice(accents)
        alpha = rng.randint(30, 70)
        width = rng.randint(3, 8)
        n_points = rng.randint(5, 10)

        pts = []
        start_y = rng.randint(0, H)
        for i in range(n_points):
            x = int(W * i / (n_points - 1))
            y = start_y + rng.randint(-300, 300)
            pts.append((x, y))

        smooth = smooth_curve(pts, iterations=4)
        for i in range(len(smooth) - 1):
            draw.line([smooth[i], smooth[i + 1]], fill=(*color, alpha), width=width)

    return Image.alpha_composite(img, overlay)


def draw_circles(img, accents, rng):
    """Draw large semi-transparent circles."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(rng.randint(5, 10)):
        color = rng.choice(accents)
        alpha = rng.randint(12, 35)
        cx = rng.randint(-200, W + 200)
        cy = rng.randint(-200, H + 200)
        r = rng.randint(80, 450)
        draw.ellipse(
            [(cx - r, cy - r), (cx + r, cy + r)],
            fill=(*color, alpha),
        )

    return Image.alpha_composite(img, overlay)


def draw_geometric(img, accents, rng):
    """Draw geometric shapes (triangles, rectangles)."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(rng.randint(3, 6)):
        color = rng.choice(accents)
        alpha = rng.randint(15, 40)
        shape_type = rng.choice(['triangle', 'rect'])

        if shape_type == 'triangle':
            cx, cy = rng.randint(0, W), rng.randint(0, H)
            size = rng.randint(100, 350)
            rot = rng.uniform(0, math.pi * 2)
            pts = []
            for i in range(3):
                a = rot + i * 2 * math.pi / 3
                pts.append((cx + size * math.cos(a), cy + size * math.sin(a)))
            draw.polygon(pts, fill=(*color, alpha))
        else:
            x = rng.randint(-100, W)
            y = rng.randint(-100, H)
            w = rng.randint(80, 400)
            h = rng.randint(80, 300)
            draw.rectangle([(x, y), (x + w, y + h)], fill=(*color, alpha))

    return Image.alpha_composite(img, overlay)


def draw_dots(img, accents, rng):
    """Draw small accent dots."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(rng.randint(20, 50)):
        color = rng.choice(accents)
        alpha = rng.randint(30, 80)
        cx = rng.randint(0, W)
        cy = rng.randint(0, H)
        r = rng.randint(3, 15)
        draw.ellipse(
            [(cx - r, cy - r), (cx + r, cy + r)],
            fill=(*color, alpha),
        )

    return Image.alpha_composite(img, overlay)


def draw_grid_lines(img, accents, rng):
    """Draw subtle grid/line patterns."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    color = rng.choice(accents)
    alpha = rng.randint(8, 18)

    # Horizontal lines
    spacing = rng.randint(60, 120)
    offset = rng.randint(0, spacing)
    for y in range(offset, H, spacing):
        draw.line([(0, y), (W, y)], fill=(*color, alpha), width=1)

    # Vertical lines
    spacing = rng.randint(60, 120)
    offset = rng.randint(0, spacing)
    for x in range(offset, W, spacing):
        draw.line([(x, 0), (x, H)], fill=(*color, alpha), width=1)

    return Image.alpha_composite(img, overlay)


def draw_glow(img, accents, rng):
    """Draw soft glow spots."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for _ in range(rng.randint(2, 4)):
        color = rng.choice(accents)
        cx = rng.randint(int(W * 0.1), int(W * 0.9))
        cy = rng.randint(int(H * 0.1), int(H * 0.9))
        max_r = rng.randint(200, 500)

        for r in range(max_r, 0, -5):
            alpha = int(3 * (1 - r / max_r))
            if alpha > 0:
                draw.ellipse(
                    [(cx - r, cy - r), (cx + r, cy + r)],
                    fill=(*color, alpha),
                )

    return Image.alpha_composite(img, overlay)


def main():
    parser = argparse.ArgumentParser(description='Generate abstract thumbnail')
    parser.add_argument('--category', required=True, choices=PALETTES.keys())
    parser.add_argument('--output', required=True, help='Output file path')
    parser.add_argument('--seed', type=str, default='default', help='Seed string for randomness')
    args = parser.parse_args()

    # Deterministic seed from string
    seed_hash = int(hashlib.md5(args.seed.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed_hash)

    palette = PALETTES[args.category]
    accents = palette['accents']

    # Create base image with gradient
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_gradient(draw, W, H, palette['bg1'], palette['bg2'])

    # Layer abstract elements
    img = draw_glow(img, accents, rng)
    img = draw_grid_lines(img, accents, rng)
    img = draw_circles(img, accents, rng)
    img = draw_geometric(img, accents, rng)
    img = draw_flowing_curves(img, accents, rng)
    img = draw_dots(img, accents, rng)

    # Convert and save
    img = img.convert("RGB")
    img.save(args.output, "PNG", optimize=True)
    print(f"Saved: {args.output} ({img.size})")


if __name__ == "__main__":
    main()
