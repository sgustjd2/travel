# Travel Map Builder

여행 계획 몇 줄을 넣으면 조사자료를 보완하고, 현재 교토·고베 앱과 같은 디자인의 모바일 여행 일정 지도를 만드는 재사용 가능한 템플릿입니다.

[![Live on GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-2ea44f?logo=github)](https://sgustjd2.github.io/travel/)
[![Mobile first](https://img.shields.io/badge/UI-mobile--first-2563eb)](#디자인-계약)
[![GitHub Actions](https://img.shields.io/badge/Deploy-GitHub%20Actions-6f42c1?logo=githubactions)](./.github/workflows/deploy-pages.yml)

> 핵심 흐름: **간단한 여행 정보 → 조사자료 → 공통 UI 여행 앱 → 현지 기록 저장·공유**

## 🔗 실제 배포 사이트

아래 링크를 누르면 현재 GitHub Pages 앱으로 이동합니다.

| 구분 | 바로 열기 | 내용 |
| --- | --- | --- |
| 여행 허브 | [sgustjd2.github.io/travel](https://sgustjd2.github.io/travel/) | 여행지별 앱 목록 |
| 교토·고베 | [교토·고베 여행 앱](https://sgustjd2.github.io/travel/kyoto-kobe-trip/?day=19) | 19일~22일 일정 |
| 제주 스포츠 투어 | [제주 여행 앱](https://sgustjd2.github.io/travel/jeju-sports-trip/) | 10월 1일~4일 일정 |

> 이 링크는 현재 저장소의 공개 주소입니다. clone/fork한 저장소는 본인 GitHub Pages 주소가 생성됩니다.

## 빠른 시작

### 로컬에서 실행

```bash
npm ci
npm run dev
```

브라우저에서 `http://localhost:5173/`을 엽니다. 포트가 다르면 터미널에 표시된 주소를 사용하세요.

### 내 GitHub에 배포

1. 이 저장소를 **Fork**하거나 **Use this template**으로 복사합니다.
2. 복사한 저장소의 `Settings → Pages → Source`를 `GitHub Actions`로 설정합니다.
3. 여행 데이터를 수정하고 `main`에 push합니다.
4. Actions의 `Deploy to GitHub Pages`가 끝나면 다음 주소에서 엽니다.

```text
https://<github-id>.github.io/<repository-name>/
https://<github-id>.github.io/<repository-name>/<destination-slug>/
```

사용자 페이지 저장소(`<github-id>.github.io`)는 `<repository-name>` 부분이 없습니다. GitHub 계정명과 저장소명을 코드에 직접 입력할 필요가 없으며, `GITHUB_REPOSITORY`로 Pages base path를 자동 계산합니다.

## 이 앱으로 할 수 있는 일

| 기능 | 설명 |
| --- | --- |
| 여행 생성 | 여행지·기간·숙소·희망 장소만 입력해도 부족한 주소, 지도 링크, 좌표, 운영 정보를 조사합니다. |
| 장소 정보 | 영업시간, 라스트오더, 휴무일, 가격, 입장료, 예약, 출처, 대표 이미지를 표시합니다. 모르는 값은 `확인 필요`로 남깁니다. |
| 메뉴판 | 일본어 원문 아래에 한국어 번역과 가격을 병기하고 메뉴별 음식 이미지를 연결합니다. |
| 지도 | 한글 우선 지도, 카테고리 색상 마커, Google Maps 장소 보기·길찾기를 제공합니다. |
| 대체 후보 | 예약 실패나 대기 상황에 대비한 근처 대체 식당을 기본 동선과 분리해 보여줍니다. |
| 준비·꿀팁 | 예약·입장·교통·휴무·계절·결제·짐·접근성 정보를 필수 준비/주의/꿀팁으로 묶어 체크합니다. |
| 여행 중 기록 | 방문 완료, 즐겨찾기, 현지 메모, 예약 체크를 저장합니다. |
| 장소 편집 | 등록되지 않은 장소를 추가하고, 기존 장소를 수정하거나 삭제(이 기기에서 숨김)할 수 있습니다. |
| 결과 공유 | 수정·삭제·추가·체크·메모가 포함된 JSON을 카카오톡 공유, 클립보드 복사, 파일 저장으로 보관합니다. |

## 여행 중 장소 추가·편집·공유

### 장소를 추가하거나 수정하기

1. 원하는 DAY에서 `장소 추가`를 누릅니다.
2. 장소명·카테고리·방문 시간·주소를 입력합니다.
3. Google Maps 링크가 없으면 장소명과 주소로 검색·길찾기 링크가 자동 생성됩니다.
4. 좌표가 없으면 목록에는 표시하되 지도 핀은 생략하고 `지도 위치 확인 필요`로 표시합니다.
5. 장소 카드를 누른 뒤 상세 시트의 `수정` 또는 `삭제`를 사용합니다.

원본 `trip.json`은 바뀌지 않습니다. 추가 장소, 수정 내용, 숨긴 장소는 해당 여행의 이 기기에만 저장되므로 실제 여행 결과를 정리할 때 안전합니다. `실제 방문 기록` 필터를 켜면 체크한 장소만 남겨 볼 수 있습니다.

### 친구에게 최종 일정 공유하기

1. 상단 `☰ 빠른 메뉴 → 데이터 내보내기`를 엽니다.
2. `카톡·앱으로 공유`, `텍스트 복사`, 또는 `파일로 저장`을 선택합니다.
3. 친구가 같은 여행 앱에서 `☰ → 데이터 가져오기`를 엽니다.
4. JSON을 붙여넣거나 `.json` 파일을 선택하고 `이 데이터로 업데이트`를 누릅니다.

내보내기 데이터에는 현재 일정 스냅샷과 방문 체크·즐겨찾기·메모·예약 체크·준비·꿀팁 체크·장소 수정·삭제·추가·선택 DAY가 함께 들어갑니다. 다른 `destination-slug`의 데이터는 잘못 적용되지 않도록 거부합니다.

> GitHub Pages는 정적 사이트이므로 LocalStorage 기록이 URL만으로 자동 동기화되지는 않습니다. **앱 링크는 원본 일정 공유용**, **JSON 내보내기는 실제 여행 결과 공유·복원용**입니다.

## 새 여행 자동 생성

가장 간단한 방법은 아래 프롬프트에 여행 정보만 채워 `$travel-map-builder` 스킬을 호출하는 것입니다.

<details>
<summary>복붙용 앱 생성 프롬프트 열기</summary>

```text
이 저장소의 $travel-map-builder 스킬을 사용해 새 여행 앱을 만들어줘.

여행지: [도시 또는 국가]
기간: [YYYY-MM-DD ~ YYYY-MM-DD 또는 3박 4일]
숙소: [이름·주소·Google Maps 링크. 모르면 예정/미정]
가고 싶은 곳: [장소·맛집·카페·활동]
여행 스타일/예산: [예: 맛집 중심, 하루 3~4곳, 1인 하루 10,000엔]
참고 자료: [링크·문서·이미지·메모]
원하는 작업: [앱 생성만 / GitHub Pages 배포까지]

현재 저장소의 공통 travel-map-builder 디자인과 교토·고베 실제 화면을 그대로 유지해줘.
기존 여행은 수정하지 말고 travel/<destination-slug>/trip.json,
page/<destination-slug>/index.html과 루트 허브 카드를 새로 만들어줘.
주소·Google Maps 링크·좌표·영업시간·휴무일·가격·메뉴·대표 이미지는 조사해서 채우고,
확인할 수 없는 내용은 추측하지 말고 확인 필요로 표시해줘.
일본어 메뉴는 원문 아래에 한국어 번역과 가격을 표시하고,
식당별 휴무일·대체 식당·출처 링크도 포함해줘.
예약·입장·교통·휴무·계절·결제·짐·접근성처럼 미리 준비할 내용은 최상위 `guideItems`에
`must`/`warning`/`tip`, `title`, `body`, 필요한 `dayNumber`, `sourceUrls`, `checkable`로 정리해
상단 빠른 메뉴의 `준비·꿀팁`에서 확인할 수 있게 해줘.
장소 추가·수정·삭제·방문 체크·메모·JSON 내보내기/가져오기를 유지해줘.
배포는 내가 배포까지라고 요청한 경우에만 진행해줘.
```

전체 작업 지침은 [`prompts/travel-app-build.md`](./prompts/travel-app-build.md)에 있습니다.

</details>

## 여행계획 조사 프롬프트

여행 정보가 메모 수준이면 먼저 아래 프롬프트로 `travel-research.v1` 조사자료를 만듭니다. 이 단계는 코드를 수정하지 않고, 다음 앱 생성 단계가 읽을 수 있는 JSON을 만듭니다.

<details>
<summary>복붙용 여행계획 조사 프롬프트 열기</summary>

```text
여행 계획을 완성하고 장소 정보를 조사해줘. 코드를 만들지 말고
사람이 읽을 수 있는 일정 요약과 travel-research.v1 JSON을 만들어줘.

여행지/국가: [예: 일본 후쿠오카·유후인]
기간: [YYYY-MM-DD ~ YYYY-MM-DD 또는 3박 4일]
여행 인원: [성인 2명]
숙소: [이름·주소·Google Maps 링크]
고정 일정/교통: [항공편·열차·예약·체크인/체크아웃]
가고 싶은 곳·먹고 싶은 것: [장소·맛집·카페·활동]
여행 스타일/예산: [예: 맛집 중심, 1인 하루 10,000엔]
특별 조건: [걷기·유모차·채식·알레르기 등]
참고 링크·문서·이미지·메모: [붙여넣기]

사용자가 준 날짜·순서·예약·장소는 보존해줘.
공식 홈페이지·공식 SNS·예약 페이지·정확한 Google Maps 결과를 우선 조사해줘.
주소·좌표·영업시간·라스트오더·휴무일·가격·입장료·예약·메뉴·대표 이미지와
각 출처를 기록해줘. Google Maps 링크가 없으면 정확한 검색 링크를 만들고,
정확한 핀을 확인하지 못한 좌표는 null로 둬.
일본어 메뉴는 nameJa, 한국어 번역은 nameKo, 가격은 원문 그대로 보존해줘.
식당·카페의 closedDays는 별도 필드로 넣고, 모르면 확인 필요로 표시해줘.
대체 식당은 기본 일정과 분리하고 alternativeFor, nearbyWalk를 기록해줘.
확인할 수 없는 정보는 절대 추측하지 말고 needsConfirmation에 이유를 적어줘.
예약·입장·교통·휴무·계절·결제·짐·접근성에서 준비할 내용은 아래처럼 `guideItems`로도 출력해줘.
`must`는 필수 준비, `warning`은 주의, `tip`은 참고 꿀팁이며 확인 불가 내용은 본문에 `확인 필요`와 이유를 써줘.
```

전체 JSON 필드와 Claude·Gemini·GPT/Codex별 조사 방식은 [`prompts/travel-plan-research.md`](./prompts/travel-plan-research.md)를 참고하세요.

</details>

## UI만 수정할 때

데이터나 여행 폴더는 건드리지 않고 헤더·지도·카드·상세 시트·반응형만 고칠 때는 `$travel-ui`를 사용합니다.

<details>
<summary>복붙용 UI 수정 프롬프트 열기</summary>

```text
이 저장소의 $travel-ui 스킬을 사용해 UI만 수정해줘.

문제/요구사항: [예: Pixel 10에서 헤더가 잘리고 썸네일이 본문을 가림]
기준 화면: 현재 교토·고베 앱의 모바일 디자인
범위: [헤더 / 지도 / 장소 카드 / 상세 시트 / 하단 메뉴 / 반응형]

design-system.md와 component-contract.md를 먼저 읽고,
TravelHeader, TravelBottomNav, TravelCategoryLegend, TravelPlaceCard,
TravelGuideSheet, TravelDataTransferSheet와 src/prototype.css를 재사용해줘.
Prototype.tsx는 상태·데이터 조합만 담당하게 하고 공통 UI는 src/travel-ui에서 수정해줘.
360/393/430px 및 넓은 기기 화면의 overflow를 검수하고 검수 명령을 실행해줘.
```

자세한 규칙은 [`.agents/skills/travel-ui/SKILL.md`](./.agents/skills/travel-ui/SKILL.md)에 있습니다.

</details>

## 준비사항·꿀팁만 보완할 때

조사자료에서 예약, 입장료, 교통, 휴무일, 계절, 결제, 짐, 접근성처럼 여행 전에 확인할 내용을 추출할 때는 `$travel-prep-guide`를 사용합니다. 이 스킬은 목적지별 UI를 만들지 않고 공통 `guideItems` 데이터와 `TravelGuideSheet`를 사용합니다.

```text
이 저장소의 `$travel-prep-guide` 스킬을 사용해줘.

여행 계획/조사자료: [링크·파일·간단한 메모]
반드시 확인할 조건: [예약·입장·교통·휴무·날씨·결제·짐·접근성 등]
원하는 작업: [조사 JSON만 / 기존 destination의 trip.json에 반영]

공식 출처를 우선 조사하고, 확인할 수 없는 내용은 추측하지 말고 `확인 필요`와 이유를 표시해줘.
최상위 `guideItems`에 `must`/`warning`/`tip`, 안정적인 id, 행동 중심 title/body,
필요한 dayNumber/sourceUrls/checkable을 넣어줘. 기존 장소·기록·completedGuideIds는 보존해줘.
```

자세한 규칙은 [`.agents/skills/travel-prep-guide/SKILL.md`](./.agents/skills/travel-prep-guide/SKILL.md)에 있습니다.

## 저장소 구조

```text
travel/                         # 여행별 정본 데이터
  kyoto-kobe-trip/trip.json
  jeju-sports-trip/trip.json
  <destination-slug>/trip.json
page/                           # 배포 페이지 엔트리
  kyoto-kobe-trip/index.html
  jeju-sports-trip/index.html
  <destination-slug>/index.html
src/travel-ui/                  # 모든 여행이 공유하는 UI·타입·카테고리
  components.tsx
  types.ts
  category.ts
  index.ts
src/Prototype.tsx               # 상태·지도·데이터 조합
src/prototype.css               # 공통 디자인·반응형 스타일
prompts/                        # 조사·앱 생성 원샷 프롬프트
.agents/skills/                 # Codex canonical skills
.claude/skills/, .gemini/skills/ # provider pointer skills
```

새 여행은 반드시 `travel/<destination-slug>/trip.json`과 `page/<destination-slug>/index.html`로 추가합니다. 저장소 루트에 여행별 폴더나 독립 dashboard/CSS를 만들지 않습니다. Pages 빌드가 배포 시 `/<destination-slug>/` 경로로 출력합니다.

## 스킬·에이전트 안내

| 환경 | 먼저 읽는 파일 | 역할 |
| --- | --- | --- |
| Codex 전체 작업 | [`AGENTS.md`](./AGENTS.md) → [canonical skill](./.agents/skills/travel-map-builder/SKILL.md) | 조사·여행 생성·데이터·검수·선택적 배포 |
| Codex UI-only | [`AGENTS.md`](./AGENTS.md) → [travel-ui](./.agents/skills/travel-ui/SKILL.md) | 공통 UI·반응형·시각 회귀 |
| Codex 준비·꿀팁 | [`AGENTS.md`](./AGENTS.md) → [travel-prep-guide](./.agents/skills/travel-prep-guide/SKILL.md) | 검증된 필수 준비·주의·꿀팁과 체크리스트 |
| Claude Code | [`CLAUDE.md`](./CLAUDE.md) → [Claude pointer](./.claude/skills/travel-map-builder/SKILL.md) | canonical travel-map-builder 연결 |
| Gemini CLI | [`GEMINI.md`](./GEMINI.md) → [Gemini pointer](./.gemini/skills/travel-map-builder/SKILL.md) | canonical travel-map-builder 연결 |

공통 계약 문서는 다음 순서로 사용합니다.

1. [`design-system.md`](./.agents/skills/travel-map-builder/references/design-system.md) — 현재 화면의 시각 규칙
2. [`component-contract.md`](./.agents/skills/travel-map-builder/references/component-contract.md) — 공통 컴포넌트 API와 경계
3. [`trip-data-contract.md`](./.agents/skills/travel-map-builder/references/trip-data-contract.md) — `trip.json` 필드
4. [`research-packet.md`](./.agents/skills/travel-map-builder/references/research-packet.md) — 조사 결과 JSON

## 디자인 계약

현재 교토·고베 화면이 모든 여행의 기준입니다. 여행별 차이는 데이터로만 표현하고, UI는 공통 컴포넌트를 조합합니다.

### 공통 컴포넌트

| 컴포넌트 | 책임 |
| --- | --- |
| `TravelHeader` | 제목·기간·헤더 안 `DAY · 날짜` 이동·빠른 메뉴 |
| `TravelBottomNav` | 일정·지도·예약·저장 고정 하단 메뉴 |
| `TravelCategoryLegend` | 장소 종류별 색상·아이콘 범례 |
| `TravelPlaceCard` | 번호·카테고리·운영정보·썸네일·체크·즐겨찾기 |
| `TravelGuideSheet` | 필수 준비·주의할 점·여행 꿀팁 체크리스트 |
| `TravelDataTransferSheet` | JSON 내보내기·가져오기·공유 |

### 화면 규칙

- Pretendard-first 폰트, 옅은 배경, 흰색 bordered card, 명확한 section 경계선을 사용합니다.
- `DAY · 날짜`는 헤더의 `.header-copy .header-meta` 안에 둡니다. 지도 위에 날짜 탭을 겹치지 않습니다.
- 지도는 compact sticky route preview이며, 스크롤 중에는 요약 바로 접혀 장소 카드를 가리지 않습니다.
- 지도 마커 클릭은 카드 포커스만 하고, 카드 본문 클릭만 상세 `BottomSheet`를 엽니다.
- 상세 시트는 내부 스크롤이 가능해야 하며 메뉴·사진·대체 식당·메모의 마지막까지 도달해야 합니다.
- 빠른 메뉴의 `준비·꿀팁`은 `TravelGuideSheet`에서 필수 준비/주의/꿀팁을 색상별로 보여주며, checkable 항목은 완료 상태를 저장합니다.
- 360/393/430px과 넓은 기기 화면에서 제목·버튼·썸네일·메뉴가 겹치거나 잘리지 않아야 합니다.

### 카테고리 색상

`🟢 숙소` · `🟣 사진 명소` · `🔴 맛집` · `🟠 카페` · `🔵 역` · `🔷 공항` · `⚫ 짐 보관·이동`

카드 왼쪽 accent, 번호, 지도 마커, 범례는 같은 카테고리 색상을 사용합니다. 원격 이미지가 실패하면 지도 미리보기나 카테고리 이미지로 대체하고 깨진 이미지 아이콘을 표시하지 않습니다.

## 실제 화면 미리보기

현재 앱의 실제 캡처는 `public/assets/readme/`에 있습니다.

<table>
  <tr>
    <td><img src="./public/assets/readme/hub.png" alt="여행 허브" width="220" /></td>
    <td><img src="./public/assets/readme/itinerary-day2.png" alt="지도와 일정 카드" width="220" /></td>
    <td><img src="./public/assets/readme/place-detail.png" alt="장소 상세" width="220" /></td>
    <td><img src="./public/assets/readme/saved-records.png" alt="저장한 장소와 메모" width="220" /></td>
  </tr>
  <tr>
    <td align="center">여행 허브</td>
    <td align="center">지도·동선·카드</td>
    <td align="center">운영 정보·메뉴</td>
    <td align="center">기록·즐겨찾기</td>
  </tr>
</table>

스크린샷을 다시 만들려면 로컬 서버를 실행한 뒤 다음 명령을 사용합니다.

```powershell
$env:README_CAPTURE_URL = "http://localhost:5173/kyoto-kobe-trip/"
node scripts/capture-readme-screenshots.mjs
```

## 검수 명령

```bash
npm run validate:trip
npm run check:runtime
npm run build
npm run test:sites
git diff --check
```

여행 생성·UI 변경 후에는 모든 DAY, 숙소 상세, 식당 메뉴, 대체 식당, 휴무일, 이미지 폴백, 마커/카드 클릭, 상세 시트 첫·끝 스크롤, 장소 추가·수정·삭제, 실제 방문만 보기, JSON 내보내기·가져오기를 확인합니다.

## 불확실한 정보 처리

공식 페이지·공식 SNS·예약 페이지·정확한 Google Maps 결과를 우선합니다. 나무위키·블로그·검색 결과 썸네일은 보조 자료로만 사용합니다. 주소·좌표·영업시간·휴무일·가격·메뉴·이미지를 확인하지 못하면 추측하지 않고 화면에 `확인 필요`와 출처 또는 사유를 남깁니다.

<details>
<summary>상세 문서와 프롬프트 전체 목록</summary>

- 앱 생성 원샷: [`prompts/travel-app-build.md`](./prompts/travel-app-build.md)
- 여행계획 조사: [`prompts/travel-plan-research.md`](./prompts/travel-plan-research.md)
- 준비·꿀팁 보완 스킬: [`.agents/skills/travel-prep-guide/SKILL.md`](./.agents/skills/travel-prep-guide/SKILL.md)
- Codex 전체 스킬: [`.agents/skills/travel-map-builder/SKILL.md`](./.agents/skills/travel-map-builder/SKILL.md)
- Codex UI 스킬: [`.agents/skills/travel-ui/SKILL.md`](./.agents/skills/travel-ui/SKILL.md)
- 시각 계약: [`.agents/skills/travel-map-builder/references/design-system.md`](./.agents/skills/travel-map-builder/references/design-system.md)
- 컴포넌트 계약: [`.agents/skills/travel-map-builder/references/component-contract.md`](./.agents/skills/travel-map-builder/references/component-contract.md)
- 데이터 계약: [`.agents/skills/travel-map-builder/references/trip-data-contract.md`](./.agents/skills/travel-map-builder/references/trip-data-contract.md)
- 조사자료 계약: [`.agents/skills/travel-map-builder/references/research-packet.md`](./.agents/skills/travel-map-builder/references/research-packet.md)

</details>
