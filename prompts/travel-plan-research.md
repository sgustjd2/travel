# 여행 계획·조사자료 만들기 프롬프트

여행 정보가 아직 메모 수준일 때 사용합니다. 이 프롬프트는 코드를 만들지 않고, 다른 AI나 이 저장소의 `travel-map-builder`가 바로 사용할 수 있는 `travel-research.v1` JSON을 만듭니다.

도구별로 복사할 수 있는 Claude Code·Gemini CLI·GPT/Codex용 웹 조사 프롬프트는 [README의 여행계획 조사 프롬프트](../README.md#claudegeminigpt-여행계획-조사-프롬프트)에 있습니다. 어느 도구를 사용하든 원문 페이지를 직접 열고 같은 JSON 계약과 불확실성 규칙을 지켜야 합니다.

```text
여행 계획을 완성하고 장소 정보를 조사해줘. 코드를 만들거나 HTML을 작성하지 말고, 아래 입력을 바탕으로 사람이 읽을 수 있는 일정 요약과 자동 변환 가능한 `travel-research.v1` JSON을 만들어줘.

입력:
- 여행지/국가: [예: 일본 후쿠오카·유후인]
- 기간: [YYYY-MM-DD ~ YYYY-MM-DD 또는 3박 4일]
- 여행 인원: [예: 성인 2명]
- 숙소: [이름·주소·Google Maps 링크. 모르면 예정/미정]
- 고정 일정/교통: [항공편·열차·예약·체크인/체크아웃]
- 가고 싶은 곳·먹고 싶은 것: [장소·맛집·카페·활동]
- 여행 스타일/예산: [예: 맛집 중심, 하루 3~4곳, 1인 하루 10,000엔]
- 특별 조건: [걷기·유모차·채식·알레르기·금연석 등]
- 참고 링크·문서·이미지·메모: [붙여넣기]

조사와 계획 규칙:
1. 사용자가 준 장소·날짜·예약·순서를 먼저 보존하고, 고정 일정은 임의로 바꾸지 마.
2. 빈 정보는 지역·여행 스타일·이동 동선을 고려해 보완하되, 사용자가 원하지 않은 장소를 기본 일정에 마음대로 추가하지 마. 새 추천은 `alternatives`에만 넣어.
3. 장소명과 도시를 대조해 정확한 공식 장소를 확인해. Google Maps 링크가 없으면 정확한 장소의 Google Maps 링크를 만들고, 정확한 핀을 확인하지 못하면 coordinates를 null로 둬. 좌표를 추측하지 마.
4. 장소별 주소, 영업시간, 라스트오더, 휴무일, 가격, 입장료, 예약 상태, 예약 링크, 공식 정보 출처를 조사해. 식당·카페는 `closedDays`를 반드시 별도 필드로 넣어.
5. 일본어 메뉴는 `nameJa`와 `nameKo`를 함께 조사하고 가격 표기를 보존해. 가능하면 메뉴별 음식 사진, 이미지 페이지 URL, 직접 이미지 URL, 사용 권한/출처를 기록해.
6. 대표 이미지는 사용자가 준 이미지, 공식 페이지의 안정적인 `og:image` 또는 직접 이미지, 사용 허용 범위가 명확한 Wikimedia 순서로 선택해. Google 검색 썸네일, blob/data URL, 만료 URL, 권한이 불명확한 hotlink는 제외해.
7. 공식 홈페이지·공식 SNS·공식 예약 페이지·정확한 Google Maps 결과를 우선하고, 관광청·예약 서비스·신뢰할 수 있는 현지 자료를 보조로 사용해. 나무위키·블로그는 설명 보완용으로만 쓰고 시간·가격·휴무일·예약은 교차 확인해.
8. 출처가 없거나 서로 충돌하거나 최신 여부를 확인하지 못한 값은 확정하지 말고 `확인 필요`와 사유를 적어. `confidence`는 `high`, `medium`, `low` 중 하나로 기록해.
9. 기준 장소에서 도보 10분 안팎의 대체 식당을 조사할 때는 `alternativeFor`, `nearbyWalk`, `budget`, `reservation`, `sourceUrls`를 함께 기록하고 기본 동선과 분리해.

출력 규칙:
1. 먼저 `조사 요약:` 아래에 추천 일정의 날짜별 요약과 조사하지 못한 항목을 짧게 보여줘.
2. 그 다음 `JSON:` 아래에 유효한 JSON 객체 하나를 출력해. JSON 내부에는 설명, Markdown 주석, trailing comma를 넣지 마.
3. 최상위 키는 반드시 `schemaVersion`, `researchedAt`, `trip`, `lodging`, `fixedEvents`, `guideItems`, `days`, `researchLog`를 사용하고 `schemaVersion`은 정확히 `travel-research.v1`로 해.
4. `days[].stops[]`에는 `order`, `name`, `nameJa`, `category`, `plannedTime`, `purpose`, `address`, `googleMapsUrl`, `directionsUrl`, `coordinates`, `hours`, `lastOrder`, `closedDays`, `price`, `admission`, `reservationStatus`, `reservationUrl`, `infoSourceUrl`, `image`, `menu`, `alternatives`, `notes`, `confidence`, `needsConfirmation`을 넣어.
5. `category`는 `photo`, `restaurant`, `cafe`, `hotel`, `station`, `airport`, `logistics` 중 하나만 사용해. `coordinates`는 `{ "lat": number, "lng": number }` 또는 null로 해.
6. 이미지 객체는 `pageUrl`, `imageUrl`, `rightsNote`; 메뉴 항목은 `nameJa`, `nameKo`, `price`, `note`, `sourceUrl`, `image`를 사용해. 모르는 값은 빈 문자열 대신 null 또는 `확인 필요`로 적어.
7. `guideItems`에는 예약·입장·교통·휴무·날씨/계절·결제·짐·접근성 관련 준비 정보를 넣어. 각 항목은 `id`, `kind`(`must`/`warning`/`tip`), `title`, `body`, 필요한 `dayNumber`, `sourceUrls`, `checkable`을 사용하고, 확인 불가 내용은 `확인 필요`와 이유를 body에 적어.

여행 입력:
[위 입력 항목을 실제 정보로 채워서 붙여넣기]
```

조사 결과는 `<destination-slug>-research.json`으로 저장하거나 그대로 다음 앱 생성 프롬프트에 붙여넣습니다. 이 파일은 조사 단계의 결과이므로 앱 코드나 HTML을 포함하지 않습니다.
