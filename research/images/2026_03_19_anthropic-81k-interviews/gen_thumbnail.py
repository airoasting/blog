from PIL import Image, ImageDraw, ImageFont
import os

FONTS = "/Users/jaydenkang/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/8bf9482e-3307-41c1-bcad-454849ba7947/b8f4466d-06bf-4787-8889-e634d5ea49c1/skills/canvas-design/canvas-fonts"
KO_TTC = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
OUT    = "/Users/jaydenkang/Desktop/New Projects/20260316_블로그/research/images/2026_03_19_anthropic-81k-interviews/thumbnail.png"

W, H = 1200, 630

# ── Colors ────────────────────────────────────────────────
BG        = (7, 10, 22)
WHITE     = (245, 247, 252)
BLUE      = (59, 130, 246)
BLUE_SOFT = (96, 165, 250)
AMBER     = (251, 168, 36)
MUTED     = (90, 105, 130)
GRID_LINE = (14, 21, 46)
DIVIDER   = (20, 33, 68)

# ── Fonts ──────────────────────────────────────────────────
def lf(name, size):
    """Latin font from canvas-fonts dir"""
    return ImageFont.truetype(os.path.join(FONTS, name), size)

def kf(size, index=6):
    """Korean font: AppleSDGothicNeo (index 6=Bold, 0=Regular, 16=Heavy)"""
    return ImageFont.truetype(KO_TTC, size, index=index)

# Number fonts (Latin — BigShoulders is numeric/latin only)
fnt_num_xl   = lf("BigShoulders-Bold.ttf",  108)
fnt_num_lg   = lf("BigShoulders-Bold.ttf",   80)
fnt_num_md   = lf("BigShoulders-Bold.ttf",   72)

# Korean title fonts
fnt_ko_title = kf(38, index=6)   # Bold
fnt_ko_big   = kf(50, index=16)  # Heavy

# Label / mono fonts (English, small)
fnt_label    = lf("InstrumentSans-Regular.ttf", 15)
fnt_mono     = lf("GeistMono-Regular.ttf",       12)
fnt_mono_b   = lf("GeistMono-Bold.ttf",          13)
fnt_tag      = lf("WorkSans-Bold.ttf",            11)

# Korean label / small
fnt_ko_label = kf(14, index=0)   # Regular
fnt_ko_sm    = kf(13, index=0)

# ── Canvas ─────────────────────────────────────────────────
img  = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# Subtle horizontal grid
for y in range(0, H, 38):
    draw.line([(0, y), (W, y)], fill=GRID_LINE, width=1)

# Top accent stripe
draw.rectangle([(0, 0), (W, 5)], fill=BLUE)

# Vertical separator
SEP_X = 660
draw.rectangle([(SEP_X, 30), (SEP_X + 1, H - 30)], fill=DIVIDER)

# ══════════════════════════════════════════════════════════
#  LEFT SIDE
# ══════════════════════════════════════════════════════════
L = 58

# RESEARCH tag
draw.rectangle([(L, 38), (L + 82, 58)], fill=BLUE)
draw.text((L + 8, 40), "RESEARCH", font=fnt_tag, fill=WHITE)

# Date (mono)
draw.text((L + 94, 40), "2026.03.19", font=fnt_mono, fill=MUTED)

# Korean title line 1
T1_Y = 88
draw.text((L, T1_Y), "8만 1천 명이 AI에게 원하는 것", font=fnt_ko_title, fill=WHITE)

# Korean title line 2 — accent
T2_Y = T1_Y + 52
draw.text((L, T2_Y), "Anthropic 인터뷰", font=fnt_ko_big, fill=BLUE_SOFT)

# Divider
DIV_Y = T2_Y + 72
draw.rectangle([(L, DIV_Y), (L + 320, DIV_Y + 1)], fill=DIVIDER)

# English sub
ENG_Y = DIV_Y + 14
draw.text((L, ENG_Y), "What 80,508 People Want from AI", font=fnt_label, fill=MUTED)

# ── Mini bar chart ─────────────────────────────────────────
bars = [
    ("직업적 탁월함", 18.8, BLUE),
    ("삶의 관리",    13.5, BLUE_SOFT),
    ("시간 회복",    11.1, (100, 160, 240)),
    ("경제적 독립",   9.7, (80, 140, 220)),
    ("학습·성장",     8.4, (60, 120, 200)),
]
BAR_Y  = ENG_Y + 36
MAX_W  = 232
BAR_H  = 9
GAP    = 24

for label, val, color in bars:
    # bg track
    draw.rectangle([(L, BAR_Y), (L + MAX_W, BAR_Y + BAR_H)], fill=(12, 20, 46))
    # fill
    fw = int(MAX_W * val / 22)
    draw.rectangle([(L, BAR_Y), (L + fw, BAR_Y + BAR_H)], fill=color)
    # value
    draw.text((L + MAX_W + 7, BAR_Y - 1), f"{val}%", font=fnt_mono, fill=MUTED)
    BAR_Y += GAP

# ══════════════════════════════════════════════════════════
#  RIGHT SIDE — Big Stats
# ══════════════════════════════════════════════════════════
RX = SEP_X + 52

fnt_ko_suffix_xl = kf(52, index=6)
fnt_ko_suffix_lg = kf(44, index=6)

def stat_mixed(y, latin_num, ko_suffix, label, color, num_font, ko_sfx_font, lbl_font):
    """Render Latin number + Korean suffix on same baseline, label below."""
    # Number (Latin font)
    draw.text((RX, y), latin_num, font=num_font, fill=color)
    bb_n = draw.textbbox((0, 0), latin_num, font=num_font)
    nw, nh = bb_n[2] - bb_n[0], bb_n[3] - bb_n[1]
    # Korean suffix aligned to bottom of number
    if ko_suffix:
        bb_k = draw.textbbox((0, 0), ko_suffix, font=ko_sfx_font)
        kh = bb_k[3] - bb_k[1]
        draw.text((RX + nw + 3, y + nh - kh - 4), ko_suffix, font=ko_sfx_font, fill=color)
    # Label below
    draw.text((RX, y + nh + 4), label, font=lbl_font, fill=MUTED)
    return y + nh + 4 + 20

# Stat 1: 80,508명
y = 50
y = stat_mixed(y, "80,508", "명", "명이 말했다", WHITE, fnt_num_xl, fnt_ko_suffix_xl, fnt_ko_label)

draw.rectangle([(RX, y + 2), (RX + 450, y + 3)], fill=DIVIDER)
y += 18

# Stat 2: 159개국
y = stat_mixed(y, "159", "개국", "에서 참여", BLUE_SOFT, fnt_num_lg, fnt_ko_suffix_lg, fnt_ko_label)

draw.rectangle([(RX, y + 2), (RX + 450, y + 3)], fill=DIVIDER)
y += 18

# Stat 3: 67%
stat_mixed(y, "67%", "", "AI 긍정 응답 (전 세계)", AMBER, fnt_num_md, fnt_ko_sm, fnt_ko_sm)

# ══════════════════════════════════════════════════════════
#  BOTTOM
# ══════════════════════════════════════════════════════════
draw.rectangle([(0, H - 5), (W, H)], fill=DIVIDER)

draw.text((L, H - 30), "airoasting.github.io/blog", font=fnt_mono, fill=(32, 52, 100))

bb = draw.textbbox((0, 0), "AI ROASTING", font=fnt_mono_b)
bw = bb[2] - bb[0]
draw.text((W - bw - L, H - 30), "AI ROASTING", font=fnt_mono_b, fill=MUTED)

img.save(OUT, "PNG")
print(f"Saved → {OUT}")
