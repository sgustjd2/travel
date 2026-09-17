# 공통 여행 UI 컴포넌트 계약

이 저장소의 모든 여행지는 교토·고베 화면과 같은 UI를 사용합니다. UI-only 작업은 [travel-ui 스킬](../../travel-ui/SKILL.md)을 먼저 읽고, 구현 기준은 다음 파일입니다.

- `src/travel-ui/components.tsx`: 재사용 가능한 화면 컴포넌트
- `src/travel-ui/types.ts`: 여행 데이터·로컬 기록 타입
- `src/travel-ui/category.ts`: 카테고리 색상·한글 라벨·아이콘 공통 매핑
- `src/travel-ui/index.ts`: 새 화면에서 사용하는 공통 UI 진입점(barrel export)
- `src/prototype.css`: 공통 토큰과 반응형 레이아웃

`src/Prototype.tsx`는 여행 데이터 로딩, 지도 효과, 로컬 상태, 화면 조합만 담당합니다. `travel/<destination-slug>/` 폴더는 `trip.json`, `page/<destination-slug>/` 폴더는 `index.html`을 소유합니다. GitHub Pages 빌드는 이 정본을 기존 `/<destination-slug>/` 공개 경로로 출력합니다.

## 표준 컴포넌트

| 컴포넌트 | 책임 | 반드시 지킬 동작 |
| --- | --- | --- |
| `TravelHeader` | 여행 제목·기간·현재 DAY 이동·빠른 메뉴 | DAY/date는 `.header-copy .header-meta` 안에 두고 지도 위에는 두지 않음 |
| `TravelBottomNav` | 일정·지도·예약·저장 하단 메뉴 | `MobileScroll` 바깥의 고정 sibling으로 렌더링 |
| `TravelCategoryLegend` | 숙소·사진·맛집·카페·역·공항·짐 색상 범례 | `CATEGORY_CONFIGS`의 공통 색상·라벨을 사용 |
| `TravelPlaceCard` | 번호·카테고리·운영정보·썸네일·체크·즐겨찾기 카드 | 오른쪽 컨트롤/이미지 공간을 예약하고 가로 overflow 금지 |
| `TravelGuideSheet` | 필수 준비·주의할 점·여행 꿀팁 체크리스트 | `Trip.guideItems`를 그룹 색상으로 표시하고 checkable 항목의 완료 상태를 로컬 저장 |
| `TravelDataTransferSheet` | 여행 기록 JSON 내보내기·가져오기 | `BottomSheet` 내부에서 긴 JSON과 액션을 끝까지 스크롤 |

공통 구조는 다음과 같습니다.

```text
Prototype
├─ MobileScroll
│  └─ trip-scroll-content
│     ├─ TravelHeader
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

## 사용 방법

새 화면이나 여행을 만들 때는 공통 컴포넌트를 가져와 데이터만 주입합니다.

```tsx
import {
  TravelBottomNav,
  TravelCategoryLegend,
  TravelDataTransferSheet,
  TravelHeader,
  TravelPlaceCard,
  TravelGuideSheet,
} from "./travel-ui";
import type { Place, Trip, View } from "./travel-ui";
```

장소별 이미지를 만들기 위해 `PlacePreview` 같은 얇은 데이터 어댑터를 둘 수는 있지만, 카드의 전체 JSX·헤더·하단 메뉴·데이터 시트를 목적지 폴더에 복사하면 안 됩니다. 새 공통 UI가 필요하면 `components.tsx`, `index.ts`, 이 계약을 함께 수정한 뒤 기존 교토·고베 화면에서도 실제로 사용합니다.

## 데이터와 스타일 경계

- 여행명·날짜·장소·메뉴·이미지 출처·좌표·휴무일은 각 `travel/<destination-slug>/trip.json`에 둡니다.
- 필수 준비·주의·꿀팁은 `Trip.guideItems`에 두고, 사용자가 체크한 ID는 destination별 LocalStorage와 내보내기 JSON의 `completedGuideIds`에 둡니다.
- 색상·카테고리 아이콘·라벨은 `src/travel-ui/category.ts`, 카드 구조·헤더 간격·지도 축소 동작·시트 스크롤은 공통 컴포넌트/CSS에 둡니다.
- 여행별 `App.tsx`, dashboard, 독립 CSS, 별도 헤더/탭/하단 내비게이션은 만들지 않습니다.
- `MobileScroll`, `BottomSheet`, `KeyboardInput`, `KeyboardTextarea`의 런타임 계약을 우회하지 않습니다.
- 모든 장소 카드와 지도 마커는 같은 `Place.id`·`category`를 사용합니다. 마커 클릭은 카드 포커스, 카드 본문 클릭은 상세 시트 열기입니다.
- 지도는 공통 현재 위치 동작을 유지합니다. 권한이 허용된 경우 자동 조회하고, 최초 권한 요청은 `내 위치` 액션에서 시작하며, 조회 중·실패 상태를 알리고 성공 시 현재 위치로 지도를 이동합니다.
- 빠른 메뉴의 `준비·꿀팁`은 `TravelGuideSheet`를 열고 `must`·`warning`·`tip` 그룹을 표시합니다. 시트 내부가 스크롤되어야 하며 지도나 장소 카드 위에 안내 내용을 겹쳐 표시하지 않습니다.

## 완료 기준

새 여행도 360/393/430px와 넓은 기기 미리보기에서 같은 컴포넌트 트리, 같은 Pretendard-first 타이포그래피, 같은 카테고리 색상, 같은 헤더·지도·카드·하단 메뉴 밀도를 보여야 합니다. 헤더·썸네일·체크·메뉴·휴무일이 겹치거나 잘리지 않고, 지도 축소 시 카드가 가려지거나 스크롤 위치가 튀지 않아야 합니다.
- 빠른 메뉴에서 준비·꿀팁 시트를 열고 항목을 체크/해제할 수 있으며, 새로고침·JSON 내보내기/가져오기 후에도 체크 상태가 보존되어야 합니다.
