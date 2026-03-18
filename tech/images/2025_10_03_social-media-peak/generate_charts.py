import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np

np.random.seed(42)

# Font and style setup
plt.rcParams['font.family'] = 'Apple SD Gothic Neo'
plt.rcParams['axes.unicode_minus'] = False

# ===== Shared constants =====
SOURCE_TEXT = "출처: GWI"
CREDIT_TEXT = "원본 그래픽: John Burn-Murdoch / @jburnmurdoch, \u00a9FT"
TITLE_SIZE = 18
SUBTITLE_SIZE = 13
PANEL_TITLE_SIZE = 14
TICK_SIZE = 11
LABEL_SIZE = 11
SOURCE_SIZE = 10
FIG_SIZE = (16, 6)
MARGIN_LEFT = 0.05
DPI = 150

def add_noise(y, scale=0.02):
    return y + np.random.normal(0, scale, len(y))

def interp_smooth(years_key, vals_key, years_full):
    return np.interp(years_full, years_key, vals_key)

def style_spine(ax):
    for spine in ax.spines.values():
        spine.set_visible(False)

OUT_DIR = "/Users/jaydenkang/Desktop/New Projects/20260316_블로그/tech/images/2025_10_03_social-media-peak/"

# ============================================================
# Chart 1: chart_age.png
# ============================================================
fig, axes = plt.subplots(1, 6, figsize=FIG_SIZE, facecolor='none', sharey=True)
fig.subplots_adjust(top=0.75, bottom=0.14, left=MARGIN_LEFT, right=0.97, wspace=0.15)

fig.text(MARGIN_LEFT, 0.92, "소셜 미디어 사용 시간은 2022년 정점을 찍었으며, 젊은 세대가 먼저 줄이고 있다",
         fontsize=TITLE_SIZE, fontweight='bold', color='#333333', ha='left')
fig.text(MARGIN_LEFT, 0.85, "하루 평균 소셜 미디어 사용 시간 (단위: 시간)",
         fontsize=SUBTITLE_SIZE, color='#666666', ha='left')

years_full = np.arange(2012, 2025)

age_data = {
    '전체': {
        'keys': [2012, 2014, 2016, 2018, 2020, 2021, 2022, 2023, 2024],
        'vals': [1.5, 1.65, 1.85, 2.1, 2.45, 2.43, 2.45, 2.40, 2.35],
        'color': '#1A3A5C', 'lw': 2.5
    },
    '16~24세': {
        'keys': [2012, 2014, 2016, 2018, 2020, 2021, 2022, 2023, 2024],
        'vals': [2.1, 2.3, 2.5, 2.75, 3.0, 2.95, 2.92, 2.85, 2.8],
        'color': '#5B8DB8', 'lw': 2.0
    },
    '25~34세': {
        'keys': [2012, 2014, 2016, 2018, 2020, 2021, 2022, 2023, 2024],
        'vals': [1.7, 1.85, 2.05, 2.35, 2.55, 2.62, 2.7, 2.65, 2.6],
        'color': '#5B8DB8', 'lw': 2.0
    },
    '35~44세': {
        'keys': [2012, 2014, 2016, 2018, 2020, 2021, 2022, 2023, 2024],
        'vals': [1.5, 1.6, 1.75, 2.0, 2.2, 2.28, 2.35, 2.35, 2.3],
        'color': '#5B8DB8', 'lw': 2.0
    },
    '45~54세': {
        'keys': [2012, 2014, 2016, 2018, 2020, 2021, 2022, 2023, 2024],
        'vals': [1.0, 1.1, 1.25, 1.45, 1.65, 1.75, 1.85, 1.92, 2.0],
        'color': '#5B8DB8', 'lw': 2.0
    },
    '55~64세': {
        'keys': [2012, 2014, 2016, 2018, 2020, 2021, 2022, 2023, 2024],
        'vals': [0.8, 0.88, 0.98, 1.1, 1.25, 1.35, 1.42, 1.52, 1.6],
        'color': '#5B8DB8', 'lw': 2.0
    },
}

for idx, (label, d) in enumerate(age_data.items()):
    ax = axes[idx]
    ax.set_facecolor('none')
    y_interp = interp_smooth(d['keys'], d['vals'], years_full)
    y_noisy = add_noise(y_interp, scale=0.015)
    y_noisy[0] = d['vals'][0]
    y_noisy[-1] = d['vals'][-1]

    ax.plot(years_full, y_noisy, color=d['color'], linewidth=d['lw'], solid_capstyle='round')
    ax.plot(years_full[-1], y_noisy[-1], 'o', color=d['color'], markersize=6, zorder=5)

    ax.set_ylim(0.5, 3.2)
    ax.set_xlim(2012, 2024)
    ax.set_yticks([1.0, 1.5, 2.0, 2.5, 3.0])
    ax.set_xticks([2014, 2024])
    ax.set_xticklabels(['2014', '2024'], fontsize=TICK_SIZE, color='#888888')
    ax.tick_params(axis='y', labelsize=TICK_SIZE, colors='#888888', length=0)
    ax.grid(axis='y', color='#DDDDDD', linewidth=0.5, linestyle='-')
    ax.grid(axis='x', visible=False)
    style_spine(ax)
    ax.tick_params(axis='x', length=0)
    ax.set_title(label, fontsize=PANEL_TITLE_SIZE, fontweight='bold', color='#333333', pad=10)
    if idx > 0:
        ax.tick_params(axis='y', labelleft=False)

fig.text(MARGIN_LEFT, 0.03, SOURCE_TEXT, fontsize=SOURCE_SIZE, color='#999999', ha='left')
fig.text(MARGIN_LEFT, 0.005, CREDIT_TEXT, fontsize=SOURCE_SIZE, color='#999999', ha='left')

plt.savefig(OUT_DIR + "chart_age.png", dpi=DPI, facecolor='none', bbox_inches='tight', transparent=True)
plt.close()
print("chart_age.png saved.")

# ============================================================
# Chart 2: chart_reason.png
# ============================================================
fig, ax = plt.subplots(figsize=FIG_SIZE, facecolor='none')
ax.set_facecolor('none')
fig.subplots_adjust(top=0.75, bottom=0.14, left=MARGIN_LEFT, right=0.75)

fig.text(MARGIN_LEFT, 0.92, "소셜 미디어는 점점 덜 '소셜'해지고 있다",
         fontsize=TITLE_SIZE, fontweight='bold', color='#333333', ha='left')
fig.text(MARGIN_LEFT, 0.85, "소셜 미디어 사용 이유별 응답 비율 변화 (%포인트, 2014년 대비)",
         fontsize=SUBTITLE_SIZE, color='#666666', ha='left')

years_r = np.arange(2014, 2025)

reason_data = {
    '셀러브리티 팔로우': {
        'keys': [2014, 2016, 2018, 2020, 2022, 2023, 2024],
        'vals': [0, 5, 12, 18, 25, 20, 15],
        'color': '#CC3333'
    },
    '빈 시간 때우기': {
        'keys': [2014, 2016, 2018, 2020, 2022, 2023, 2024],
        'vals': [0, 1, 2, 4, 5.5, 5, 5],
        'color': '#660022'
    },
    '새로운 사람 만나기': {
        'keys': [2014, 2016, 2018, 2020, 2022, 2023, 2024],
        'vals': [0, -5, -10, -18, -24, -27, -30],
        'color': '#7FDBFF'
    },
    '친구와 연락 유지': {
        'keys': [2014, 2016, 2018, 2020, 2022, 2023, 2024],
        'vals': [0, -5, -12, -22, -32, -38, -42],
        'color': '#1A3A5C'
    },
    '내 의견 표현': {
        'keys': [2014, 2016, 2018, 2020, 2022, 2023, 2024],
        'vals': [0, -6, -14, -24, -34, -39, -45],
        'color': '#5B8DB8'
    },
}

label_y_offsets = {
    '셀러브리티 팔로우': 0,
    '빈 시간 때우기': 0,
    '새로운 사람 만나기': 0,
    '친구와 연락 유지': 4,
    '내 의견 표현': -4,
}

for label, d in reason_data.items():
    y_interp = interp_smooth(d['keys'], d['vals'], years_r)
    y_noisy = add_noise(y_interp, scale=0.4)
    y_noisy[0] = d['vals'][0]
    y_noisy[-1] = d['vals'][-1]

    ax.plot(years_r, y_noisy, color=d['color'], linewidth=2.5, solid_capstyle='round')
    ax.plot(years_r[-1], y_noisy[-1], 'o', color=d['color'], markersize=6, zorder=5)
    y_label = y_noisy[-1] + label_y_offsets[label]
    ax.text(years_r[-1] + 0.3, y_label, label, fontsize=LABEL_SIZE, color=d['color'],
            va='center', fontweight='bold')

ax.axhline(y=0, color='#333333', linewidth=0.8)
ax.set_ylim(-55, 35)
ax.set_xlim(2014, 2024)
ax.set_xticks([2014, 2019, 2024])
ax.set_xticklabels(['2014', '2019', '2024'], fontsize=TICK_SIZE, color='#888888')
ax.set_yticks([-40, -20, 0, 20])
ax.set_yticklabels(['-40', '-20', '+0', '+20'], fontsize=TICK_SIZE, color='#888888')
ax.grid(axis='y', color='#DDDDDD', linewidth=0.5)
ax.grid(axis='x', visible=False)
style_spine(ax)
ax.tick_params(length=0)

fig.text(MARGIN_LEFT, 0.03, SOURCE_TEXT, fontsize=SOURCE_SIZE, color='#999999', ha='left')
fig.text(MARGIN_LEFT, 0.005, CREDIT_TEXT, fontsize=SOURCE_SIZE, color='#999999', ha='left')

plt.savefig(OUT_DIR + "chart_reason.png", dpi=DPI, facecolor='none', bbox_inches='tight', transparent=True)
plt.close()
print("chart_reason.png saved.")

# ============================================================
# Chart 3: chart_region.png
# ============================================================
fig, axes = plt.subplots(1, 4, figsize=FIG_SIZE, facecolor='none', sharey=True)
fig.subplots_adjust(top=0.75, bottom=0.14, left=MARGIN_LEFT, right=0.97, wspace=0.15)

fig.text(MARGIN_LEFT, 0.92, "미국인의 소셜미디어 사용은 글로벌 추세와 달리 아직 줄지 않고 있다",
         fontsize=TITLE_SIZE, fontweight='bold', color='#333333', ha='left')
fig.text(MARGIN_LEFT, 0.85, "하루 평균 소셜 미디어 사용 시간 (단위: 시간)",
         fontsize=SUBTITLE_SIZE, color='#666666', ha='left')

years_full = np.arange(2012, 2025)

region_data = {
    '글로벌 평균': {
        'keys': [2012, 2014, 2016, 2018, 2020, 2021, 2022, 2023, 2024],
        'vals': [1.5, 1.65, 1.85, 2.1, 2.45, 2.43, 2.45, 2.40, 2.35],
        'color': '#1A3A5C', 'lw': 2.8
    },
    '북미': {
        'keys': [2012, 2014, 2016, 2018, 2020, 2021, 2022, 2023, 2024],
        'vals': [1.5, 1.6, 1.72, 1.88, 2.05, 2.12, 2.18, 2.25, 2.3],
        'color': '#5B8DB8', 'lw': 2.0
    },
    '유럽': {
        'keys': [2012, 2014, 2016, 2018, 2020, 2021, 2022, 2023, 2024],
        'vals': [1.4, 1.5, 1.6, 1.75, 1.92, 1.98, 2.05, 2.02, 2.0],
        'color': '#5B8DB8', 'lw': 2.0
    },
    '아시아 태평양': {
        'keys': [2012, 2014, 2016, 2018, 2020, 2021, 2022, 2023, 2024],
        'vals': [1.4, 1.55, 1.75, 2.0, 2.25, 2.35, 2.28, 2.22, 2.2],
        'color': '#5B8DB8', 'lw': 2.0
    },
}

for idx, (label, d) in enumerate(region_data.items()):
    ax = axes[idx]
    ax.set_facecolor('none')
    y_interp = interp_smooth(d['keys'], d['vals'], years_full)
    y_noisy = add_noise(y_interp, scale=0.015)
    y_noisy[0] = d['vals'][0]
    y_noisy[-1] = d['vals'][-1]

    ax.plot(years_full, y_noisy, color=d['color'], linewidth=d['lw'], solid_capstyle='round')
    ax.plot(years_full[-1], y_noisy[-1], 'o', color=d['color'], markersize=6, zorder=5)

    ax.set_ylim(0.8, 2.7)
    ax.set_xlim(2012, 2024)
    ax.set_yticks([1.0, 1.5, 2.0, 2.5])
    ax.set_xticks([2014, 2019, 2024])
    ax.set_xticklabels(['2014', '2019', '2024'], fontsize=TICK_SIZE, color='#888888')
    ax.tick_params(axis='y', labelsize=TICK_SIZE, colors='#888888', length=0)
    ax.grid(axis='y', color='#DDDDDD', linewidth=0.5, linestyle='-')
    ax.grid(axis='x', visible=False)
    style_spine(ax)
    ax.tick_params(axis='x', length=0)
    ax.set_title(label, fontsize=PANEL_TITLE_SIZE, fontweight='bold', color='#333333', pad=10)
    if idx > 0:
        ax.tick_params(axis='y', labelleft=False)

fig.text(MARGIN_LEFT, 0.03, SOURCE_TEXT, fontsize=SOURCE_SIZE, color='#999999', ha='left')
fig.text(MARGIN_LEFT, 0.005, CREDIT_TEXT, fontsize=SOURCE_SIZE, color='#999999', ha='left')

plt.savefig(OUT_DIR + "chart_region.png", dpi=DPI, facecolor='none', bbox_inches='tight', transparent=True)
plt.close()
print("chart_region.png saved.")

print("\nAll 3 charts generated successfully!")

# ============================================================
# Thumbnail: thumbnail.png (1200x630)
# ============================================================
fig, ax = plt.subplots(figsize=(12, 6.3), facecolor='#1B2A4A')
ax.set_facecolor('#1B2A4A')

years_full = np.arange(2012, 2025)
np.random.seed(42)

bg_data = [
    ([2012,2014,2016,2018,2020,2021,2022,2023,2024], [2.1,2.3,2.5,2.75,3.0,2.95,2.92,2.85,2.8], '#5B8DB8', 1.5, 0.15),
    ([2012,2014,2016,2018,2020,2021,2022,2023,2024], [1.7,1.85,2.05,2.35,2.55,2.62,2.7,2.65,2.6], '#7FAACC', 1.2, 0.15),
    ([2012,2014,2016,2018,2020,2021,2022,2023,2024], [1.5,1.65,1.85,2.1,2.45,2.43,2.45,2.40,2.35], '#FFFFFF', 2.5, 0.25),
    ([2012,2014,2016,2018,2020,2021,2022,2023,2024], [1.0,1.1,1.25,1.45,1.65,1.75,1.85,1.92,2.0], '#5B8DB8', 1.2, 0.15),
    ([2012,2014,2016,2018,2020,2021,2022,2023,2024], [0.8,0.88,0.98,1.1,1.25,1.35,1.42,1.52,1.6], '#7FAACC', 1.0, 0.15),
]

for keys, vals, color, lw, alpha in bg_data:
    y_interp = interp_smooth(keys, vals, years_full)
    y_noisy = add_noise(y_interp, scale=0.015)
    y_noisy[0] = vals[0]
    y_noisy[-1] = vals[-1]
    ax.plot(years_full, y_noisy, color=color, linewidth=lw, alpha=alpha, solid_capstyle='round')

ax.set_xlim(2012, 2024)
ax.set_ylim(0.5, 3.2)
style_spine(ax)
ax.set_xticks([])
ax.set_yticks([])

fig.text(0.08, 0.88, '기술', fontsize=13, fontweight='bold', color='white',
         bbox=dict(boxstyle='round,pad=0.3', facecolor='#145C35', edgecolor='none'))
fig.text(0.08, 0.55, "소셜 미디어 사용 시간,\n2022년에 정점을 찍다",
         fontsize=36, fontweight='bold', color='white', ha='left', va='center', linespacing=1.3)
fig.text(0.08, 0.22, "젊은 세대가 먼저 줄이고 있다. 55세 이상은 아직 증가 중.",
         fontsize=16, color='#AABBCC', ha='left')
fig.text(0.08, 0.08, "Financial Times · John Burn-Murdoch · GWI",
         fontsize=12, color='#667788', ha='left')
fig.text(0.92, 0.08, "AI ROASTING",
         fontsize=12, fontweight='bold', color='#667788', ha='right')

plt.savefig(OUT_DIR + "thumbnail.png", dpi=100, facecolor='#1B2A4A', bbox_inches='tight')
plt.close()
print("thumbnail.png saved.")
