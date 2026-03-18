import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
from scipy.interpolate import make_interp_spline

# --- Font setup ---
font_candidates = ['Apple SD Gothic Neo', 'AppleGothic', 'NanumGothic']
chosen_font = None
for fc in font_candidates:
    matches = [f for f in fm.fontManager.ttflist if fc in f.name]
    if matches:
        chosen_font = fc
        break

if chosen_font is None:
    chosen_font = 'Apple SD Gothic Neo'

plt.rcParams['font.family'] = chosen_font
plt.rcParams['axes.unicode_minus'] = False

# --- Colors ---
BG_COLOR = '#FFF1E0'
LINE_COLOR = '#5B8DB8'
LABEL_COLOR = '#2B6A99'
GRID_COLOR = '#E0D5C5'
TEXT_COLOR = '#333333'
LIGHT_TEXT = '#666666'

# --- Data (years and approximate hours) ---
years_raw = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]

data = {
    '전체': [1.50, 1.60, 1.72, 1.85, 2.00, 2.20, 2.40, 2.45, 2.45, 2.40, 2.35],
    '16~24세': [2.10, 2.25, 2.40, 2.55, 2.70, 2.85, 3.00, 3.00, 2.95, 2.88, 2.80],
    '25~34세': [1.70, 1.82, 1.95, 2.10, 2.25, 2.45, 2.58, 2.65, 2.70, 2.65, 2.60],
    '35~44세': [1.50, 1.58, 1.67, 1.78, 1.90, 2.05, 2.20, 2.30, 2.35, 2.33, 2.30],
    '45~54세': [1.00, 1.08, 1.18, 1.30, 1.42, 1.55, 1.68, 1.78, 1.85, 1.92, 2.00],
    '55~64세': [0.80, 0.87, 0.95, 1.03, 1.12, 1.22, 1.32, 1.40, 1.48, 1.55, 1.60],
}

# --- Smooth interpolation ---
years = np.array(years_raw)
years_smooth = np.linspace(2014, 2024, 200)

def smooth(y_raw):
    spl = make_interp_spline(years, np.array(y_raw), k=3)
    return spl(years_smooth)

# --- Figure ---
fig, axes = plt.subplots(2, 3, figsize=(14, 7), facecolor=BG_COLOR)
fig.subplots_adjust(left=0.06, right=0.96, top=0.82, bottom=0.12, hspace=0.45, wspace=0.25)

# Title and subtitle
fig.text(0.06, 0.94,
         '소셜 미디어 사용 시간은 2022년 정점을 찍었다 — 젊은 세대가 먼저 줄이고 있다',
         fontsize=16, fontweight='bold', color=TEXT_COLOR, ha='left', va='top')
fig.text(0.06, 0.895,
         '하루 평균 소셜 미디어 사용 시간 (단위: 시간)',
         fontsize=11, color=LIGHT_TEXT, ha='left', va='top')

panels = list(data.keys())

for idx, (ax, panel_name) in enumerate(zip(axes.flat, panels)):
    ax.set_facecolor(BG_COLOR)

    y_raw = data[panel_name]
    y_smooth = smooth(y_raw)

    # Grid lines
    for yv in [1.0, 1.5, 2.0, 2.5, 3.0]:
        ax.axhline(y=yv, color=GRID_COLOR, linewidth=0.7, zorder=0)

    # Line
    ax.plot(years_smooth, y_smooth, color=LINE_COLOR, linewidth=2.5, zorder=2)

    # Dot at end (2024)
    end_val = y_raw[-1]
    ax.plot(2024, end_val, 'o', color=LINE_COLOR, markersize=6, zorder=3)

    # Value label at end
    ax.text(2024.3, end_val, f'{end_val:.1f}h',
            fontsize=9, color=LABEL_COLOR, fontweight='bold',
            va='center', ha='left', zorder=4, fontfamily='Helvetica')

    # Panel title
    ax.set_title(panel_name, fontsize=12, fontweight='bold', color=TEXT_COLOR,
                 loc='left', pad=6)

    # Axes config
    ax.set_xlim(2013.5, 2025.5)
    ax.set_ylim(0.5, 3.3)
    ax.set_yticks([1.0, 1.5, 2.0, 2.5, 3.0])
    ax.set_yticklabels(['1.0 ', '1.5 ', '2.0 ', '2.5 ', '3.0 '],
                       fontsize=9, color=LIGHT_TEXT, fontfamily='Helvetica')
    ax.set_xticks([2014, 2024])
    ax.set_xticklabels(['2014', '2024'], fontsize=9, color=LIGHT_TEXT)
    ax.tick_params(axis='both', length=0)

    # Remove spines
    for spine in ax.spines.values():
        spine.set_visible(False)

# Source and credit
fig.text(0.06, 0.03, '출처: GWI', fontsize=9, color=LIGHT_TEXT, ha='left')
fig.text(0.06, 0.008,
         '원본 그래픽: John Burn-Murdoch / @jburnmurdoch, FT',
         fontsize=8, color=LIGHT_TEXT, ha='left')

out_path = '/Users/jaydenkang/Desktop/New Projects/20260316_블로그/tech/images/2025_10_03_social-media-peak/chart.png'
fig.savefig(out_path, dpi=100, facecolor=BG_COLOR, bbox_inches='tight')
plt.close()
print(f'Chart saved to: {out_path}')
