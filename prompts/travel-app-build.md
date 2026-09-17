# 여행 앱 생성·배포 원샷 프롬프트

`travel-plan-research.md`의 결과 JSON 또는 간단한 여행 정보만 주면 새 여행 폴더 생성, 조사 보완, 공통 UI 적용, 검수, 선택적 GitHub Pages 배포까지 한 번에 처리하도록 만든 프롬프트입니다.

```text
이 저장소의 `$travel-map-builder` 스킬을 사용해 새 여행 앱을 끝까지 만들어줘.

입력 자료:
- 여행 계획 또는 `travel-research.v1` 파일/JSON: [파일 경로 또는 JSON 전체]
- 원하는 작업: [앱 생성만 / GitHub Pages 배포까지]
- 추가 요청: [선호 장소, 제외 장소, 예산, 일정 변경 등]

작업 순서:
1. 먼저 `AGENTS.md`, `README.md`, `.agents/skills/travel-map-builder/SKILL.md`,
   `.agents/skills/travel-map-builder/references/trip-data-contract.md`,
   `.agents/skills/travel-map-builder/references/design-system.md`,
   `.agents/skills/travel-map-builder/references/component-contract.md`를 읽어줘.
2. `travel-research.v1` 자료가 있으면 날짜·도시·장소 순서·사용자 지정 링크·출처·확인 필요 상태를 우선 보존해. 자료가 없거나 부족하면 여행지·기간·숙소·희망 장소만으로 조사하고, 확인할 수 없는 정보는 추측하지 말고 `확인 필요`로 남겨.
3. 기존 여행은 수정하지 말고 `travel/<destination-slug>/trip.json`과 `page/<destination-slug>/index.html`을 새로 만들어. 저장소 루트에는 새 여행 폴더를 만들지 말고, 루트 허브 `index.html`에도 새 여행 카드를 추가해. Pages 빌드가 기존 `/<destination-slug>/` 공개 경로를 유지한다.
4. 주소·정확한 Google Maps 링크·좌표·영업시간·라스트오더·휴무일·가격·입장료·예약·대표 이미지·출처를 보완해. Google Maps 링크가 없으면 정확한 검색 링크를 만들고 정확한 핀을 검증하지 못한 좌표는 null로 둬. 식당·카페는 휴무일을 별도 표시하고 모르면 `확인 필요`로 표시해.
5. 일본어 메뉴는 일본어 원문 아래에 한국어 번역과 가격을 넣고, 가능한 메뉴별 음식 사진과 출처를 연결해. 사용자가 제공한 숙소/장소 이미지는 `public/assets/`에 반영하고, 원격 이미지가 실패해도 지도·카테고리 폴백이 보이게 해. 나무위키·블로그는 설명 보완용으로만 사용하고 운영 정보는 공식 자료와 교차 확인해.
6. 대체 식당은 `optional: true`, `alternativeFor`, `nearbyWalk`로 기본 동선과 분리해.
7. 예약·입장·교통·휴무·날씨/계절·결제·짐·접근성에서 여행 전에 확인할 내용을 최상위 `guideItems`로 만들어. 각 항목에 `id`, `kind`(`must`/`warning`/`tip`), 행동 중심 `title`, 사실과 확인 행동을 담은 `body`, 필요한 `dayNumber`, `sourceUrls`, `checkable`을 넣고 빠른 메뉴의 `준비·꿀팁`에서 보이게 해.

공통 UI·디자인 규칙:
- 현재 교토·고베 실제 화면을 모든 여행의 시각 기준으로 사용해. 별도 dashboard, 통계 카드, 독립 header/navigation/CSS를 만들지 마.
- `src/travel-ui/index.ts`에서 `TravelHeader`, `TravelBottomNav`,
  `TravelCategoryLegend`, `TravelPlaceCard`, `TravelGuideSheet`, `TravelDataTransferSheet`를 가져와 사용하고,
  공통 구현은 `src/travel-ui/components.tsx`, 타입은 `types.ts`, 카테고리는 `category.ts`,
  공통 스타일은 `src/prototype.css`에 둬.
- `Prototype.tsx`는 상태·데이터 조합·지도 동작만 담당하게 하고, 여행 폴더에 카드/헤더/하단 메뉴/시트 JSX나 독립 CSS를 복사하지 마.
- Pretendard-first 폰트, 명확한 섹션 경계선, 카테고리별 색상·아이콘·번호를 유지해.
- DAY/date 이동은 `.header-copy .header-meta` 안에 두고 지도 위에는 날짜 버튼을 만들지 마. 지도는 compact sticky route preview로 유지하고 스크롤 중에는 레이아웃 슬롯을 보존한 채 요약 바로 접어 카드가 가려지거나 스크롤이 튀지 않게 해.
- 지도 마커 클릭은 해당 카드 포커스만, 카드 본문 클릭은 상세 `BottomSheet` 열기로 유지해. 상세 시트는 내부 스크롤이 끝까지 되어야 해.
- 카드 오른쪽 썸네일·하트·체크 공간을 예약하고, 제목·휴무일·메뉴가 이미지나 컨트롤 아래로 밀리지 않게 해.
- 실제 방문 체크·즐겨찾기·메모·예약 체크·장소 수정/삭제/추가·실제 방문만 보기와 LocalStorage 저장을 유지해.
- 빠른 메뉴에서 현재 여행 기록을 JSON으로 내보내기(공유·클립보드·파일)와 가져오기(붙여넣기·파일)를 유지하고, 다른 slug의 데이터는 거부해.
- `guideItems`의 checkable 항목 완료 상태도 `completedGuideIds`로 LocalStorage와 JSON 내보내기/가져오기에 포함해.

검수:
- `npm run validate:trip`
- `npm run check:runtime`
- `npm run build`
- `npm run test:sites`
- `git diff --check`
- 360px, 393px, 430px 실제 모바일 폭과 넓은 기기 미리보기에서 제목·기간·DAY·버튼·카드·썸네일·메뉴·하단 내비게이션의 겹침/잘림/가로 overflow를 확인해.
- 모든 날짜, 숙소 상세, 일본어+한국어 메뉴, 음식 사진, 대체 식당, 휴무일, 이미지 폴백, 마커/카드 클릭, 상세 시트 첫/끝 스크롤, 실제 기록 편집, JSON 내보내기/가져오기를 확인해.
- UI 계약이 바뀌면 `design-system.md`, `component-contract.md`, `README.md`도 함께 업데이트해.

완료 보고:
- 생성/수정한 `travel/<destination-slug>/trip.json` 및 `page/<destination-slug>/index.html`과 장소 수
- 확인 필요 항목과 출처 누락 항목
- 실행한 검수 결과
- 배포를 요청한 경우에만 실제 GitHub Pages URL과 Actions 결과
```

사용 예:

```text
이 저장소의 `$travel-map-builder` 스킬을 사용해줘.
먼저 `fukuoka-research.json`의 `travel-research.v1` 조사자료를 읽고 새 후쿠오카 여행 앱으로 변환해줘.
기존 `kyoto-kobe-trip/`은 건드리지 마.
원하는 작업: GitHub Pages 배포까지
```

간단한 입력만 있는 경우에도 같은 프롬프트의 `입력 자료`에 여행지·기간·숙소·희망 장소를 적으면 부족한 정보를 조사해 채웁니다.
