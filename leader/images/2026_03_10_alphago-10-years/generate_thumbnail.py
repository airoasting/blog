"""
AlphaGo 10th Anniversary Thumbnail — Folded Radiance
Premium papercraft Go board with a luminous stone radiating scientific transformation
"""

from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import random
import numpy as np

WIDTH, HEIGHT = 1200, 630
random.seed(42)

# Color palette
PEACH_LIGHT = np.array([255, 228, 205])
PEACH_DARK = np.array([248, 190, 165])
BLUE_DEEP = np.array([35, 80, 140])
BLUE_MID = np.array([70, 140, 195])
BLUE_LIGHT = np.array([140, 195, 230])
BLUE_PALE = np.array([195, 225, 245])
BLUE_ICE = np.array([215, 235, 250])
WHITE = np.array([255, 255, 255])
CREAM = np.array([248, 243, 235])
BOARD_TOP = np.array([215, 190, 145])
BOARD_LIGHT = np.array([225, 200, 155])
BOARD_DARK = np.array([175, 150, 110])
ORANGE = np.array([235, 160, 90])


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def create_background():
    img = Image.new('RGBA', (WIDTH, HEIGHT))
    pixels = np.zeros((HEIGHT, WIDTH, 4), dtype=np.uint8)

    for y in range(HEIGHT):
        for x in range(WIDTH):
            # Vertical gradient
            ty = y / HEIGHT
            # Radial brightness from center-top
            cx, cy_r = WIDTH / 2, HEIGHT * 0.3
            dist = math.sqrt((x - cx) ** 2 + (y - cy_r) ** 2)
            max_dist = math.sqrt(cx ** 2 + cy_r ** 2)
            tr = min(1.0, dist / (max_dist * 0.8))

            base = lerp(PEACH_LIGHT, PEACH_DARK, ty * 0.7 + tr * 0.3)
            # Add warmth toward edges
            brightness = max(0, 1.0 - tr * 0.15)
            r = min(255, int(base[0] * brightness + 10 * (1 - tr)))
            g = min(255, int(base[1] * brightness))
            b = min(255, int(base[2] * brightness))
            pixels[y, x] = [r, g, b, 255]

    img = Image.fromarray(pixels, 'RGBA')
    return img


def draw_soft_shadow(img, points, offset=(6, 10), blur=18, alpha=45):
    """Draw a soft shadow beneath a polygon"""
    shadow = Image.new('RGBA', img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    shifted = [(p[0] + offset[0], p[1] + offset[1]) for p in points]
    sd.polygon(shifted, fill=(30, 45, 70, alpha))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(img, shadow)


def draw_faceted_surface(draw, points, base_color, normal_angle=0):
    """Draw a polygon with fold-line aesthetic"""
    light = 0.85 + 0.15 * math.cos(normal_angle)
    color = tuple(min(255, int(c * light)) for c in base_color)
    draw.polygon(points, fill=color)
    # Fold edge highlights
    for i in range(len(points)):
        p1 = points[i]
        p2 = points[(i + 1) % len(points)]
        edge_color = tuple(min(255, c + 20) for c in color) + (100,)
        draw.line([p1, p2], fill=edge_color, width=1)


def draw_board(img, cx, cy, bw, bh):
    """Draw a 3D papercraft Go board"""
    draw = ImageDraw.Draw(img)

    depth = 22
    perspective = 0.08

    # Board corners (top surface with slight perspective)
    tl = (cx - bw // 2 + int(bw * perspective), cy - bh // 2)
    tr = (cx + bw // 2 - int(bw * perspective), cy - bh // 2)
    br = (cx + bw // 2, cy + bh // 2)
    bl = (cx - bw // 2, cy + bh // 2)

    top_pts = [tl, tr, br, bl]

    # Shadow
    img = draw_soft_shadow(img, top_pts, offset=(8, 14), blur=22, alpha=50)
    draw = ImageDraw.Draw(img)

    # Front face (depth)
    front_pts = [bl, br,
                 (br[0], br[1] + depth),
                 (bl[0], bl[1] + depth)]
    draw.polygon(front_pts, fill=tuple(BOARD_DARK))
    # Front face crease
    mid_x = (bl[0] + br[0]) // 2
    draw.line([(mid_x, bl[1]), (mid_x, bl[1] + depth)],
              fill=tuple(BOARD_DARK - 10), width=1)

    # Right face (depth)
    right_pts = [br, tr,
                 (tr[0] + 5, tr[1] + depth),
                 (br[0], br[1] + depth)]
    draw.polygon(right_pts, fill=tuple(BOARD_DARK + 10))

    # Top surface with subtle faceting
    # Split into triangular facets for origami look
    center = (cx, cy)

    facet_points = [tl, tr, br, bl]
    facet_colors = [
        tuple(BOARD_LIGHT + 5),   # top-left, brightest
        tuple(BOARD_TOP),         # top-right
        tuple(BOARD_TOP - 8),     # bottom-right
        tuple(BOARD_LIGHT - 5),   # bottom-left
    ]

    for i in range(4):
        p1 = facet_points[i]
        p2 = facet_points[(i + 1) % 4]
        draw.polygon([center, p1, p2], fill=facet_colors[i])
        # Subtle fold lines
        draw.line([center, p1], fill=tuple(BOARD_LIGHT + 15) + (50,), width=1)

    # Grid lines
    rows, cols = 7, 7
    margin_x = 25
    margin_y = 18

    for i in range(rows):
        t = i / (rows - 1)
        y = tl[1] + margin_y + int((bl[1] - tl[1] - 2 * margin_y) * t)
        x_left = tl[0] + margin_x + int((bl[0] - tl[0]) * t * 0.3)
        x_right = tr[0] - margin_x + int((br[0] - tr[0]) * t * 0.3)
        draw.line([(x_left, y), (x_right, y)],
                  fill=(155, 130, 90, 180), width=1)

    for j in range(cols):
        t = j / (cols - 1)
        x_top = tl[0] + margin_x + int((tr[0] - tl[0] - 2 * margin_x) * t)
        x_bot = bl[0] + margin_x + int((br[0] - bl[0] - 2 * margin_x) * t)
        y_top = tl[1] + margin_y
        y_bot = bl[1] - margin_y
        draw.line([(x_top, y_top), (x_bot, y_bot)],
                  fill=(155, 130, 90, 180), width=1)

    # Star points
    for si in [1, 3, 5]:
        for sj in [1, 3, 5]:
            if (si, sj) in [(1, 1), (1, 5), (3, 3), (5, 1), (5, 5)]:
                tx = si / (cols - 1)
                ty = sj / (rows - 1)
                sx_t = tl[0] + margin_x + int((tr[0] - tl[0] - 2 * margin_x) * tx)
                sx_b = bl[0] + margin_x + int((br[0] - bl[0] - 2 * margin_x) * tx)
                sx = int(sx_t + (sx_b - sx_t) * ty)
                sy = tl[1] + margin_y + int((bl[1] - tl[1] - 2 * margin_y) * ty)
                draw.ellipse([sx - 3, sy - 3, sx + 3, sy + 3],
                             fill=(140, 115, 80))

    return img, tl, tr, br, bl, margin_x, margin_y, rows, cols


def draw_low_poly_stone(img, cx, cy, radius, is_white=True, glow=False):
    """Draw a polished faceted Go stone"""
    draw = ImageDraw.Draw(img)

    # Stone shadow
    if radius > 15:
        shadow = Image.new('RGBA', img.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.ellipse([cx - radius + 4, cy - radius * 0.35 + 8,
                    cx + radius + 4, cy + radius * 0.35 + 8],
                   fill=(30, 40, 60, 35))
        shadow = shadow.filter(ImageFilter.GaussianBlur(8))
        img = Image.alpha_composite(img, shadow)
        draw = ImageDraw.Draw(img)

    num_segments = 10
    if is_white:
        base_colors = [
            np.array([235, 242, 250]),
            np.array([245, 248, 255]),
            np.array([225, 235, 248]),
            np.array([240, 245, 252]),
            np.array([230, 238, 250]),
        ]
    else:
        base_colors = [
            np.array([45, 55, 70]),
            np.array([55, 65, 80]),
            np.array([35, 45, 60]),
            np.array([50, 60, 75]),
            np.array([40, 50, 65]),
        ]

    aspect = 0.55  # Perspective flattening

    # Outer ring of facets
    for i in range(num_segments):
        angle1 = (2 * math.pi * i) / num_segments - math.pi / 2
        angle2 = (2 * math.pi * (i + 1)) / num_segments - math.pi / 2

        x1 = cx + radius * math.cos(angle1)
        y1 = cy + radius * math.sin(angle1) * aspect
        x2 = cx + radius * math.cos(angle2)
        y2 = cy + radius * math.sin(angle2) * aspect

        # Inner ring
        inner_r = radius * 0.5
        ix1 = cx + inner_r * math.cos(angle1)
        iy1 = cy + inner_r * math.sin(angle1) * aspect
        ix2 = cx + inner_r * math.cos(angle2)
        iy2 = cy + inner_r * math.sin(angle2) * aspect

        light = 0.82 + 0.18 * math.cos(angle1 - math.pi * 0.25)
        base = base_colors[i % len(base_colors)]
        color = tuple(min(255, int(c * light)) for c in base)

        # Outer quad facet
        draw.polygon([(x1, y1), (x2, y2), (ix2, iy2), (ix1, iy1)], fill=color)
        edge_c = tuple(min(255, c + 12) for c in color)
        draw.line([(x1, y1), (x2, y2)], fill=edge_c, width=1)
        draw.line([(ix1, iy1), (x1, y1)], fill=edge_c + (70,), width=1)

        # Inner triangle facet (brighter)
        inner_light = light * 1.08
        inner_color = tuple(min(255, int(c * inner_light)) for c in base)
        draw.polygon([(cx, cy), (ix1, iy1), (ix2, iy2)], fill=inner_color)

    # Highlight spot
    hl_size = radius * 0.18
    hl_x, hl_y = cx - radius * 0.2, cy - radius * 0.15
    draw.ellipse([hl_x - hl_size, hl_y - hl_size,
                  hl_x + hl_size, hl_y + hl_size],
                 fill=(255, 255, 255, 70 if is_white else 40))

    if glow:
        glow_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow_layer)
        for r in range(int(radius * 2.5), 0, -2):
            alpha = max(0, int(18 * (1 - r / (radius * 2.5))))
            gd.ellipse([cx - r, cy - int(r * aspect), cx + r, cy + int(r * aspect)],
                       fill=(200, 220, 255, alpha))
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(12))
        img = Image.alpha_composite(img, glow_layer)

    return img


def draw_paper_airplane(img, cx, cy, size, angle, color_tuple):
    """Draw an origami paper airplane with 3D faceting"""
    draw = ImageDraw.Draw(img)
    s = size

    cos_a, sin_a = math.cos(angle), math.sin(angle)

    def rot(px, py):
        return (px * cos_a - py * sin_a + cx,
                px * sin_a + py * cos_a + cy)

    # Fuselage
    nose = rot(0, -s)
    tail_l = rot(-s * 0.15, s * 0.3)
    tail_r = rot(s * 0.15, s * 0.3)

    # Wings
    wing_l = rot(-s * 0.7, s * 0.15)
    wing_r = rot(s * 0.7, s * 0.15)
    wing_mid = rot(0, s * 0.05)

    # Left wing (darker)
    c_dark = tuple(max(0, int(c * 0.85)) for c in color_tuple)
    draw.polygon([nose, wing_l, wing_mid], fill=c_dark)

    # Right wing (lighter)
    draw.polygon([nose, wing_r, wing_mid], fill=color_tuple)

    # Body crease
    draw.line([nose, rot(0, s * 0.3)],
              fill=tuple(min(255, c + 30) for c in color_tuple) + (150,), width=1)

    return img


def draw_origami_helix(img, start_x, start_y, angle, length, color, segments=14):
    """Draw a stylized double helix in origami ribbon style"""
    draw = ImageDraw.Draw(img)
    cos_a, sin_a = math.cos(angle), math.sin(angle)

    for strand in [1, -1]:
        for i in range(segments):
            t1 = i / segments
            t2 = (i + 1) / segments

            # Position along the ray
            d1 = length * t1
            d2 = length * t2

            base_x1 = start_x + cos_a * d1
            base_y1 = start_y + sin_a * d1
            base_x2 = start_x + cos_a * d2
            base_y2 = start_y + sin_a * d2

            # Perpendicular wave
            perp_x, perp_y = -sin_a, cos_a
            amp = 12 * (1 - t1 * 0.4)
            wave1 = math.sin(t1 * math.pi * 5) * amp * strand
            wave2 = math.sin(t2 * math.pi * 5) * amp * strand

            x1 = base_x1 + perp_x * wave1
            y1 = base_y1 + perp_y * wave1
            x2 = base_x2 + perp_x * wave2
            y2 = base_y2 + perp_y * wave2

            # Ribbon width
            w = 3 * (1 - t1 * 0.5)
            nx, ny = perp_x * w, perp_y * w

            pts = [(x1 - nx, y1 - ny), (x1 + nx, y1 + ny),
                   (x2 + nx, y2 + ny), (x2 - nx, y2 - ny)]

            alpha = max(50, int(200 * (1 - t1 * 0.7)))
            light = 0.8 + 0.2 * abs(math.sin(t1 * math.pi * 5))
            c = tuple(min(255, int(v * light)) for v in color) + (alpha,)

            draw.polygon(pts, fill=c)

        # Cross-rungs
        for i in range(0, segments, 3):
            t = i / segments
            d = length * t
            bx = start_x + cos_a * d
            by = start_y + sin_a * d

            amp = 12 * (1 - t * 0.4)
            wave_pos = math.sin(t * math.pi * 5) * amp
            wave_neg = -wave_pos

            px1 = bx + perp_x * wave_pos
            py1 = by + perp_y * wave_pos
            px2 = bx + perp_x * wave_neg
            py2 = by + perp_y * wave_neg

            alpha = max(40, int(150 * (1 - t * 0.7)))
            draw.line([(px1, py1), (px2, py2)],
                      fill=tuple(color) + (alpha,), width=1)

    return img


def draw_origami_crystal(img, cx, cy, size, color):
    """Draw a small faceted crystal/diamond"""
    draw = ImageDraw.Draw(img)
    h = size
    w = size * 0.65

    top = (cx, cy - h)
    right = (cx + w, cy)
    bottom = (cx, cy + h * 0.6)
    left = (cx - w, cy)

    # Four facets
    facets = [
        ([top, right, (cx, cy)], 1.1),
        ([right, bottom, (cx, cy)], 0.85),
        ([bottom, left, (cx, cy)], 0.7),
        ([left, top, (cx, cy)], 0.95),
    ]

    for pts, light in facets:
        c = tuple(min(255, int(v * light)) for v in color)
        draw.polygon(pts, fill=c)
        draw.polygon(pts, outline=tuple(min(255, v + 15) for v in c))

    return img


def draw_scattered_particles(img, cx, cy, min_r, max_r, count=30):
    """Draw tiny geometric confetti particles"""
    draw = ImageDraw.Draw(img)
    colors = [
        tuple(BLUE_LIGHT), tuple(BLUE_PALE), tuple(BLUE_ICE),
        tuple(WHITE), tuple(ORANGE), tuple(BLUE_MID),
    ]

    for _ in range(count):
        angle = random.uniform(0, 2 * math.pi)
        dist = random.uniform(min_r, max_r)
        px = cx + dist * math.cos(angle)
        py = cy + dist * math.sin(angle) * 0.75

        if px < 20 or px > WIDTH - 20 or py < 15 or py > HEIGHT - 15:
            continue

        size = random.randint(2, 6)
        alpha = random.randint(60, 180)
        color = random.choice(colors) + (alpha,)

        shape = random.choice(['diamond', 'triangle', 'dot'])
        if shape == 'diamond':
            pts = [(px, py - size), (px + size * 0.7, py),
                   (px, py + size), (px - size * 0.7, py)]
            draw.polygon(pts, fill=color)
        elif shape == 'triangle':
            a = random.uniform(0, math.pi)
            pts = []
            for k in range(3):
                ta = a + k * 2 * math.pi / 3
                pts.append((px + size * math.cos(ta), py + size * math.sin(ta)))
            draw.polygon(pts, fill=color)
        else:
            draw.ellipse([px - size * 0.6, py - size * 0.6,
                         px + size * 0.6, py + size * 0.6], fill=color)

    return img


def draw_light_burst(img, cx, cy, num_rays=20, max_len=250):
    """Subtle radial light burst"""
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)

    for i in range(num_rays):
        angle = (2 * math.pi * i) / num_rays + random.uniform(-0.08, 0.08)
        length = random.randint(80, max_len)
        spread = random.uniform(0.02, 0.06)

        x0 = cx + 20 * math.cos(angle)
        y0 = cy + 20 * math.sin(angle)
        x1 = cx + length * math.cos(angle - spread)
        y1 = cy + length * math.sin(angle - spread)
        x2 = cx + length * math.cos(angle + spread)
        y2 = cy + length * math.sin(angle + spread)

        alpha = random.randint(6, 16)
        od.polygon([(x0, y0), (x1, y1), (x2, y2)],
                   fill=(255, 255, 255, alpha))

    overlay = overlay.filter(ImageFilter.GaussianBlur(5))
    return Image.alpha_composite(img, overlay)


def main():
    # === Background ===
    print("Creating background...")
    img = create_background()

    cx, cy = WIDTH // 2, HEIGHT // 2 + 20

    # === Go Board ===
    print("Drawing board...")
    board_w, board_h = 300, 200
    img, tl, tr, br, bl, mx, my, rows, cols = draw_board(img, cx, cy + 40, board_w, board_h)

    # === Small stones on board ===
    print("Drawing stones on board...")
    # Calculate grid positions
    def grid_pos(col, row):
        tx = col / (cols - 1)
        ty = row / (rows - 1)
        x_t = tl[0] + mx + int((tr[0] - tl[0] - 2 * mx) * tx)
        x_b = bl[0] + mx + int((br[0] - bl[0] - 2 * mx) * tx)
        x = int(x_t + (x_b - x_t) * ty)
        y = tl[1] + my + int((bl[1] - tl[1] - 2 * my) * ty)
        return x, y

    stones = [
        (1, 1, False), (2, 3, True), (4, 2, False),
        (5, 4, True), (3, 5, False), (1, 4, True),
        (4, 5, True), (5, 1, False), (2, 1, True),
    ]
    for c, r, is_white in stones:
        sx, sy = grid_pos(c, r)
        img = draw_low_poly_stone(img, sx, sy, 9, is_white=is_white)

    # === Light burst from center stone ===
    stone_cx, stone_cy = cx, cy - 65
    print("Drawing light burst...")
    img = draw_light_burst(img, stone_cx, stone_cy, num_rays=24, max_len=320)

    # === Central luminous stone (Move 37) ===
    print("Drawing central stone...")
    img = draw_low_poly_stone(img, stone_cx, stone_cy, 48, is_white=True, glow=True)

    # === Radiating helices (protein/DNA structures) ===
    print("Drawing helices...")
    helix_rays = [
        (-2.2, 190, tuple(BLUE_MID)),
        (-1.0, 210, tuple(BLUE_LIGHT)),
        (-0.3, 170, tuple(BLUE_DEEP)),
        (0.4, 200, tuple(BLUE_MID)),
        (-2.8, 160, tuple(BLUE_PALE)),
        (1.0, 180, tuple(BLUE_LIGHT)),
        (2.5, 150, tuple(BLUE_MID)),
        (3.2, 170, tuple(BLUE_PALE)),
        (-3.5, 140, tuple(BLUE_LIGHT)),
    ]
    for angle, length, color in helix_rays:
        img = draw_origami_helix(img, stone_cx, stone_cy, angle, length, color)

    # === Paper airplanes (knowledge expanding) ===
    print("Drawing paper planes...")
    planes = [
        (-300, -140, 22, -0.5, tuple(BLUE_LIGHT)),
        (280, -120, 18, 0.4, tuple(BLUE_PALE)),
        (-350, 40, 15, -0.7, tuple(BLUE_MID)),
        (320, 20, 16, 0.6, tuple(WHITE)),
        (-250, -190, 14, -0.3, tuple(ORANGE)),
        (250, -170, 16, 0.5, tuple(BLUE_LIGHT)),
        (-380, -60, 12, -0.6, tuple(BLUE_PALE)),
        (370, 90, 13, 0.4, tuple(BLUE_MID)),
        (180, 140, 11, 0.3, tuple(BLUE_LIGHT)),
        (-200, 130, 12, -0.4, tuple(WHITE)),
        (-420, 120, 10, -0.8, tuple(BLUE_ICE)),
        (420, -80, 11, 0.7, tuple(BLUE_PALE)),
        (100, -200, 14, 0.2, tuple(ORANGE)),
        (-150, -210, 13, -0.2, tuple(BLUE_LIGHT)),
    ]
    for dx, dy, size, angle, color in planes:
        img = draw_paper_airplane(img, cx + dx, cy - 65 + dy, size, angle, color)

    # === Floating crystals ===
    print("Drawing crystals...")
    crystals = [
        (-220, -130, 16, tuple(BLUE_MID)),
        (200, -100, 13, tuple(BLUE_LIGHT)),
        (-280, 30, 11, tuple(BLUE_PALE)),
        (260, -40, 14, tuple(BLUE_MID)),
        (180, 100, 10, tuple(ORANGE)),
        (-200, 120, 11, tuple(BLUE_LIGHT)),
        (-340, -100, 9, tuple(BLUE_PALE)),
        (330, 60, 8, tuple(ORANGE)),
        (-160, -175, 12, tuple(BLUE_MID)),
        (140, -170, 10, tuple(BLUE_LIGHT)),
        (350, -150, 10, tuple(BLUE_PALE)),
        (-380, 80, 8, tuple(BLUE_ICE)),
        (0, -220, 11, tuple(BLUE_MID)),
        (-80, 170, 9, tuple(BLUE_LIGHT)),
        (100, 160, 8, tuple(BLUE_PALE)),
    ]
    for dx, dy, size, color in crystals:
        img = draw_origami_crystal(img, cx + dx, cy - 65 + dy, size, color)

    # === Scattered particles ===
    print("Drawing particles...")
    img = draw_scattered_particles(img, stone_cx, stone_cy, 90, 500, count=50)

    # === Final glow polish ===
    glow = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for r in range(120, 0, -1):
        alpha = max(0, int(12 * (1 - r / 120)))
        gd.ellipse([stone_cx - r, stone_cy - r,
                    stone_cx + r, stone_cy + r],
                   fill=(220, 235, 255, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(10))
    img = Image.alpha_composite(img, glow)

    # === Save ===
    final = img.convert('RGB')
    output_path = "/Users/jaydenkang/Desktop/New Projects/20260316_블로그/leader/images/2026_03_10_alphago-10-years/thumbnail.png"
    final.save(output_path, 'PNG', quality=95)
    print(f"Saved: {output_path}")
    print(f"Size: {final.size}")


if __name__ == '__main__':
    main()
