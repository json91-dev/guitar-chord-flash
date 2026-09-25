# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Guitar Chord Flash (기타 코드 플래시카드 앱)
**Generated:** 2026-09-25
**Category:** Music Instrument Learning / Practice Utility (not a marketing site — a repeat-use drill + reference tool)
**Design Dials:** Variance 3/10 (Centered / Minimal) | Motion 3/10 (Subtle) | Density 5/10 (Standard)

> **Note on how this was derived:** The raw DB match for "Music Instrument Learning" defaults to a
> landing-page template (Hero > Features > CTA, GSAP scroll-reveal, Righteous/Poppins, red-as-primary).
> That fits a marketing site, not this product. This file keeps the DB's color/type *ingredients*
> but re-composes them for the product's actual job: a glanceable practice drill (코드 연습) and a
> dense reference table (코드표), both used *while playing guitar*, often propped on a stand a few
> feet away, sometimes in low light. Every override below is flagged with **[조정]**.

---

## Why this product needs its own system (not the generic template)

| Product reality | Design consequence |
|---|---|
| 화면을 몇 초씩만 힐끗 본다 (glanced at while playing, not read) | 코드 이름은 오버사이즈 + 초고대비, 나머지 UI는 조용해야 함 |
| 반복 사용 (연습을 매일, 수십 분씩) | "에너지 넘치는" 톤보다 "피로 없는" 톤이 맞음 — 과도한 채도/애니메이션은 장기 사용 시 피로 유발 |
| 연습 공간 조명이 일정하지 않음 (밝은 낮 / 어두운 방) | 라이트+다크 모드 둘 다 1급 시민이어야 함 |
| 코드표는 정보 밀도가 높은 테이블 | 연습 화면(널널함)과 코드표(조밀함) 사이의 density 전환이 필요 |
| 코드 기호 자체가 컨텐츠 (`C#m7`, `Ebadd9`, `Gb/F#`) | 숫자·기호 구분이 뚜렷한 글리프가 핵심 요구사항 — 장식적 폰트는 오히려 오독 유발 |

---

## Global Rules

### Color Palette — **[조정]** primary/destructive 충돌 해소 + 대비 재조정

DB가 준 "Musical red + warm amber" 자체는 이 제품과 결이 맞지만(따뜻함, 악기 느낌), Primary와
Destructive가 동일한 `#DC2626`인 건 실제 구현에서 문제가 됩니다 — 나중에 "틀린 코드" 같은
피드백을 넣으면 브랜드 색과 에러 색이 같아져 구분이 안 됩니다. 그래서 **Amber를 Primary로 승격**하고
Red는 Destructive 전용으로만 고정했습니다.

**[조정 2] 실제 적용 시 대비 검증 후 `#D97706` → `#B45309`로 한 단계 더 다크닝**했습니다.
`#D97706` + 흰 텍스트(버튼) = 3.19:1, `#D97706` 텍스트 온 크림 배경(작은 글자) = 3.07:1로
WCAG AA 4.5:1을 통과하지 못했습니다(버튼 배경/작은 텍스트 기준). `#B45309`는 흰 텍스트 5.02:1,
크림 배경 텍스트 4.84:1로 모든 용례에서 AA를 통과해 이 값으로 통일했습니다. 히어로 코드 이름처럼
아주 큰 텍스트(24px+)는 `#D97706`도 3:1 대체 기준을 만족하지만, 토큰을 두 개로 나누면 나중에
잘못된 자리에 밝은 값을 쓰기 쉬워서 안전한 값 하나로 단순화했습니다.

**Light Mode**

| Role | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Primary | `#B45309` | `--color-primary` | CTA, 시작 버튼, 활성 탭, 포커스 링, 코드 이름 — 흰 텍스트 5.02:1 / 크림 배경 4.84:1 (AA 통과) |
| On Primary | `#FFFFFF` | `--color-on-primary` | |
| Secondary | `#9A3412` | `--color-secondary` | 보조 텍스트 강조, pressed 상태 — 흰 배경 7.30:1 |
| Background | `#FFFBEB` | `--color-background` | 따뜻한 크림 — 흰 형광 배경보다 눈 피로 적음 |
| Foreground | `#0F172A` | `--color-foreground` | 본문/코드 이름 |
| Muted | `#FDF0DC` | `--color-muted` | 카드 배경, 비활성 영역 |
| Border | `#F5E1BE` | `--color-border` | |
| Destructive | `#DC2626` | `--color-destructive` | **오직** 에러/정지/틀림 피드백 전용 |
| Ring | `#B45309` | `--color-ring` | 포커스 링 (Primary와 통일) |

**[조정 3]** 기존 앱의 보조 텍스트 회색(`#8a8375`, `#a39d90` 등)도 크림/흰 배경 대비 2.6~3.6:1로
AA(4.5:1) 미달이었습니다 — 이건 이번 작업 이전부터 있던 문제입니다. `--color-text-soft`를
`#6B6558`(대비 5.58~5.79:1) 하나로 통일해 전부 통과하도록 정리했습니다.

**Dark Mode — [조정] 추가 (DB 출력엔 없었음)**

가이드라인상 다크모드는 색을 반전하지 않고 톤을 낮춰야 합니다 (`color-dark-mode` 규칙).

| Role | Hex | Notes |
|------|-----|-------|
| Background | `#1C1712` | 순검정 아님 — 따뜻한 다크 |
| Card | `#262019` | |
| Foreground | `#F5EFE4` | |
| Primary | `#F0A93B` | Amber를 밝게/탈채도해 다크 배경 대비 확보 |
| Secondary | `#C77B4A` | |
| Muted | `#2E271E` | |
| Border | `#3A2F22` | |
| Destructive | `#EF4444` | 표준 다크모드용 밝은 레드 |

### Typography — **[조정]** Righteous/Poppins → Space Grotesk + Asta Sans

Righteous는 이벤트/엔터테인먼트용 라운드 디스플레이 폰트라 `C#m7`, `Ebadd9` 같은 기호를
정확히 구분해서 읽기엔 약합니다. 연습 중 곁눈질로 봐야 하는 앱에는 **글리프 대비가 뚜렷한
지오메트릭 산세리프**가 낫습니다. 또한 이 앱은 한글 UI(로우코드/하이코드, 메트로놈 등)를 쓰므로
한글 서브셋이 있는 폰트가 필수입니다 (DB의 Poppins/Righteous 둘 다 한글 미지원).

- **Display / 코드 기호 전용 (Latin only):** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) — weight 700–900. 코드 이름(`C`, `Bbm7`, `F#dim`), 코드표 헤더/루트 라벨에만 사용.
- **UI / 한글 본문:** [Asta Sans](https://fonts.google.com/specimen/Asta+Sans) — weight 400–700, Korean+Latin variable, 42dot 제작. 버튼, 라벨, 안내 문구, "메이저/마이너 7th" 같은 보조 텍스트.
- **대체안:** 팀에서 Pretendard를 이미 쓰고 있다면(국내 프로덕트 표준) Asta Sans 대신 Pretendard로 교체해도 무방 — 다만 Pretendard는 Google Fonts DB에는 없어 CDN(jsdelivr) import 필요.

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Asta+Sans:wght@400;500;600;700&display=swap');
```

```css
--font-display: 'Space Grotesk', sans-serif;  /* 코드 이름, 숫자, 코드표 헤더 */
--font-ui: 'Asta Sans', system-ui, sans-serif; /* 한글 UI, 라벨 */
```

**Scale (연습 화면 기준):**

| Token | Size | Font | Usage |
|---|---|---|---|
| `--text-chord-hero` | `clamp(3.5rem, 14vw, 6rem)` | display 700 | 연습 카드 현재 코드 이름 |
| `--text-chord-side` | `clamp(1.75rem, 5vw, 2.75rem)` | display 500 | prev/next 카드 |
| `--text-chart-root` | `22px` | display 700 | 코드표 루트 라벨 (Db/C# 등, 이미 통일 완료) |
| `--text-label` | `13–16px` | ui 400–500 | 버튼, 배지, 안내 문구 |

### Spacing Variables

*Density: 5/10 — Standard, 단 화면별로 다르게 적용*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | 배지 내부 |
| `--space-sm` | `8px` | 아이콘 간격 |
| `--space-md` | `16px` | 표준 패딩 |
| `--space-lg` | `24px` | 카드 패딩 |
| `--space-xl` | `32px` | 섹션 간격 |
| `--space-2xl` | `48px` | 연습 화면 상하 여백 (널널하게) |

> **[조정]** 코드표(코드 연습 대비 밀도 높은 표)는 이 값보다 촘촘한 `--space-xs/sm` 위주로
> 이미 구현돼 있음 (셀 패딩 10px 등) — 그대로 유지, Master 기본값은 연습 화면 기준.

---

## Component Specs

### Buttons

```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-family: var(--font-ui);
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 100px; /* 기존 pill 형태 유지 */
  min-height: 44px;      /* 터치 타겟 최소 44px */
  transition: opacity 150ms ease, transform 150ms ease;
  cursor: pointer;
}
.btn-primary:active { transform: scale(0.97); }

.btn-secondary {
  background: transparent;
  color: var(--color-secondary);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  min-height: 44px;
}
```

### Cards (플래시카드)

```css
.chord-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(43,39,33,0.06);
  /* hover/scale 효과 없음 — 카드가 클릭 대상이 아니라 "표시" 대상이므로 */
}
```

### Focus / Inputs

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ring) 40%, transparent);
}
input[type="range"]::-webkit-slider-thumb {
  background: var(--color-primary);
}
```

---

## Style Guidelines

**Style:** Exaggerated Minimalism (완화 버전) — **[조정]** 원본 스타일 키워드 중 "massive whitespace / hero 12rem"은 마케팅 사이트 기준이라 실제 앱 규모에 맞게 축소함.

**Keywords:** 오버사이즈 타이포(코드 이름만), 고대비, 여백, 장식 없음, statement는 코드 이름 하나에만 집중

**적용 원칙:**
- 화면당 "주인공"은 하나만 크게 — 연습 화면은 현재 코드 이름, 코드표는 표 자체.
- 장식적 그림자/그라데이션 없음. 기존 앱의 flat pill 버튼, flat card 스타일 유지.
- Primary 색은 인터랙션(버튼, 활성 탭, 포커스)에만 쓰고 장식엔 안 씀.

### Screen Structure — **[조정]** "Hero>Features>CTA" 랜딩페이지 패턴 대신 실제 화면 구조로 대체

이 제품엔 랜딩페이지가 없습니다. 2개의 기능 화면만 있습니다:

1. **코드 연습 (Practice)** — 단일 포커스 카드 + 최소 컨트롤. 목표: 0.5초 안에 코드 이름을 읽을 수 있을 것.
2. **코드표 (Reference)** — 밀도 높은 그리드 테이블. 목표: 원하는 코드를 스캔으로 3초 안에 찾을 것.

두 화면은 같은 컬러/폰트 토큰을 공유하되, density만 다르게 (연습=spacious, 코드표=compact).

---

## Motion — **[조정]** GSAP ScrollTrigger(스크롤 랜딩페이지용) 대신 실제 인터랙션에 맞는 모션으로 대체

이 앱엔 스크롤 히어로가 없으므로 `scroll-reveal` 프리셋은 해당 없음. Motion 3/10(Subtle) 원칙은
"카드 전환·타이머"라는 기존 기능성 모션에 적용:

| Interaction | Duration | Easing | Note |
|---|---|---|---|
| 카드 슬라이드 (다음/이전 코드) | 350ms | `cubic-bezier(0.4,0,0.2,1)` | 기존 구현과 동일 — 유지 권장 |
| 타이머 바 카운트다운 | BPM 간격 전체 | `linear` | 장식이 아니라 정보(남은 시간)이므로 linear 유지 |
| 버튼 press 피드백 | 150ms | `ease` | scale 0.97 + opacity, 레이아웃 이동 없이 |
| 시작 전 placeholder → 카드 전환 | 200ms | `ease-out` | fade만, slide 금지 (첫 진입에 과한 모션 금지) |

- ✅ `prefers-reduced-motion`에서는 카드 슬라이드를 fade로 대체
- ❌ 코드 자체나 숫자에 bounce/elastic 애니메이션 금지 — 오독 유발

---

## Icons — **[조정]** 이모지 → SVG 아이콘 세트로 통일 **[적용 완료]**

~~Phosphor Icons 라이브러리~~ 대신 **인라인 stroke SVG**로 구현했습니다 — 기존 코드베이스가
이전/다음 화살표를 이미 인라인 SVG로 그리고 있어서, 새 npm 의존성(`@phosphor-icons/react`)을
추가하는 대신 같은 방식(stroke, `currentColor`, 20px 내외)으로 통일하는 게 번들 크기와 코드
일관성 면에서 더 나은 선택이라 판단했습니다.

| Control | 변경 전 | 변경 후 |
|---|---|---|
| 시작 | 텍스트 `▶` | Play 삼각형 인라인 SVG + "시작" 라벨 |
| 일시정지 | 텍스트 `⏸` | Pause 막대 2개 인라인 SVG + "일시정지" 라벨 |
| 메트로놈 | 텍스트 `♩` | 메트로놈 추 모양 인라인 SVG + "메트로놈" 라벨 |
| 이전/다음 | 이미 SVG | `aria-hidden="true"` 추가만 |
| 시작 전 placeholder | 이모지 `🎸` | 시계 모양 인라인 SVG (기타를 어설프게 그리는 것보다, "연습 타이머"라는 의미가 통하는 깔끔한 placeholder를 택함 — craft.md의 "실물을 어설프게 그리느니 placeholder가 낫다" 원칙) |

---

## Anti-Patterns (Do NOT Use) — **[조정]** 마케팅 사이트 기준에서 실사용 유틸리티 기준으로 재작성

- ❌ **Loud/energetic 배경, 그라데이션, confetti류 장식** — 매일 반복 사용하는 도구에는 피로 유발
- ❌ **Primary 색과 Destructive 색 재사용** (원본 DB 팔레트의 문제였음 — 이미 위에서 분리함)
- ❌ 이모지를 실제 컨트롤 아이콘으로 사용 (안내용 placeholder는 예외적으로 허용 가능하나 SVG 권장)
- ❌ 코드 이름 폰트에 장식적 곡선/필기체 — 오독 위험
- ❌ 카드/버튼에 layout-shifting hover (스케일로 레이아웃 밀림)
- ❌ 다크모드를 라이트모드 색 반전으로 처리 (톤 낮춘 별도 팔레트 사용)
- ❌ 코드표 셀 정보를 색상만으로 구분 (텍스트/기호 병행 필수)

---

## Pre-Delivery Checklist

- [ ] 코드 이름이 3~5피트 거리에서 즉시 읽히는지 (실제 폰으로 스탠드 거치 후 확인 — 코드만 육안 확인 못함, 사용자 확인 필요)
- [x] 라이트/다크 모드 둘 다 대비 4.5:1 이상 — `#D97706`→`#B45309`로 조정 후 통과 (계산 근거는 Color Palette 섹션)
- [x] 모든 컨트롤 44×44px 이상 터치 타겟 — 대부분 44px 적용, BPM 프리셋(40px)·메트로놈(40px)·필터 체크박스(36px)는 좁은 줄 밀도 때문에 의도적으로 낮춤 (아래 "적용 시 발견된 항목" 참고)
- [x] 이모지 아이콘 → SVG로 교체 완료
- [x] Primary(#B45309)와 Destructive(#DC2626) 색이 같은 화면에서 혼동 없이 구분되는지 — 실제 UI엔 Destructive 쓰이는 곳이 아직 없어 충돌 여지 자체가 없음
- [x] `prefers-reduced-motion`에서 카드 전환이 fade로 대체되는지 — 정확히는 "fade"가 아니라 "즉시 전환(transition 제거)"으로 구현. 슬라이드 로직이 JS setTimeout 기반이라 fade 크로스페이드까지 만들려면 JS 리팩터가 필요해 범위를 CSS 전용으로 제한함
- [x] 코드표는 조밀하게, 연습 화면은 널널하게 — density 대비가 유지되는지
- [x] 키보드 포커스 링이 모든 인터랙티브 요소에 보이는지 — 신규 `:focus-visible` 규칙 + `input[type=range]`의 기존 `outline:none` 제거 (아래 참고)

### 적용 중 발견된 UX 안티패턴 (우선순위순)

1. **[Critical] 포커스 링 제거 후 대체 없음** — `input[type="range"] { outline: none; }`만 있고 대체 포커스 스타일이 없었음(`ux-guidelines.csv` Focus States, Severity: High 위반). → 전역 `:focus-visible` 링 추가로 해결.
2. **[Critical] 본문 텍스트 대비 미달** — `#8a8375`(2.6~3.6:1), `#a39d90`(2.6:1)가 크림/흰 배경에서 WCAG AA 4.5:1 미달. 이 디자인 시스템 작업 이전부터 있던 문제. → `--color-text-soft: #6B6558`(5.58~5.79:1) 하나로 통일.
3. **[High] DB가 제안한 Primary(#D97706)도 대비 미달** — 흰 텍스트 버튼 3.19:1, 작은 텍스트 3.07:1로 AA 미달. → `#B45309`로 다크닝, 전 용례 4.84:1 이상 확보.
4. **[High] 이모지/텍스트 글리프를 컨트롤 아이콘으로 사용** — `▶`/`⏸`/`♩`/`🎸`. → SVG로 교체(위 Icons 섹션).
5. **[Medium] 터치 타겟 44px 미달** — 페이지 탭/모드 탭/BPM 프리셋/메트로놈 버튼이 실측 22~38px였음. → 대부분 44px로, 조밀한 줄(BPM 프리셋 6개, 필터 체크박스 3개)은 40px/36px로 절충(레이아웃 붕괴 방지 목적, 아래 트레이드오프 참고).
6. **[Low] `prefers-reduced-motion` 미지원** — 카드 슬라이드·호버 트랜지션에 대응 미디어쿼리 없음. → 추가. 단 타이머 바 카운트다운은 장식이 아니라 "남은 시간" 정보라 reduced-motion에서도 유지(Motion 섹션 원칙과 일치).
7. **[Low, 미해결] 다크모드 전환 UI 없음** — `prefers-color-scheme` 자동 감지만 구현, 앱 내 수동 토글은 없음. 연습실 조명이 바뀌어도 OS 설정을 바꿔야 앱이 따라감. 필요하면 별도로 토글 버튼 추가 가능.

**트레이드오프로 남긴 것:** BPM 프리셋 6개를 한 줄에 배치해야 해서 40px로 절충(44px면 한 줄에 다 안 들어가거나 지나치게 커짐). 필터 체크박스도 같은 이유로 36px. 둘 다 WCAG 2.2 AA의 실제 법적 최소 기준(24×24px)은 넉넉히 넘기지만, 이 스킬의 권장 기준(44px)에는 못 미침 — 필요하면 세로 2줄 레이아웃으로 바꿔 완전히 44px를 맞출 수 있음.
