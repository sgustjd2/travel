# Trip data contract

Use the shared TypeScript types in `src/travel-ui/types.ts` as the final authority. `src/Prototype.tsx` is the screen orchestrator; it should not become a second copy of the data contract. This reference captures the fields an agent must preserve when creating a new destination.

## Trip and day

```json
{
  "title": "여행 제목",
  "days": [
    {
      "id": "day-1",
      "dayNumber": 1,
      "dayOfMonth": 19,
      "city": "교토",
      "title": "하루 일정 제목",
      "places": []
    }
  ]
}
```

Keep `dayNumber`, `dayOfMonth`, and each place `order` numeric. Use stable kebab-case IDs. If lodging repeats on different days, give each itinerary occurrence its own ID.

## Preparation guide items

`guideItems` is the shared source for the quick-menu `준비·꿀팁` sheet. Put trip-wide or day-specific preparation information here instead of adding destination-specific UI fields.

```json
{
  "guideItems": [
    {
      "id": "yamamoto-menzo-reservation",
      "kind": "must",
      "title": "야마모토 멘조 예약 확인",
      "body": "온라인 예약은 방문 3일 전 0시부터 가능합니다. 확인하지 못한 내용은 확인 필요로 표시합니다.",
      "dayNumber": 2,
      "sourceUrls": ["https://example.com/official"],
      "checkable": true
    }
  ]
}
```

`kind`는 `must`(필수 준비), `warning`(주의할 점), `tip`(여행 꿀팁) 중 하나만 사용합니다. `id`는 안정적인 kebab-case로 만들고, 준비 완료를 저장할 항목은 `checkable: true`(생략해도 true)로 둡니다. 단순 안내는 `checkable: false`로 둡니다. 예약·입장·교통·휴무·날씨/계절·결제·짐·접근성처럼 실제 행동에 영향을 주는 내용만 조사해 추가하고, 확인할 수 없는 내용은 본문에 `확인 필요`와 사유를 명시합니다. 변동 정보에는 `sourceUrls`를 남깁니다. 앱의 로컬 기록에는 사용자가 체크한 ID를 `completedGuideIds`로 저장합니다.

## Place

```json
{
  "id": "sample-restaurant",
  "order": 3,
  "name": "샘플 식당",
  "nameJa": "サンプル食堂",
  "category": "restaurant",
  "latitude": 35.0116,
  "longitude": 135.7681,
  "address": "교토시 ...",
  "plannedTime": "12:00 점심",
  "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=...",
  "directionsUrl": "https://www.google.com/maps/dir/?api=1&destination=35.0116,135.7681",
  "hours": "11:00–21:00 · L.O. 20:30",
  "closedDays": "화요일",
  "price": "약 ¥1,000–¥2,000",
  "admission": "해당 없음",
  "reservationStatus": "recommended",
  "infoSourceUrl": "https://example.com/official",
  "imageUrl": "assets/trip/sample-place.png",
  "menu": [
    { "name": "日本語 메뉴명", "nameKo": "한국어 메뉴명", "price": "¥1,200", "note": "선택" }
  ]
}
```

Normally include `id`, `order`, `name`, `category`, `googleMapsUrl`, `address`, `plannedTime`, `hours`, `price`, `admission`, and `directionsUrl`. Coordinates are optional only when the location cannot be resolved confidently; do not provide one coordinate without the other.

Allowed categories:

- `photo`: 전망, 사찰, 거리, 공원, 전망대
- `restaurant`: 식사·맛집
- `cafe`: 카페·디저트
- `hotel`: 숙소
- `station`: 역·환승 거점
- `airport`: 공항
- `logistics`: 짐 보관, 이동 준비, 기타 운영 지점

Useful optional fields are `photoPoint`, `menuPoint`, `operatingNote`, `closedDays`, `budget`, `optional`, `alternativeFor`, and `nearbyWalk`. For restaurants and cafes, provide `closedDays` explicitly; use `확인 필요` when the source does not confirm a regular closure day. A fallback restaurant should use `optional: true` and identify the primary place with `alternativeFor`.

## Uncertainty and links

Use a user-provided Maps URL first. For a missing URL, use an exact official place or Google Maps search URL. A lodging URL described as “같아”, “추정”, or similar is not confirmed: keep `reservationStatus: "check_required"`, label the address as a shared/estimated pin, and state what must be checked.

Do not turn an approximate price, schedule, menu, opening hour, or address into a confirmed fact. Store `확인 필요` in the visible field or notes and include the best source URL.

## Menu translation

Keep the original Japanese in `name`; add a short natural Korean rendering in `nameKo`. Do not replace the original. Use `note` for serving size, availability, or a translation caveat. Keep the source price unchanged.
