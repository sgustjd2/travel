# Travel app visual contract

이 문서는 여행 데이터가 달라져도 앱의 화면 구조와 시각 언어가 달라지지 않게 하는 공통 디자인 계약입니다. 현재 `src/travel-ui/components.tsx`, `src/travel-ui/types.ts`, `src/travel-ui/category.ts`, `src/travel-ui/index.ts`, `src/Prototype.tsx`, `src/prototype.css`와 README의 실제 화면 스냅샷을 기준으로 합니다. `src/travel-ui/`는 공통 UI·카테고리 구현, `Prototype.tsx`는 상태·데이터·화면 조합, `prototype.css`는 공통 스타일의 source of truth입니다. UI만 수정하거나 공통 컴포넌트를 추가할 때는 [travel-ui 스킬](../../travel-ui/SKILL.md)을 진입점으로 사용합니다.

## 목표 화면

여행 앱은 모바일에서 바로 쓰는 일정·지도 화면이어야 합니다. 현재 교토·고베 앱의 구조를 템플릿으로 재사용하고, 새 여행은 `trip.json`의 내용만 바뀌는 것을 기본값으로 합니다.

- 앱 콘텐츠는 `#f6f8fb` 계열의 차분한 배경 위에 흰색 카드로 쌓습니다.
- 상단은 뒤로가기·여행 제목·날짜·메뉴가 있는 sticky 헤더입니다.
- 일정 화면에서 전체 폭을 차지하는 `DAY 1`~`DAY 4` 탭은 두지 않습니다. 날짜 이동은 `.trip-header .header-copy .header-meta` 안에서 여행 기간 텍스트 옆에 현재 `DAY N · 날짜`와 이전/다음 버튼을 compact하게 표시하고, 헤더 버튼으로 날짜를 이동합니다. 기간 텍스트는 남는 폭을 사용하고 길면 말줄임 처리하며, 날짜 컨트롤은 줄어들지 않는 고정 폭으로 유지합니다.
- 일정 화면은 날짜 소개, 동일 높이의 실제 방문·장소 추가·대체 후보 컨트롤, 지도, 오늘의 동선 섹션, 장소 카드 순서입니다.
- 지도는 `ROUTE PREVIEW` 카드 안에서 헤더 아래에 sticky로 유지하고, 장소 목록은 그 아래에서 스크롤합니다. 지도는 장소 순서와 마커만 보여주는 route preview이며 DAY 이동 버튼을 지도 위에 겹쳐 그리지 않습니다. 일정 지도는 모바일에서 Triple과 비슷한 compact 높이를 사용하며, 일정 스크롤이 시작되면 지도 이미지가 작은 고정 바로 접혀 카드 내용을 가리지 않게 합니다. 축소할 때는 확장 지도 슬롯의 높이를 유지해 스크롤 문서가 재배치되거나 튕기지 않게 합니다. sticky `top` 값은 고정 숫자를 따로 추정하지 말고 실제 헤더 box 높이와 일치시켜 헤더·지도·콘텐츠가 겹치지 않게 합니다.
- 현재 위치는 권한이 이미 허용된 경우 일정·전체 지도 진입 시 자동으로 조회하고, 첫 권한 요청은 `내 위치` 버튼에서 시작합니다. 조회 중·권한 거부·위치 확인 실패·시간 초과는 지도 위에 `role="status"` 안내를 표시하며, 성공하면 현재 위치 마커와 지도 중심 이동을 함께 제공합니다.
- 지도 마커를 누르면 상세 시트를 열지 않고 해당 장소 카드로 이동·강조합니다. 장소 카드 본문을 눌렀을 때만 `BottomSheet` 상세 화면을 엽니다.
- 장소 카드는 둥근 흰색 surface, 얇은 경계선, 왼쪽 category accent, category 색상의 순번 원, 카테고리 아이콘, 오른쪽 대표 이미지·즐겨찾기·방문 체크로 구성합니다.
- 상세 정보는 새 페이지나 일반 desktop modal이 아니라 휴대폰 화면 안의 스크롤 가능한 `BottomSheet`입니다.
- 하단에는 일정·지도·예약·저장 4개 항목의 고정 bottom navigation을 둡니다.
- 헤더 빠른 메뉴에는 `준비·꿀팁`을 두고 `TravelGuideSheet`에서 `must`·`warning`·`tip` 그룹을 구분합니다. 체크 가능한 준비 항목은 완료 상태를 표시하고, 긴 목록은 시트 내부에서 끝까지 스크롤됩니다.
- 긴 일정 목록을 읽을 때 하단 내비게이션을 침범하지 않는 floating `맨 위로 이동` 버튼을 제공하고, 스크롤이 충분히 내려간 뒤에만 표시합니다.

실제 캡처는 다음 파일을 시각 검수 기준으로 사용합니다.

- `public/assets/readme/itinerary-day2.png`: 일정·지도·카드의 전체 계층
- `public/assets/readme/place-detail.png`: 장소 상세 BottomSheet
- `public/assets/readme/saved-records.png`: 저장·현지 메모 화면

## 여행별 파일 경계

화면 계약과 여행 자료를 섞지 않습니다. 새 목적지는 아래 두 정본만 추가하고, 기존 공통 화면·런타임·CSS를 복사하지 않습니다.

- `travel/<destination-slug>/trip.json`: 날짜, 장소, 좌표, 운영정보, 메뉴, 이미지 출처, 휴무일, 불확실성 등 여행 데이터
- `page/<destination-slug>/index.html`: 공통 `src/main.tsx`를 로드하는 배포 진입점
- 루트 `index.html`: 여행 목록 허브 카드만 관리
- `dist/client/<destination-slug>/index.html`: 빌드가 `page/` 엔트리에서 생성하는 공개 URL 산출물이며 직접 편집하지 않음

공개 URL은 `/<destination-slug>/`를 유지하고, 저장소 루트에 목적지별 폴더나 목적지 전용 dashboard/CSS를 만들지 않습니다. 이 파일 경계는 디자인 계약과 함께 README, AGENTS.md, `travel-map-builder` 스킬에서 동일하게 유지해야 합니다.

## 컴포넌트 계층과 API

새 여행은 아래 공통 트리를 그대로 사용하고 `trip.json` 데이터만 바꿉니다.

```text
Prototype
├─ MobileScroll
│  └─ trip-scroll-content
│     ├─ TravelHeader
│     │  └─ .header-copy > .header-meta > 기간 + header-day-nav
│     └─ 화면별 콘텐츠
│        ├─ TripMap
│        ├─ TravelCategoryLegend
│        └─ TravelPlaceCard
├─ ScrollToTopButton
├─ TravelBottomNav
├─ PlaceDetailSheet / PlaceEditorSheet
├─ TravelGuideSheet
└─ TravelDataTransferSheet
```

| 컴포넌트 | 핵심 입력 | 화면 책임 |
| --- | --- | --- |
| `TravelHeader` | `title`, `dateLabel`, `days`, `activeDay`, `view`, 메뉴·날짜 콜백 | sticky 헤더, 제목/기간, compact DAY 이동, 빠른 메뉴 |
| `TravelBottomNav` | `view`, `onViewChange` | 일정·지도·예약·저장 고정 메뉴 |
| `TravelCategoryLegend` | `categories: CategoryConfig[]` | 공통 카테고리 색상·라벨 범례 |
| `TravelPlaceCard` | `place`, `category`, 상태, `preview`, 액션 콜백 | 장소 카드의 번호·아이콘·정보·이미지·체크·즐겨찾기 |
| `TravelGuideSheet` | `items`, `completedIds`, 열기/닫기·토글 콜백 | 필수 준비·주의할 점·여행 꿀팁을 색상 그룹으로 보여주는 체크리스트 시트 |
| `TravelDataTransferSheet` | transfer 상태와 복사/공유/파일 콜백 | JSON 기록 내보내기·가져오기 BottomSheet |

`PlacePreview`처럼 여행 데이터에 따라 이미지를 선택하는 얇은 어댑터는 허용하지만 카드 전체 UI를 다시 만들 수 없습니다. 공통 UI를 수정할 때는 `components.tsx` 또는 `index.ts`와 [component-contract.md](component-contract.md)를 함께 갱신하고 기존 교토·고베 화면에서 실제 사용 여부를 확인합니다.

## 공통 토큰

기존 CSS 변수와 카테고리 매핑을 우선 사용합니다. 새 여행마다 색상 팔레트나 폰트를 새로 만들지 않습니다.

| 용도 | 값 |
| --- | --- |
| 배경 | `#f6f8fb` |
| 카드 | `#ffffff` |
| 본문 잉크 | `#172033` |
| 보조 텍스트 | `#728096` |
| 경계선 | `#e6ebf2` ~ `#dfe6f0` |
| 주요 액션 | `#1457d9` |
| 숙소 | `#139d8c` |
| 사진 명소 | `#7357db` |
| 맛집 | `#ef5a6f` |
| 카페 | `#c1831f` |
| 역 | `#1457d9` |
| 공항 | `#2d76c7` |
| 짐 보관·이동 | `#62718a` |

폰트는 `"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`를 공통으로 사용합니다. 아이콘은 기존 `lucide-react` 아이콘과 현재 카테고리 아이콘을 재사용합니다.

## 컴포넌트 구현 규칙

1. 여행을 추가할 때는 `src/travel-ui/index.ts`의 공통 컴포넌트·타입·카테고리를 `src/Prototype.tsx`에서 조합하고, `travel/<destination-slug>/trip.json`, `page/<destination-slug>/index.html`과 루트 허브 카드만 추가합니다. Pages 빌드는 공개 주소를 기존 `/<destination-slug>/`로 유지합니다. 구현은 `components.tsx`, `types.ts`, `category.ts`에 분리하되 새 화면의 import는 단일 진입점을 우선합니다.
2. 기존 템플릿이 있는 저장소에서 여행별 `index.html`, `App.tsx`, 독립 CSS, 새 라우터를 만들어 화면을 다시 그리지 않습니다. 여행 폴더는 데이터와 진입점만 소유합니다.
3. 앱 전용 고정 영역은 `MobileScroll` 안에 중복해서 만들지 않습니다. `TravelHeader`·`TravelBottomNav`·상세 시트는 현재 런타임 계약을 따르고, 스크롤 콘텐츠는 `MobileScroll` 안에 둡니다.
4. 헤더의 `.header-copy`는 `min-width: 0`인 단일 콘텐츠 열이어야 합니다. `.header-meta`는 기간 텍스트와 날짜 컨트롤을 한 줄 flex로 배치하고, 기간 텍스트에는 `overflow: hidden`·`text-overflow: ellipsis`·`white-space: nowrap`, 날짜 컨트롤에는 `flex: 0 0 auto`를 적용해 제목·기간·메뉴와 겹치지 않게 합니다. 360px 내외에서는 gap과 버튼 폭만 줄이고 글자를 임의로 두 줄로 만들지 않습니다.
5. 장소 카드의 제목·메타·휴무일·메모는 `TravelPlaceCard`가 예약한 오른쪽 썸네일과 체크/하트 컨트롤을 침범하지 않아야 합니다. grid의 `minmax(0, 1fr)`, ellipsis, line clamp를 사용하고 모바일에서 가로 overflow를 허용하지 않습니다.
6. 지도·카드·상세 화면 모두 같은 장소 ID와 카테고리를 사용합니다. 지도 마커 숫자와 카드 순번은 같은 category color를 사용하며, 같은 좌표의 순번은 offset으로 분리합니다.
7. 메뉴는 일본어 원문과 한국어 번역을 한 항목 안에서 세로로 보여줍니다. 번역만 있는 메뉴나 일본어만 있는 메뉴를 기본 출력으로 만들지 않습니다.
8. 이미지 로드 실패는 깨진 이미지 아이콘으로 끝내지 않습니다. 안정적인 로컬/원격 이미지를 사용하고 `onError`로 지도·카테고리 fallback을 표시합니다.
9. 여행 기록 공유는 앱의 고정 데이터와 분리된 BottomSheet 흐름으로 제공합니다. 빠른 메뉴에서 JSON 내보내기·가져오기를 열고, 내보내기에는 현재 수정·삭제·추가가 반영된 일정 스냅샷과 로컬 기록을 함께 담습니다. 내보내기 화면은 복사·기기 공유·파일 저장, 가져오기 화면은 붙여넣기·파일 선택·업데이트를 제공합니다. 긴 JSON도 sheet 내부에서 끝까지 스크롤되며 버튼과 입력 영역은 360px 폭에서 잘리지 않습니다.

## 금지되는 디자인 드리프트

아래와 같은 결과는 여행 데이터가 정상이어도 디자인 작업이 실패한 것으로 봅니다.

- 첨부 참고 이미지처럼 별도의 초록색 desktop dashboard, 상단 통계 3칸, 넓은 데스크톱 탭 UI를 새로 만드는 것
- 현재 앱 대신 여행 폴더마다 서로 다른 header, navigation, card radius, typography, color theme을 만드는 것
- 지도·일정·상세를 한꺼번에 새 페이지로 갈아끼우거나, 카드 클릭과 마커 클릭을 같은 동작으로 합치는 것
- 모바일에서 제목·시간·휴무일·가격·썸네일이 겹치거나, 화면 오른쪽/하단이 잘리는 것
- 장소 종류를 색상 하나로만 구분하고 아이콘·한글 라벨·범례를 생략하는 것
- 확인하지 못한 장소 정보나 이미지를 그럴듯하게 채워 넣어 확정처럼 보이게 하는 것

## 반응형 품질 게이트

새 여행 생성 후 다음을 실제 렌더링으로 확인합니다.

- 360px 내외의 Android/iPhone 폭에서 가로 스크롤이 없고, 제목·컨트롤·카드가 한 줄 규칙을 지킵니다.
- 393~430px 모바일 화면에서 헤더의 제목·기간·DAY 이동·메뉴, compact sticky 지도·첫 카드·하단 내비가 서로 가리지 않습니다. DAY 이동은 `.header-copy` 안에서 기간 텍스트 옆에 있고 지도 이미지·마커 위에는 별도 버튼이 없습니다. 일정 스크롤 중에는 지도 이미지가 축소 바가 되어 장소 카드 위에 겹치지 않아야 하며, 지도 축소 순간에도 확장 슬롯을 유지해 스크롤 위치가 튀지 않아야 합니다.
- 맨 위로 이동 버튼은 하단 내비게이션 위에 고정되고, 280px 이하의 초기 스크롤에서는 보이지 않으며, 활성화 후 누르면 `MobileScroll`의 최상단으로 돌아갑니다.
- 넓은 시뮬레이터에서도 앱 콘텐츠는 휴대폰 화면 안에서만 확장되고, 임의의 desktop dashboard로 변하지 않습니다.
- 지도 마커 선택 시 상세 시트가 닫힌 상태로 카드가 지도 아래에 노출되고, 카드 선택 시 상세 시트 안에서 메뉴·이미지·대체 식당·메모를 끝까지 스크롤할 수 있습니다.
- 준비·꿀팁 시트가 360px 폭에서도 좌우 overflow 없이 열리고, 체크/해제 상태가 새로고침과 JSON 기록 복원 후 유지되는지 확인합니다.
- 빠른 메뉴의 여행 데이터 내보내기에서 JSON을 카카오톡/클립보드/파일로 보관하고, 여행 데이터 가져오기에서 같은 여행의 JSON을 붙여넣거나 파일로 선택해 방문 기록·메모·수정을 복원할 수 있습니다. 다른 `destination-slug`의 데이터는 적용하지 않습니다.
- 첫 번째와 마지막 장소, 숙소 시작·종료 반복, 이미지가 없는 장소, 긴 한국어 장소명, 두 줄 메뉴명을 확인합니다.

검수 중 디자인이 달라졌다면 데이터를 바꾸기 전에 공통 UI를 기존 템플릿으로 되돌리고, 새 여행의 차이는 `trip.json`으로만 표현합니다.
