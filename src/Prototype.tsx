import { useCallback, useEffect, useMemo, useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { MapContainer, Marker, Polyline, Tooltip, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  ArrowUp,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CircleHelp,
  ExternalLink,
  Heart,
  Info,
  LocateFixed,
  Map as MapIcon,
  MapPinned,
  Navigation,
  Pencil,
  Plus,
  StickyNote,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { BottomSheet, KeyboardInput, KeyboardTextarea, MobileScroll, useKeyboard } from "./mobile";
import { CATEGORY_COLORS, CATEGORY_CONFIGS, TravelBottomNav, TravelCategoryLegend, TravelDataTransferSheet, TravelGuideSheet, TravelHeader, TravelPlaceCard, categoryIcons, categoryLabels, type CategoryConfig } from "./travel-ui";
import type { Category, CategoryFilter, Coordinate, DayFilter, LocalTripState, MapPlace, MenuImageKey, MenuItem, Place, PlaceDraft, ReservationStatus, TransferMode, TransferPayload, TransferStatus, Trip, TripDay, View } from "./travel-ui";
const tripDataFiles = import.meta.glob("../travel/*/trip.json", { eager: true, import: "default" }) as Record<string, Trip>;

setWorkerUrl(maplibreWorkerUrl);

const tripSlug = window.location.pathname.split("/").filter(Boolean).at(-1) ?? "kyoto-kobe-trip";
const trip = tripDataFiles[`../travel/${tripSlug}/trip.json`] ?? tripDataFiles["../travel/kyoto-kobe-trip/trip.json"] ?? { title: "여행 지도", days: [] };
const tripStorageKey = `travel-map-state-${tripSlug}`;
const tripDestinationLabel = trip.title.replace(/\s*여행(?:\s*지도)?$/, "").trim();
const tripDateLabel = trip.days.length ? `${trip.days[0].dayOfMonth}일 ~ ${trip.days[trip.days.length - 1].dayOfMonth}일 · ${tripDestinationLabel || trip.days[0].city}` : "여행 일정";
const CATEGORY_IMAGE_URLS: Partial<Record<Category, string>> = {
  restaurant: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg/330px-Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  cafe: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/330px-Latte_and_dark_coffee.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
};
const MENU_IMAGE_URLS: Record<MenuImageKey, string> = {
  ramen: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg/330px-Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  gyoza: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/%E5%8F%B0%E7%81%A3%E5%8D%97%E6%8A%95%E8%8D%89%E5%B1%AF%E6%B0%B4%E9%A4%83Nantou%2C_Taiwan_Caotun_dumplings.jpg/330px-%E5%8F%B0%E7%81%A3%E5%8D%97%E6%8A%95%E8%8D%89%E5%B1%AF%E6%B0%B4%E9%A4%83Nantou%2C_Taiwan_Caotun_dumplings.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  rice: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/20201102.Hengnan.Hybrid_rice_Sanyou-1.6.jpg/330px-20201102.Hengnan.Hybrid_rice_Sanyou-1.6.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  udon: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/%E9%B6%8F%E5%A4%A9%E3%81%AE%E3%81%86%E3%81%A9%E3%82%93.jpg/330px-%E9%B6%8F%E5%A4%A9%E3%81%AE%E3%81%86%E3%81%A9%E3%82%93.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  tempura: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Tempura_01.jpg/330px-Tempura_01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  curry: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Taj_Mahal_-_Lamb_Curry_Madras.jpg/330px-Taj_Mahal_-_Lamb_Curry_Madras.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  omurice: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Omurice_by_Taimeiken.jpg/330px-Omurice_by_Taimeiken.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  croquette: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Potato_croquettes_001.jpg/330px-Potato_croquettes_001.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  stew: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Lamb-stew.jpg/330px-Lamb-stew.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  soba: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Dried_soba_noodles_by_FotoosVanRobin.jpg/330px-Dried_soba_noodles_by_FotoosVanRobin.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  oyakodon: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Oyakodon_003.jpg/330px-Oyakodon_003.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  sushi: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Sushi_platter.jpg/330px-Sushi_platter.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  unagi: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/%E5%B0%8F%E5%B7%9D%E8%8F%8A%E9%B0%BB%E9%AD%9A_%2849287165332%29.jpg/330px-%E5%B0%8F%E5%B7%9D%E8%8F%8A%E9%B0%BB%E9%AD%9A_%2849287165332%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  "potato-salad": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Potato_salad_%281%29.jpg/330px-Potato_salad_%281%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  steak: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Steak_with_shitaki_mushrooms.jpg/330px-Steak_with_shitaki_mushrooms.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  karaage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Chicken_karaage_003.jpg/330px-Chicken_karaage_003.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  sausage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Wurstplatte.jpg/330px-Wurstplatte.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  pilaf: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Afghan_Palo.jpg/330px-Afghan_Palo.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  beer: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Jeju_beer_09_%28cropped%29.jpg/330px-Jeju_beer_09_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  coffee: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/330px-Latte_and_dark_coffee.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  pudding: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Flan_2.jpg/330px-Flan_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  pancake: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Foodiesfeed.com_pouring-honey-on-pancakes-with-walnuts.jpg/330px-Foodiesfeed.com_pouring-honey-on-pancakes-with-walnuts.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
  katsu: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Matsunoya_W_Mega_Chicken_Katsu_Set_20200923-04.jpg/330px-Matsunoya_W_Mega_Chicken_Katsu_Set_20200923-04.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
};
const reservationLabels: Record<ReservationStatus, string> = {
  required: "예약 필수",
  recommended: "예약 권장",
  not_required: "예약 불필요",
  check_required: "확인 필요",
  completed: "예약 완료",
};

const KOREAN_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const KOREAN_LABEL_EXPRESSION = [
  "coalesce",
  ["get", "name:ko"],
  ["get", "name:ko-Latn"],
  ["get", "name:en"],
  ["get", "name_en"],
  ["get", "name:latin"],
  ["get", "name:nonlatin"],
  ["get", "name"],
] as const;

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === "string")) as Record<string, string>;
}

function normalizeLocalState(value: Partial<LocalTripState> | null | undefined): LocalTripState {
  const selectedDay = Number(value?.selectedDay);
  return {
    selectedDay: trip.days.some((day) => day.dayOfMonth === selectedDay) ? selectedDay : trip.days[0]?.dayOfMonth ?? 1,
    completedPlaceIds: stringArray(value?.completedPlaceIds),
    completedGuideIds: stringArray(value?.completedGuideIds),
    favoritePlaceIds: stringArray(value?.favoritePlaceIds),
    notes: stringRecord(value?.notes),
    reservationDoneIds: stringArray(value?.reservationDoneIds),
    placeEdits: value?.placeEdits && typeof value.placeEdits === "object" && !Array.isArray(value.placeEdits) ? value.placeEdits : {},
    hiddenPlaceIds: stringArray(value?.hiddenPlaceIds),
    addedPlaces: Array.isArray(value?.addedPlaces) ? value.addedPlaces : [],
    actualOnly: Boolean(value?.actualOnly),
  };
}

function readLocalState(): LocalTripState | null {
  try {
    const raw = window.localStorage.getItem(tripStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalTripState>;
    return normalizeLocalState(parsed);
  } catch {
    return null;
  }
}

function createTransferText(state: LocalTripState, tripSnapshot: Trip) {
  const payload: TransferPayload = { schemaVersion: 1, kind: "travel-map-state", tripSlug, tripTitle: trip.title, exportedAt: new Date().toISOString(), tripSnapshot, state };
  return JSON.stringify(payload, null, 2);
}

function parseTransferText(value: string) {
  const parsed = JSON.parse(value) as Record<string, unknown>;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("JSON 객체 형식이 아닙니다.");
  if (parsed.kind !== undefined && parsed.kind !== "travel-map-state") throw new Error("이 앱에서 만든 여행 데이터가 아닙니다.");
  if (typeof parsed.tripSlug === "string" && parsed.tripSlug !== tripSlug) throw new Error(`다른 여행(${parsed.tripSlug}) 데이터입니다.`);
  const state = parsed.state && typeof parsed.state === "object" && !Array.isArray(parsed.state) ? parsed.state as Partial<LocalTripState> : parsed as Partial<LocalTripState>;
  return normalizeLocalState(state);
}

function initialDayOfMonth() {
  const queryDay = Number(new URLSearchParams(window.location.search).get("day"));
  const storedDay = readLocalState()?.selectedDay;
  return trip.days.some((day) => day.dayOfMonth === queryDay)
    ? queryDay
    : trip.days.some((day) => day.dayOfMonth === storedDay)
      ? storedDay!
      : trip.days[0].dayOfMonth;
}

function emptyPlaceDraft(): PlaceDraft {
  return { name: "", category: "photo", plannedTime: "", address: "", hours: "", closedDays: "", price: "", admission: "", latitude: "", longitude: "", googleMapsUrl: "", directionsUrl: "", notes: "", markVisited: true };
}

function placeToDraft(place: MapPlace | null): PlaceDraft {
  if (!place) return emptyPlaceDraft();
  return { name: place.name, category: place.category, plannedTime: place.plannedTime ?? "", address: place.address ?? "", hours: place.hours ?? "", closedDays: place.closedDays ?? "", price: place.price ?? "", admission: place.admission ?? "", latitude: place.latitude === undefined ? "" : String(place.latitude), longitude: place.longitude === undefined ? "" : String(place.longitude), googleMapsUrl: place.googleMapsUrl, directionsUrl: place.directionsUrl ?? "", notes: place.notes ?? "", markVisited: false };
}

function optionalText(value: string) {
  return value.trim() || undefined;
}

function parseCoordinate(value: string) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseCoordinatesFromUrl(value: string): Coordinate | null {
  const match = value.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/) ?? value.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : null;
}

function draftToPlace(draft: PlaceDraft, id: string, order: number): Place {
  const query = [draft.name.trim(), draft.address.trim()].filter(Boolean).join(" ");
  const googleMapsUrl = draft.googleMapsUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const directionsUrl = draft.directionsUrl.trim() || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  const urlCoordinates = parseCoordinatesFromUrl(googleMapsUrl);
  return { id, order, name: draft.name.trim(), category: draft.category, plannedTime: optionalText(draft.plannedTime), address: optionalText(draft.address), hours: optionalText(draft.hours), closedDays: optionalText(draft.closedDays), price: optionalText(draft.price), admission: optionalText(draft.admission), latitude: parseCoordinate(draft.latitude) ?? urlCoordinates?.[0], longitude: parseCoordinate(draft.longitude) ?? urlCoordinates?.[1], googleMapsUrl, directionsUrl, notes: optionalText(draft.notes) };
}

function closureText(place: Pick<Place, "category" | "closedDays">) {
  if (place.closedDays) return place.closedDays;
  return place.category === "restaurant" || place.category === "cafe" ? "확인 필요" : undefined;
}

function coordinates(place: Place): Coordinate | null {
  return typeof place.latitude === "number" && typeof place.longitude === "number" ? [place.latitude, place.longitude] : null;
}

function mapTileUrl(point: Coordinate, zoom = 15) {
  const scale = 2 ** zoom;
  const x = Math.floor(((point[1] + 180) / 360) * scale);
  const latitude = (point[0] * Math.PI) / 180;
  const y = Math.floor(((1 - Math.asinh(Math.tan(latitude)) / Math.PI) / 2) * scale);
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

function menuImageUrl(item: MenuItem) {
  return item.imageUrl ?? (item.imageKey ? MENU_IMAGE_URLS[item.imageKey] : undefined);
}

function resolveImageUrl(imageUrl: string | undefined) {
  if (!imageUrl || imageUrl.startsWith("http") || imageUrl.startsWith("/")) return imageUrl;
  return `${import.meta.env.BASE_URL}${imageUrl}`;
}

function useMenuImagePreviews(items: MenuItem[], open: boolean) {
  useEffect(() => {
    if (!open || !items.length) return;
    const lists = Array.from(document.querySelectorAll<HTMLElement>(".detail-sheet-content .menu-list"));
    const list = lists.at(-1);
    if (!list) return;
    const rows = Array.from(list.children).filter((row): row is HTMLElement => row instanceof HTMLElement);
    rows.forEach((row, index) => {
      const imageUrl = menuImageUrl(items[index]);
      row.classList.toggle("has-menu-image", Boolean(imageUrl));
      if (imageUrl) row.style.setProperty("--menu-image", 'url("' + imageUrl + '")');
    });
    return () => rows.forEach((row) => {
      row.classList.remove("has-menu-image");
      row.style.removeProperty("--menu-image");
    });
  }, [items, open]);
}

function PlacePreview({ place }: { place: Place }) {
  const point = coordinates(place);
  const imageUrl = resolveImageUrl(place.imageUrl ?? CATEGORY_IMAGE_URLS[place.category]);
  const [imageState, setImageState] = useState<"loading" | "loaded" | "failed">(imageUrl ? "loading" : "failed");
  useEffect(() => {
    setImageState(imageUrl ? "loading" : "failed");
  }, [imageUrl]);
  const hasImage = Boolean(imageUrl) && imageState !== "failed";
  const showImage = hasImage && imageState === "loaded";
  const previewStyle = point ? { backgroundImage: `url("${mapTileUrl(point)}")` } : undefined;
  return <span className={`place-preview ${showImage ? "has-image" : point ? "" : "is-empty"}`} style={previewStyle} aria-hidden="true">{hasImage ? <img className={`place-preview-image ${showImage ? "is-loaded" : ""}`} src={imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" onLoad={() => setImageState("loaded")} onError={() => setImageState("failed")} /> : null}{showImage ? <span className="place-preview-caption">{place.imageUrl ? "대표 이미지" : "카테고리 이미지"}</span> : point ? <><span className="place-preview-pin" /><span className="place-preview-caption">지도 미리보기</span></> : <MapIcon size={18} />}</span>;
}

function distanceKm(start: Coordinate, end: Coordinate) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(end[0] - start[0]);
  const longitudeDelta = toRadians(end[1] - start[1]);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(toRadians(start[0])) * Math.cos(toRadians(end[0])) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceLabel(current: Place, next?: Place) {
  if (!next) return "다음 일정 없음";
  const start = coordinates(current);
  const end = coordinates(next);
  if (!start || !end) return "이동 정보 확인 필요";
  const distance = distanceKm(start, end);
  return `직선 약 ${distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}`;
}

function comparePlaceOrder(left: Place, right: Place) {
  return (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER);
}

function createNumberIcon(label: string, selected: boolean, optional: boolean, color: string, offsetX = 0) {
  return L.divIcon({
    className: "number-marker-icon",
    html: `<span class="number-marker ${selected ? "is-selected" : ""} ${optional ? "is-optional" : ""}" style="--marker-color:${color}">${label}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18 - offsetX, 18],
  });
}

function duplicateMarkerOffsets(places: MapPlace[]) {
  const groups = new Map<string, MapPlace[]>();
  places.forEach((place) => {
    const point = coordinates(place);
    if (!point) return;
    const key = point.map((value) => value.toFixed(5)).join(",");
    const group = groups.get(key) ?? [];
    group.push(place);
    groups.set(key, group);
  });
  const offsets = new Map<string, number>();
  groups.forEach((group) => {
    if (group.length < 2) return;
    const center = (group.length - 1) / 2;
    group.slice().sort((left, right) => left.order - right.order).forEach((place, index) => {
      offsets.set(place.id, Math.round((index - center) * 40));
    });
  });
  return offsets;
}

const currentLocationIcon = L.divIcon({ className: "current-location-icon", html: '<span class="current-location-dot" aria-hidden="true"></span>', iconSize: [24, 24], iconAnchor: [12, 12] });

function MapViewport({ routePlaces, selectedPlace, userLocation, locationRequestId }: { routePlaces: MapPlace[]; selectedPlace: Place | null; userLocation: Coordinate | null; locationRequestId: number }) {
  const map = useMap();
  const routeKey = routePlaces.map((place) => place.id).join("|");

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 60);
    return () => window.clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    const points = routePlaces.map(coordinates).filter((point): point is Coordinate => Boolean(point));
    if (points.length === 1) map.setView(points[0], 15, { animate: false });
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 15, animate: false });
  }, [map, routeKey]);

  useEffect(() => {
    if (!userLocation || locationRequestId === 0) return;
    map.flyTo(userLocation, Math.max(map.getZoom(), 14), { duration: 0.45 });
  }, [locationRequestId, map, userLocation]);

  useEffect(() => {
    const point = selectedPlace ? coordinates(selectedPlace) : null;
    if (point) map.flyTo(point, Math.max(map.getZoom(), 15), { duration: 0.45 });
  }, [map, selectedPlace?.id]);

  return userLocation ? <Marker position={userLocation} icon={currentLocationIcon} /> : null;
}

function KoreanMapLayer({ onReady, onError }: { onReady: () => void; onError: () => void }) {
  const map = useMap();

  useEffect(() => {
    let active = true;
    const layer = maplibreGL({ style: KOREAN_MAP_STYLE_URL }).addTo(map);
    const glMap = layer.getMaplibreMap();
    const handleLoad = () => {
      if (!active) return;
      for (const styleLayer of glMap.getStyle().layers) {
        if (styleLayer.type !== "symbol" || !styleLayer.layout?.["text-field"]) continue;
        glMap.setLayoutProperty(styleLayer.id, "text-field", KOREAN_LABEL_EXPRESSION as never);
      }
      onReady();
    };
    const handleError = (event: { error?: unknown }) => {
      if (event.error) onError();
    };

    glMap.on("load", handleLoad);
    glMap.on("error", handleError);
    return () => {
      active = false;
      glMap.off("load", handleLoad);
      glMap.off("error", handleError);
      map.removeLayer(layer);
    };
  }, [map, onError, onReady]);

  return null;
}

function MapButtons({ routePlaces, onLocate, locationStatus }: { routePlaces: MapPlace[]; onLocate: () => void; locationStatus: LocationStatus }) {
  const map = useMap();
  const fitRoute = () => {
    const points = routePlaces.map(coordinates).filter((point): point is Coordinate => Boolean(point));
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 15 });
  };
  return <div className="map-actions" aria-label="지도 조작"><button type="button" className="map-action" onClick={onLocate} disabled={locationStatus === "locating"} aria-label={locationStatus === "ready" ? "현재 위치 새로고침" : "내 위치 보기"}><LocateFixed size={18} strokeWidth={1.9} /><span>{locationStatus === "locating" ? "확인 중" : "내 위치"}</span></button><button type="button" className="map-action" onClick={fitRoute} aria-label="오늘 경로 맞춤 보기"><MapPinned size={18} strokeWidth={1.9} /><span>경로 맞춤</span></button></div>;
}

function MapResizeWatcher({ condensed }: { condensed: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (condensed) return;
    const frame = window.requestAnimationFrame(() => map.invalidateSize());
    return () => window.cancelAnimationFrame(frame);
  }, [condensed, map]);
  return null;
}

function OfflineMapFallback({ places, onSelect }: { places: MapPlace[]; onSelect: (place: MapPlace) => void }) {
  return <div className="offline-map" role="status"><div className="offline-map-icon"><MapIcon size={20} /></div><strong>지도를 불러올 수 없습니다</strong><p>저장된 일정과 주소는 계속 확인할 수 있어요.</p><div className="offline-place-list">{places.filter((place) => !place.optional).slice(0, 5).map((place) => <button type="button" key={place.id} onClick={() => onSelect(place)}><span className="offline-place-number" style={{ "--number-color": CATEGORY_COLORS[place.category] } as CSSProperties}>{place.order}</span><span>{place.name}</span><ChevronRight size={15} /></button>)}</div></div>;
}

type LocationStatus = "idle" | "locating" | "ready" | "error";

function TripMap({ places, routePlaces, selectedPlace, onSelect, onMarkerSelect, userLocation, onUserLocation, mode = "day" }: { places: MapPlace[]; routePlaces: MapPlace[]; selectedPlace: Place | null; onSelect: (place: MapPlace) => void; onMarkerSelect?: (place: MapPlace) => void; userLocation: Coordinate | null; onUserLocation: (location: Coordinate) => void; mode?: "day" | "all" }) {
  const [mapError, setMapError] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [mapCondensed, setMapCondensed] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(() => userLocation ? "ready" : "idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationRequestId, setLocationRequestId] = useState(0);
  const mapPlaces = places.filter((place) => coordinates(place));
  const markerOffsets = duplicateMarkerOffsets(mapPlaces);
  const routePoints = routePlaces.map(coordinates).filter((point): point is Coordinate => Boolean(point));
  const center = routePoints[0] ?? [34.9858, 135.7588];
  const handleMapReady = useCallback(() => setMapError(false), []);
  const handleMapError = useCallback(() => setMapError(true), []);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => { window.removeEventListener("online", online); window.removeEventListener("offline", offline); };
  }, []);

  useEffect(() => {
    if (mode !== "day") return;
    const scroll = document.querySelector<HTMLElement>('[data-testid="mobile-scroll"]');
    if (!scroll) return;
    const update = () => setMapCondensed(scroll.scrollTop > 180);
    update();
    scroll.addEventListener("scroll", update, { passive: true });
    return () => scroll.removeEventListener("scroll", update);
  }, [mode]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("이 브라우저에서는 현재 위치를 사용할 수 없습니다.");
      return;
    }
    setLocationStatus("locating");
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationStatus("ready");
        setLocationError(null);
        setLocationRequestId((current) => current + 1);
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "위치 권한을 허용해야 현재 위치를 표시할 수 있어요."
          : error.code === error.POSITION_UNAVAILABLE
            ? "현재 위치를 확인하지 못했어요. 다시 시도해 주세요."
            : "위치 확인 시간이 초과됐어요. 다시 시도해 주세요.";
        setLocationStatus("error");
        setLocationError(message);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 },
    );
  }, [onUserLocation]);

  useEffect(() => {
    if (userLocation) setLocationStatus("ready");
  }, [userLocation]);

  useEffect(() => {
    if (userLocation || !navigator.geolocation || !navigator.permissions?.query) return;
    let active = true;
    navigator.permissions.query({ name: "geolocation" }).then((permission) => {
      if (!active) return;
      if (permission.state === "granted") requestLocation();
      if (permission.state === "denied") {
        setLocationStatus("error");
        setLocationError("브라우저 설정에서 위치 권한이 차단되어 있습니다.");
      }
    }).catch(() => undefined);
    return () => { active = false; };
  }, [mode, requestLocation, userLocation]);
  const mapUnavailable = !isOnline || mapError;

  const tripMap = <section className={`trip-map ${mode === "all" ? "is-all-map" : "is-schedule-map"}${mapCondensed && mode === "day" ? " is-condensed" : ""}`} aria-label={mode === "all" ? "전체 여행 지도" : "오늘 일정 지도"}>
    <div className="map-label-row"><div><span className="eyebrow">ROUTE PREVIEW</span><strong>{mode === "all" ? "전체 경로" : "방문 순서"}</strong></div><span className="map-count">{mapPlaces.length}곳 표시</span></div>
    <div className="map-frame" data-scroll-drag="ignore">
      {mapUnavailable ? <OfflineMapFallback places={places} onSelect={onSelect} /> : <MapContainer center={center} zoom={13} minZoom={1} zoomControl={false} scrollWheelZoom doubleClickZoom className="leaflet-map" aria-label="한글 여행 지도">
        <MapResizeWatcher condensed={mapCondensed} />
        <KoreanMapLayer onReady={handleMapReady} onError={handleMapError} />
        <MapViewport routePlaces={routePlaces} selectedPlace={selectedPlace} userLocation={userLocation} locationRequestId={locationRequestId} />
        <ZoomControl position="bottomright" />
        <MapButtons routePlaces={routePlaces} onLocate={requestLocation} locationStatus={locationStatus} />
        {routePoints.length > 1 ? <Polyline positions={routePoints} pathOptions={{ color: "#1457d9", weight: 3, opacity: 0.8, dashArray: "6 8" }} /> : null}
        {mapPlaces.map((place) => { const point = coordinates(place); if (!point) return null; const color = CATEGORY_COLORS[place.category]; const label = mode === "all" ? `${place.dayNumber}·${place.order}` : String(place.order); const Icon = categoryIcons[place.category]; return <Marker key={`${place.id}-${place.order}`} position={point} icon={createNumberIcon(label, selectedPlace?.id === place.id, Boolean(place.optional), color, markerOffsets.get(place.id) ?? 0)} eventHandlers={{ click: () => (onMarkerSelect ?? onSelect)(place) }} alt={`DAY ${place.dayNumber} ${place.order}번 ${place.name}`}><Tooltip direction="top" offset={[0, -14]} opacity={0.96}><span className="map-tooltip"><Icon size={12} /> {place.name}<small>{categoryLabels[place.category]}</small></span></Tooltip></Marker>; })}
      </MapContainer>}
      {locationStatus === "locating" || locationError ? <p className={`map-location-status${locationError ? " is-error" : ""}`} role="status">{locationStatus === "locating" ? "현재 위치 확인 중…" : locationError}</p> : null}
      {mapUnavailable ? <button type="button" className="map-retry" onClick={() => { setMapError(false); setIsOnline(navigator.onLine); }}><MapIcon size={15} /> 지도 다시 불러오기</button> : null}
    </div>
    <p className="map-caption"><span className="route-dash" /> 선은 실제 도로가 아닌 방문 순서입니다.</p>
  </section>;
  return mode === "day" ? <div className="trip-map-slot">{tripMap}</div> : tripMap;
}

function ReservationBadge({ status, completed }: { status?: ReservationStatus; completed?: boolean }) {
  if (!status || status === "not_required") return null;
  return <span className={`reservation-badge status-${completed ? "completed" : status}`}>{completed ? reservationLabels.completed : reservationLabels[status]}</span>;
}

function PlaceCardDataAdapter({ place, selected, completed, favorite, onSelect, onToggleComplete, onToggleFavorite }: { place: Place; selected: boolean; completed: boolean; favorite: boolean; onSelect: () => void; onToggleComplete: () => void; onToggleFavorite: () => void }) {
  const category: CategoryConfig = { key: place.category, label: categoryLabels[place.category], color: CATEGORY_COLORS[place.category], Icon: categoryIcons[place.category] };
  return <TravelPlaceCard place={place} selected={selected} completed={completed} favorite={favorite} category={category} closureText={closureText(place)} preview={<PlacePreview place={place} />} onSelect={onSelect} onToggleComplete={onToggleComplete} onToggleFavorite={onToggleFavorite} />;
}

function MenuSection({ items }: { items: MenuItem[] }) {
  return <div className="detail-block menu-section"><div className="detail-label-row"><span className="detail-label">메뉴판</span><small>일본어 원문 · 한국어 번역</small></div><div className="menu-list">{items.map((item) => <div key={`${item.name}-${item.price}`}><span className="menu-copy"><strong lang="ja">{item.nameJa ?? item.name}</strong><small className={item.nameKo ? "menu-translation" : "menu-translation is-missing"}>{item.nameKo ?? "한국어 번역 확인 필요"}</small>{item.note ? <small>{item.note}</small> : null}</span><b>{item.price}</b></div>)}</div></div>;
}

function RouteConnector({ current, next }: { current: Place; next?: Place }) {
  if (!next) return null;
  return <div className="route-connector" aria-label={`${current.name}에서 ${next.name}까지 ${distanceLabel(current, next)}`}><span className="route-line" /><span className="route-distance"><Navigation size={12} /> {distanceLabel(current, next)}</span></div>;
}

function PlaceEditorSheet({ place, open, completed, onClose, onSave }: { place: MapPlace | null; open: boolean; completed: boolean; onClose: () => void; onSave: (draft: PlaceDraft) => void }) {
  const keyboard = useKeyboard();
  const [draft, setDraft] = useState<PlaceDraft>(() => ({ ...placeToDraft(place), markVisited: !place || completed }));

  useEffect(() => {
    if (open) setDraft({ ...placeToDraft(place), markVisited: !place || completed });
  }, [completed, open, place]);

  const updateDraft = <Key extends keyof PlaceDraft>(key: Key, value: PlaceDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return <BottomSheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }} title={place ? "장소 정보 수정" : "실제 장소 추가"} description={place ? "여행 중 바뀐 정보와 방문 기록을 업데이트하세요." : "현재 선택한 날짜에 방문한 장소를 추가하세요."} snap={0.92}><div className="editor-sheet-content"><div className="editor-help"><Info size={15} /><span>Google Maps 링크가 없으면 장소명과 주소로 검색 링크를 자동으로 만들어요. 좌표가 없으면 목록에는 보이고 지도 핀은 생략됩니다.</span></div><div className="editor-grid"><label className="editor-field editor-field-wide"><span>장소명</span><KeyboardInput value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} onBlur={() => keyboard.hide()} placeholder="예: 니시키시장" autoComplete="off" /></label><label className="editor-field"><span>카테고리</span><select value={draft.category} onChange={(event) => updateDraft("category", event.target.value as Category)}><option value="photo">사진 명소</option><option value="restaurant">맛집</option><option value="cafe">카페</option><option value="hotel">숙소</option><option value="station">역</option><option value="airport">공항</option><option value="logistics">짐 보관·이동</option></select></label><label className="editor-field"><span>방문 시간</span><KeyboardInput value={draft.plannedTime} onChange={(event) => updateDraft("plannedTime", event.target.value)} onBlur={() => keyboard.hide()} placeholder="예: 14:30" autoComplete="off" /></label><label className="editor-field editor-field-wide"><span>주소</span><KeyboardInput value={draft.address} onChange={(event) => updateDraft("address", event.target.value)} onBlur={() => keyboard.hide()} placeholder="장소 주소 또는 역 이름" autoComplete="street-address" /></label><label className="editor-field"><span>영업시간</span><KeyboardInput value={draft.hours} onChange={(event) => updateDraft("hours", event.target.value)} onBlur={() => keyboard.hide()} placeholder="예: 10:00–18:00" autoComplete="off" /></label><label className="editor-field"><span>휴무일</span><KeyboardInput value={draft.closedDays} onChange={(event) => updateDraft("closedDays", event.target.value)} onBlur={() => keyboard.hide()} placeholder="예: 매주 수요일 / 부정기 / 확인 필요" autoComplete="off" /></label><label className="editor-field"><span>가격·예산</span><KeyboardInput value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} onBlur={() => keyboard.hide()} placeholder="예: 약 ¥1,200" autoComplete="off" /></label><label className="editor-field"><span>입장료</span><KeyboardInput value={draft.admission} onChange={(event) => updateDraft("admission", event.target.value)} onBlur={() => keyboard.hide()} placeholder="예: 무료 / ¥500" autoComplete="off" /></label><label className="editor-field"><span>위도</span><KeyboardInput value={draft.latitude} onChange={(event) => updateDraft("latitude", event.target.value)} onBlur={() => keyboard.hide()} placeholder="예: 35.0116" inputMode="decimal" autoComplete="off" /></label><label className="editor-field"><span>경도</span><KeyboardInput value={draft.longitude} onChange={(event) => updateDraft("longitude", event.target.value)} onBlur={() => keyboard.hide()} placeholder="예: 135.7681" inputMode="decimal" autoComplete="off" /></label><label className="editor-field editor-field-wide"><span>Google Maps 링크</span><KeyboardInput value={draft.googleMapsUrl} onChange={(event) => updateDraft("googleMapsUrl", event.target.value)} onBlur={() => keyboard.hide()} placeholder="https://maps.google.com/..." autoComplete="url" /></label><label className="editor-field editor-field-wide"><span>길찾기 링크 <small>선택</small></span><KeyboardInput value={draft.directionsUrl} onChange={(event) => updateDraft("directionsUrl", event.target.value)} onBlur={() => keyboard.hide()} placeholder="비워두면 장소 링크를 사용" autoComplete="url" /></label><label className="editor-field editor-field-wide"><span>메모</span><KeyboardTextarea value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} onBlur={() => keyboard.hide()} placeholder="실제로 간 시간, 대기, 느낀 점" rows={3} /></label></div><label className="visited-checkbox"><input type="checkbox" checked={draft.markVisited} onChange={(event) => updateDraft("markVisited", event.target.checked)} /><span><Check size={15} /> 실제 방문한 장소로 기록</span></label><div className="editor-actions"><button type="button" className="secondary-link" onClick={onClose}>취소</button><button type="button" className="primary-link" onClick={() => onSave(draft)} disabled={!draft.name.trim()}><Check size={16} /> 저장</button></div></div></BottomSheet>;
}

function LegacyPlaceDetailSheet({ place, day, open, onClose, note, onNoteChange, completed, favorite, onToggleComplete, onToggleFavorite }: { place: Place | null; day: TripDay | undefined; open: boolean; onClose: () => void; note: string; onNoteChange: (note: string) => void; completed: boolean; favorite: boolean; onToggleComplete: () => void; onToggleFavorite: () => void }) {
  const keyboard = useKeyboard();
  if (!place) return null;
  const Icon = categoryIcons[place.category];
  const nearbyAlternatives = day?.places.filter((candidate) => candidate.optional && candidate.category === "restaurant" && candidate.alternativeFor === place.id) ?? [];
  const menuItems = (place.menu ?? []).map((item) => ({ ...item, name: `${item.nameJa ?? item.name}\n${item.nameKo ?? "한국어 번역 확인 필요"}` }));
  return <BottomSheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }} title={place.name} description={`${day ? `DAY ${day.dayNumber} · ${day.dayOfMonth}일` : "전체 일정"} · ${categoryLabels[place.category]}`} snap={0.82}><div className="detail-sheet-content"><button type="button" className="sheet-close" onClick={onClose}><X size={16} /> 닫기</button><div className="detail-topline"><span className={`detail-icon category-${place.category}`}><Icon size={19} /></span><span>{place.plannedTime ?? "시간 미정"}</span><ReservationBadge status={place.reservationStatus} /></div>{place.nameJa ? <p className="detail-ja">{place.nameJa}</p> : null}<div className="detail-facts" aria-label="운영·가격 정보"><div><Clock3 size={15} /><span><small>영업시간</small><strong>{place.hours ?? "방문 전 확인"}</strong></span></div><div><CircleDollarSign size={15} /><span><small>가격대</small><strong>{place.price ?? place.budget ?? "현장 확인"}</strong></span></div><div><Ticket size={15} /><span><small>입장료</small><strong>{place.admission ?? (place.category === "restaurant" || place.category === "cafe" ? "해당 없음" : "현장 확인")}</strong></span></div></div>{place.address ? <div className={`detail-address ${!coordinates(place) ? "is-warning" : ""}`}><MapPinned size={16} /><span>{place.address}</span></div> : null}{!coordinates(place) ? <div className="detail-warning"><CircleHelp size={16} /><span>정확한 핀/좌표가 아직 없어 Google Maps 검색 결과를 확인해야 합니다.</span></div> : null}{place.nearbyWalk ? <div className="nearby-callout"><MapPinned size={16} /><span>{place.nearbyWalk}</span></div> : null}{nearbyAlternatives.length ? <div className="detail-block"><span className="detail-label">근처 대체 식당</span><div className="detail-alternative-list">{nearbyAlternatives.map((candidate) => <button type="button" key={candidate.id} onClick={() => window.open(candidate.googleMapsUrl, "_blank", "noopener,noreferrer")}><span><strong>{candidate.name}</strong><small>{candidate.nearbyWalk ?? "같은 일정의 대체 후보"}</small></span><ChevronRight size={15} /></button>)}</div></div> : null}{menuItems.length ? <div className="detail-block"><span className="detail-label">메뉴판</span><div className="menu-list">{menuItems.map((item) => <div key={`${item.name}-${item.price}`}><span><strong>{item.name}</strong>{item.note ? <small>{item.note}</small> : null}</span><b>{item.price}</b></div>)}</div></div> : null}{place.photoPoint ? <div className="detail-block"><span className="detail-label">촬영 포인트</span><p>{place.photoPoint}</p></div> : null}{place.menuPoint && !menuItems.length ? <div className="detail-block"><span className="detail-label">추천 메뉴</span><p>{place.menuPoint}{place.budget ? ` · ${place.budget}` : ""}</p></div> : null}{place.operatingNote ? <div className="detail-block"><span className="detail-label">운영 메모</span><p>{place.operatingNote}</p></div> : null}{place.notes ? <div className="detail-block"><span className="detail-label">일정 메모</span><p>{place.notes}</p></div> : null}<div className="detail-links"><a className="primary-link" href={place.directionsUrl ?? place.googleMapsUrl} target="_blank" rel="noreferrer"><Navigation size={16} /> Google Maps 길찾기 <ExternalLink size={14} /></a><a className="secondary-link" href={place.googleMapsUrl} target="_blank" rel="noreferrer"><MapIcon size={16} /> 장소 보기 <ExternalLink size={14} /></a>{place.infoSourceUrl ? <a className="info-source-link" href={place.infoSourceUrl} target="_blank" rel="noreferrer"><Info size={16} /> 공식 정보·메뉴 원문 <ExternalLink size={14} /></a> : null}{place.reservationUrl ? <a className="reservation-link" href={place.reservationUrl} target="_blank" rel="noreferrer"><CalendarDays size={16} /> 예약 확인 <ExternalLink size={14} /></a> : null}</div><div className="detail-actions"><button type="button" className={favorite ? "is-active" : ""} onClick={onToggleFavorite}><Heart size={16} fill={favorite ? "currentColor" : "none"} /> {favorite ? "저장됨" : "저장"}</button><button type="button" className={completed ? "is-active" : ""} onClick={onToggleComplete}><Check size={16} /> {completed ? "방문 완료" : "방문 완료 체크"}</button></div><label className="note-field"><span><StickyNote size={15} /> 현지 메모</span><KeyboardTextarea value={note} onChange={(event) => onNoteChange(event.target.value)} onBlur={() => keyboard.hide()} placeholder="기다린 시간, 맛집 대기, 촬영한 컷을 적어두세요" rows={3} /></label></div></BottomSheet>;
}

function EditablePlaceDetailSheet({ place, day, open, onClose, note, onNoteChange, completed, favorite, onToggleComplete, onToggleFavorite, onEdit, onDelete }: { place: Place | null; day: TripDay | undefined; open: boolean; onClose: () => void; note: string; onNoteChange: (note: string) => void; completed: boolean; favorite: boolean; onToggleComplete: () => void; onToggleFavorite: () => void; onEdit: () => void; onDelete: () => void }) {
  const keyboard = useKeyboard();
  if (!place) return null;
  const Icon = categoryIcons[place.category];
  const closedDays = closureText(place);
  const nearbyAlternatives = day?.places.filter((candidate) => candidate.optional && candidate.category === "restaurant" && candidate.alternativeFor === place.id) ?? [];
  const menuItems = (place.menu ?? []).map((item) => ({ ...item, name: `${item.nameJa ?? item.name}\n${item.nameKo ?? "한국어 번역 확인 필요"}` }));
  return <BottomSheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }} title={place.name} description={`${day ? `DAY ${day.dayNumber} · ${day.dayOfMonth}일` : "전체 일정"} · ${categoryLabels[place.category]}`} snap={0.82}><div className="detail-sheet-content"><button type="button" className="sheet-close" onClick={onClose}><X size={16} /> 닫기</button><div className="detail-topline"><span className={`detail-icon category-${place.category}`}><Icon size={19} /></span><span>{place.plannedTime ?? "시간 미정"}</span><ReservationBadge status={place.reservationStatus} /></div>{place.nameJa ? <p className="detail-ja">{place.nameJa}</p> : null}<div className="detail-facts" aria-label="운영·가격 정보"><div><Clock3 size={15} /><span><small>영업시간</small><strong>{place.hours ?? "방문 전 확인"}</strong></span></div><div><CircleDollarSign size={15} /><span><small>가격대</small><strong>{place.price ?? place.budget ?? "현장 확인"}</strong></span></div><div><Ticket size={15} /><span><small>입장료</small><strong>{place.admission ?? (place.category === "restaurant" || place.category === "cafe" ? "해당 없음" : "현장 확인")}</strong></span></div></div>{closedDays ? <div className={"detail-closure" + (closedDays === "확인 필요" ? " is-warning" : "")}><CalendarDays size={16} /><span><small>휴무일</small><strong>{closedDays}</strong></span></div> : null}{place.address ? <div className={`detail-address ${!coordinates(place) ? "is-warning" : ""}`}><MapPinned size={16} /><span>{place.address}</span></div> : null}{!coordinates(place) ? <div className="detail-warning"><CircleHelp size={16} /><span>정확한 핀/좌표가 아직 없어 Google Maps 검색 결과를 확인해야 합니다.</span></div> : null}{place.nearbyWalk ? <div className="nearby-callout"><MapPinned size={16} /><span>{place.nearbyWalk}</span></div> : null}{nearbyAlternatives.length ? <div className="detail-block"><span className="detail-label">근처 대체 식당</span><div className="detail-alternative-list">{nearbyAlternatives.map((candidate) => <button type="button" key={candidate.id} onClick={() => window.open(candidate.googleMapsUrl, "_blank", "noopener,noreferrer")}><span><strong>{candidate.name}</strong><small>{candidate.nearbyWalk ?? "같은 일정의 대체 후보"}</small></span><ChevronRight size={15} /></button>)}</div></div> : null}{menuItems.length ? <div className="detail-block"><span className="detail-label">메뉴판</span><div className="menu-list">{menuItems.map((item) => <div key={`${item.name}-${item.price}`}><span><strong>{item.name}</strong>{item.note ? <small>{item.note}</small> : null}</span><b>{item.price}</b></div>)}</div></div> : null}{place.photoPoint ? <div className="detail-block"><span className="detail-label">촬영 포인트</span><p>{place.photoPoint}</p></div> : null}{place.menuPoint && !menuItems.length ? <div className="detail-block"><span className="detail-label">추천 메뉴</span><p>{place.menuPoint}{place.budget ? ` · ${place.budget}` : ""}</p></div> : null}{place.operatingNote ? <div className="detail-block"><span className="detail-label">운영 메모</span><p>{place.operatingNote}</p></div> : null}{place.notes ? <div className="detail-block"><span className="detail-label">일정 메모</span><p>{place.notes}</p></div> : null}<div className="detail-links"><a className="primary-link" href={place.directionsUrl ?? place.googleMapsUrl} target="_blank" rel="noreferrer"><Navigation size={16} /> Google Maps 길찾기 <ExternalLink size={14} /></a><a className="secondary-link" href={place.googleMapsUrl} target="_blank" rel="noreferrer"><MapIcon size={16} /> 장소 보기 <ExternalLink size={14} /></a>{place.infoSourceUrl ? <a className="info-source-link" href={place.infoSourceUrl} target="_blank" rel="noreferrer"><Info size={16} /> 공식 정보·메뉴 원문 <ExternalLink size={14} /></a> : null}{place.reservationUrl ? <a className="reservation-link" href={place.reservationUrl} target="_blank" rel="noreferrer"><CalendarDays size={16} /> 예약 확인 <ExternalLink size={14} /></a> : null}</div><div className="detail-actions"><button type="button" className={favorite ? "is-active" : ""} onClick={onToggleFavorite}><Heart size={16} fill={favorite ? "currentColor" : "none"} /> {favorite ? "저장됨" : "저장"}</button><button type="button" className={completed ? "is-active" : ""} onClick={onToggleComplete}><Check size={16} /> {completed ? "방문 완료" : "방문 완료 체크"}</button><button type="button" onClick={onEdit}><Pencil size={16} /> 수정</button><button type="button" className="danger-action" onClick={onDelete}><Trash2 size={16} /> 삭제</button></div><label className="note-field"><span><StickyNote size={15} /> 현지 메모</span><KeyboardTextarea value={note} onChange={(event) => onNoteChange(event.target.value)} onBlur={() => keyboard.hide()} placeholder="기다린 시간, 맛집 대기, 촬영한 컷을 적어두세요" rows={3} /></label></div></BottomSheet>;
}

function PlaceDetailSheet({ place, day, open, onClose, note, onNoteChange, completed, favorite, onToggleComplete, onToggleFavorite, onEdit, onDelete }: { place: Place | null; day: TripDay | undefined; open: boolean; onClose: () => void; note: string; onNoteChange: (note: string) => void; completed: boolean; favorite: boolean; onToggleComplete: () => void; onToggleFavorite: () => void; onEdit: () => void; onDelete: () => void }) {
  useMenuImagePreviews(place?.menu ?? [], open);
  return <EditablePlaceDetailSheet place={place} day={day} open={open} onClose={onClose} note={note} onNoteChange={onNoteChange} completed={completed} favorite={favorite} onToggleComplete={onToggleComplete} onToggleFavorite={onToggleFavorite} onEdit={onEdit} onDelete={onDelete} />;
}

function ScheduleView({ activeDay, selectedPlace, selectedPlaceId, showAlternatives, setShowAlternatives, actualOnly, onToggleActualOnly, onAddPlace, onSelectPlace, onFocusPlace, onToggleComplete, onToggleFavorite, completedIds, favoriteIds, userLocation, onUserLocation }: { activeDay: TripDay; selectedPlace: Place | null; selectedPlaceId: string | null; showAlternatives: boolean; setShowAlternatives: (show: boolean) => void; actualOnly: boolean; onToggleActualOnly: () => void; onAddPlace: () => void; onSelectPlace: (place: MapPlace) => void; onFocusPlace: (place: MapPlace) => void; onToggleComplete: (id: string) => void; onToggleFavorite: (id: string) => void; completedIds: string[]; favoriteIds: string[]; userLocation: Coordinate | null; onUserLocation: (location: Coordinate) => void }) {
  const primaryPlaces = activeDay.places.filter((place) => !place.optional).sort(comparePlaceOrder);
  const restaurantAlternatives = activeDay.places.filter((place) => place.optional && place.category === "restaurant").sort(comparePlaceOrder);
  const otherAlternatives = activeDay.places.filter((place) => place.optional && place.category !== "restaurant").sort(comparePlaceOrder);
  const withDay = (place: Place): MapPlace => ({ ...place, dayNumber: activeDay.dayNumber, dayOfMonth: activeDay.dayOfMonth, dayTitle: activeDay.title });
  const visitedCount = activeDay.places.filter((place) => completedIds.includes(place.id)).length;
  const renderCard = (place: Place) => <PlaceCardDataAdapter place={place} selected={selectedPlaceId === place.id} completed={completedIds.includes(place.id)} favorite={favoriteIds.includes(place.id)} onSelect={() => onSelectPlace(withDay(place))} onToggleComplete={() => onToggleComplete(place.id)} onToggleFavorite={() => onToggleFavorite(place.id)} />;
  return (
    <main className="schedule-view">
      <section className="day-intro">
        <div className="day-intro-copy">
          <h1>{activeDay.title}</h1>
          <p>{activeDay.city}</p>
        </div>
        <div className="day-intro-tools">
          <button type="button" className={`record-view-button ${actualOnly ? "is-active" : ""}`} aria-pressed={actualOnly} onClick={onToggleActualOnly}><Check size={14} /> {actualOnly ? "전체 일정" : `실제 방문 ${visitedCount}곳`}</button>
          <button type="button" className="record-add-button" onClick={onAddPlace}><Plus size={15} /> 장소 추가</button>
          <label className="alternative-toggle"><input type="checkbox" checked={showAlternatives} onChange={(event) => setShowAlternatives(event.target.checked)} /><span className="toggle-track" /><span>대체 후보</span></label>
        </div>
      </section>
      <TripMap places={primaryPlaces.map(withDay)} routePlaces={primaryPlaces.map(withDay)} selectedPlace={selectedPlace} onSelect={onSelectPlace} onMarkerSelect={onFocusPlace} userLocation={userLocation} onUserLocation={onUserLocation} />
      <section className="itinerary-section" aria-label={`${activeDay.dayOfMonth}일 일정 목록`}>
        <div className="section-heading"><div><span className="eyebrow">{primaryPlaces.length} STOPS</span><h2>{actualOnly ? "실제 방문 기록" : "오늘의 동선"}</h2></div><span className="section-hint">체크=실제 방문</span></div>
        <TravelCategoryLegend categories={CATEGORY_CONFIGS} />
        <div className="itinerary-list">{primaryPlaces.map((place, index) => <div key={`${place.id}-item`}>{renderCard(place)}<RouteConnector current={place} next={primaryPlaces[index + 1]} /></div>)}</div>
      </section>
      {showAlternatives && restaurantAlternatives.length ? <section className="alternatives-section" aria-label="근처 대체 식당"><div className="section-heading"><div><span className="eyebrow">NEARBY RESTAURANTS</span><h2>근처 대체 식당</h2></div><span className="section-hint">기본 동선은 유지</span></div><p className="section-description">예약이 어렵거나 대기가 길 때, 해당 식당 주변에서 바로 바꿔 갈 수 있는 후보입니다.</p><div className="itinerary-list">{restaurantAlternatives.map((place) => <div key={`${place.id}-alternative`}>{renderCard(place)}</div>)}</div></section> : null}
      {showAlternatives && otherAlternatives.length ? <section className="alternatives-section other-alternatives" aria-label="대체 코스"><div className="section-heading"><div><span className="eyebrow">OPTIONAL ROUTES</span><h2>대체 촬영 코스</h2></div></div><p className="section-description">시간과 운영일을 확인한 뒤 기본 동선 대신 선택하세요.</p><div className="itinerary-list">{otherAlternatives.map((place) => <div key={`${place.id}-alternative`}>{renderCard(place)}</div>)}</div></section> : null}
    </main>
  );
}

function AllMapView({ allPlaces, selectedPlace, onSelectPlace, onUserLocation, userLocation }: { allPlaces: MapPlace[]; selectedPlace: Place | null; onSelectPlace: (place: MapPlace) => void; onUserLocation: (location: Coordinate) => void; userLocation: Coordinate | null }) {
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const filtered = allPlaces.filter((place) => (dayFilter === "all" || place.dayOfMonth === dayFilter) && (categoryFilter === "all" || place.category === categoryFilter)).sort((left, right) => (left.dayNumber ?? 0) - (right.dayNumber ?? 0) || comparePlaceOrder(left, right));
  const routePlaces = filtered.filter((place) => !place.optional);
  const categoryOptions: Array<{ key: CategoryFilter; label: string }> = [{ key: "all", label: "전체" }, { key: "photo", label: "사진" }, { key: "restaurant", label: "맛집" }, { key: "cafe", label: "카페" }, { key: "hotel", label: "숙소" }];
  return <main className="all-map-view"><section className="view-heading"><span className="eyebrow">ALL DAYS</span><h1>전체 지도</h1><p>날짜와 장소 종류로 경로를 가볍게 좁혀볼 수 있어요.</p></section><div className="filter-group"><span className="filter-label">날짜</span><div className="filter-row">{[{ key: "all", label: "전체" }, ...trip.days.map((day) => ({ key: day.dayOfMonth, label: String(day.dayOfMonth) }))].map((filter) => <button type="button" key={String(filter.key)} className={dayFilter === filter.key ? "is-active" : ""} onClick={() => setDayFilter(filter.key as DayFilter)}>{filter.label}</button>)}</div></div><div className="filter-group"><span className="filter-label">장소</span><div className="filter-row">{categoryOptions.map((filter) => <button type="button" key={filter.key} className={categoryFilter === filter.key ? "is-active" : ""} onClick={() => setCategoryFilter(filter.key)}>{filter.label}</button>)}</div></div><TripMap mode="all" places={filtered} routePlaces={routePlaces} selectedPlace={selectedPlace} onSelect={onSelectPlace} userLocation={userLocation} onUserLocation={onUserLocation} /><section className="all-map-list"><div className="section-heading"><div><span className="eyebrow">{filtered.length} PLACES</span><h2>필터 결과</h2></div></div>{filtered.filter((place) => !place.optional).slice(0, 12).map((place) => <button type="button" key={place.id} onClick={() => onSelectPlace(place)} className={selectedPlace?.id === place.id ? "is-selected" : ""}><span className="all-map-number" style={{ "--number-color": CATEGORY_COLORS[place.category] } as CSSProperties}>{place.order}</span><span><strong>{place.name}</strong><small>DAY {place.dayNumber} · {categoryLabels[place.category]}</small></span><ChevronRight size={16} /></button>)}</section></main>;
}

function ReservationsView({ places, reservationDoneIds, onToggleReservation, onSelectPlace }: { places: MapPlace[]; reservationDoneIds: string[]; onToggleReservation: (id: string) => void; onSelectPlace: (place: MapPlace) => void }) {
  const reservationPlaces = places.filter((place) => place.reservationStatus && place.reservationStatus !== "not_required");
  const pendingCount = reservationPlaces.filter((place) => !reservationDoneIds.includes(place.id)).length;
  return <main className="simple-view reservations-view"><section className="view-heading"><span className="eyebrow">RESERVATIONS</span><h1>예약·운영 확인</h1><p>Notion 원본은 바꾸지 않고, 이 기기에서만 체크해요.</p></section><div className="reservation-summary"><span><Bookmark size={18} /> 확인할 항목</span><strong>{pendingCount}개 남음</strong></div><section className="reservation-list">{reservationPlaces.map((place) => { const done = reservationDoneIds.includes(place.id); return <div className={`reservation-row ${done ? "is-done" : ""}`} key={place.id}><button type="button" className={`reservation-check ${done ? "is-active" : ""}`} onClick={() => onToggleReservation(place.id)} aria-label={`${place.name} ${done ? "예약 완료 해제" : "예약 완료 처리"}`}>{done ? <Check size={15} /> : null}</button><button type="button" className="reservation-copy" onClick={() => onSelectPlace(place)}><span><strong>{place.name}</strong><small>DAY {place.dayNumber} · {place.plannedTime ?? "시간 미정"}</small></span><ReservationBadge status={place.reservationStatus} completed={done} /></button><ChevronRight size={16} className="row-chevron" /></div>; })}</section></main>;
}

function SavedView({ places, favoriteIds, notes, onSelectPlace }: { places: MapPlace[]; favoriteIds: string[]; notes: Record<string, string>; onSelectPlace: (place: MapPlace) => void }) {
  const savedPlaces = places.filter((place) => favoriteIds.includes(place.id));
  const notedPlaces = places.filter((place) => notes[place.id]?.trim());
  return <main className="simple-view saved-view"><section className="view-heading"><span className="eyebrow">SAVED</span><h1>저장한 장소</h1><p>즐겨찾기와 현지에서 적어둔 메모를 모아봤어요.</p></section><section className="saved-section"><div className="section-heading"><div><span className="eyebrow">FAVORITES</span><h2>즐겨찾기</h2></div><span className="count-chip">{savedPlaces.length}</span></div>{savedPlaces.length ? <div className="saved-list">{savedPlaces.map((place) => <button type="button" key={place.id} onClick={() => onSelectPlace(place)}><Heart size={16} fill="currentColor" /><span><strong>{place.name}</strong><small>DAY {place.dayNumber} · {categoryLabels[place.category]}</small></span><ChevronRight size={16} /></button>)}</div> : <div className="empty-card"><Heart size={22} /><strong>아직 저장한 장소가 없어요</strong><span>일정 카드의 하트 버튼으로 모아둘 수 있어요.</span></div>}</section><section className="saved-section"><div className="section-heading"><div><span className="eyebrow">FIELD NOTES</span><h2>현지 메모</h2></div><span className="count-chip">{notedPlaces.length}</span></div>{notedPlaces.length ? <div className="saved-list">{notedPlaces.map((place) => <button type="button" key={place.id} onClick={() => onSelectPlace(place)}><StickyNote size={16} /><span><strong>{place.name}</strong><small>{notes[place.id]}</small></span><ChevronRight size={16} /></button>)}</div> : <div className="empty-card"><StickyNote size={22} /><strong>메모가 비어 있어요</strong><span>장소 상세에서 현지 메모를 남겨보세요.</span></div>}</section></main>;
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scroll = document.querySelector<HTMLElement>('[data-testid="mobile-scroll"]');
    if (!scroll) return;
    const update = () => setVisible(scroll.scrollTop > 280);
    update();
    scroll.addEventListener("scroll", update, { passive: true });
    return () => scroll.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;
  return <button type="button" className="scroll-top-button" aria-label="맨 위로 이동" onClick={() => document.querySelector<HTMLElement>('[data-testid="mobile-scroll"]')?.scrollTo({ top: 0, behavior: "smooth" })}><ArrowUp size={19} strokeWidth={2.1} /></button>;
}

export default function Prototype() {
  const persisted = useMemo(() => readLocalState(), []);
  const [view, setView] = useState<View>("schedule");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => initialDayOfMonth());
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>(persisted?.completedPlaceIds ?? []);
  const [completedGuideIds, setCompletedGuideIds] = useState<string[]>(persisted?.completedGuideIds ?? []);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(persisted?.favoritePlaceIds ?? []);
  const [notes, setNotes] = useState<Record<string, string>>(persisted?.notes ?? {});
  const [reservationDoneIds, setReservationDoneIds] = useState<string[]>(persisted?.reservationDoneIds ?? []);
  const [placeEdits, setPlaceEdits] = useState<Record<string, Partial<Place>>>(persisted?.placeEdits ?? {});
  const [hiddenPlaceIds, setHiddenPlaceIds] = useState<string[]>(persisted?.hiddenPlaceIds ?? []);
  const [addedPlaces, setAddedPlaces] = useState<MapPlace[]>(persisted?.addedPlaces ?? []);
  const [actualOnly, setActualOnly] = useState(Boolean(persisted?.actualOnly));
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorPlace, setEditorPlace] = useState<MapPlace | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<TransferMode>("export");
  const [transferText, setTransferText] = useState("");
  const [transferStatus, setTransferStatus] = useState<TransferStatus>(null);
  const editedDays = useMemo(() => trip.days.map((day) => {
    const originalPlaces = day.places.filter((place) => !hiddenPlaceIds.includes(place.id)).map((place) => ({ ...place, ...(placeEdits[place.id] ?? {}) }));
    const manualPlaces = addedPlaces.filter((place) => place.dayNumber === day.dayNumber).map(({ dayNumber: _dayNumber, dayOfMonth: _dayOfMonth, dayTitle: _dayTitle, ...place }) => place);
    return { ...day, places: [...originalPlaces, ...manualPlaces] };
  }), [addedPlaces, hiddenPlaceIds, placeEdits]);
  const visibleDays = useMemo(() => editedDays.map((day) => ({ ...day, places: actualOnly ? day.places.filter((place) => completedIds.includes(place.id)) : day.places })), [actualOnly, completedIds, editedDays]);
  const transferTripSnapshot = useMemo<Trip>(() => ({ ...trip, days: editedDays }), [editedDays]);
  const activeDay = visibleDays.find((day) => day.dayOfMonth === selectedDay) ?? visibleDays[0] ?? trip.days[0];
  const allPlaces = useMemo(() => visibleDays.flatMap((day) => day.places.map((place) => ({ ...place, dayNumber: day.dayNumber, dayOfMonth: day.dayOfMonth, dayTitle: day.title }))), [visibleDays]);
  const selectedPlace = allPlaces.find((place) => place.id === selectedPlaceId) ?? null;
  const selectedPlaceDay = selectedPlace ? visibleDays.find((day) => day.dayNumber === selectedPlace.dayNumber) : activeDay;

  useEffect(() => { window.localStorage.setItem(tripStorageKey, JSON.stringify({ selectedDay, completedPlaceIds: completedIds, completedGuideIds, favoritePlaceIds: favoriteIds, notes, reservationDoneIds, placeEdits, hiddenPlaceIds, addedPlaces, actualOnly } satisfies LocalTripState)); }, [selectedDay, completedIds, completedGuideIds, favoriteIds, notes, reservationDoneIds, placeEdits, hiddenPlaceIds, addedPlaces, actualOnly]);
  useEffect(() => { const query = new URLSearchParams(window.location.search); query.set("day", String(selectedDay)); window.history.replaceState({}, "", `${window.location.pathname}?${query.toString()}`); }, [selectedDay]);
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined); }, []);

  const currentLocalState: LocalTripState = { selectedDay, completedPlaceIds: completedIds, completedGuideIds, favoritePlaceIds: favoriteIds, notes, reservationDoneIds, placeEdits, hiddenPlaceIds, addedPlaces, actualOnly };
  const openGuide = () => { setMenuOpen(false); setGuideOpen(true); };
  const openExportData = () => { setMenuOpen(false); setTransferMode("export"); setTransferText(createTransferText(currentLocalState, transferTripSnapshot)); setTransferStatus({ tone: "info", message: "이 JSON은 현재 일정 스냅샷과 방문·저장·메모·수정·삭제 기록을 포함합니다." }); setTransferOpen(true); };
  const openImportData = () => { setMenuOpen(false); setTransferMode("import"); setTransferText(""); setTransferStatus({ tone: "info", message: "카카오톡이나 파일에서 JSON 전체를 붙여넣어 주세요." }); setTransferOpen(true); };
  const copyTransferData = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(transferText);
      else {
        const textarea = document.querySelector<HTMLTextAreaElement>(".transfer-textarea");
        if (!textarea) throw new Error("복사할 영역을 찾을 수 없습니다.");
        textarea.focus();
        textarea.select();
        if (!document.execCommand("copy")) throw new Error("클립보드 권한이 없습니다.");
      }
      setTransferStatus({ tone: "success", message: "복사했습니다. 카카오톡 나에게 보내기나 AI 채팅에 붙여넣어 보관하세요." });
    } catch {
      setTransferStatus({ tone: "error", message: "자동 복사에 실패했습니다. JSON 영역을 길게 눌러 직접 복사해 주세요." });
    }
  };
  const shareTransferData = async () => {
    if (!navigator.share) { await copyTransferData(); return; }
    try {
      await navigator.share({ title: `${trip.title} 데이터`, text: transferText });
      setTransferStatus({ tone: "success", message: "공유를 완료했습니다. 카카오톡을 선택하면 대화방에 보낼 수 있어요." });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setTransferStatus({ tone: "error", message: "공유를 취소했거나 사용할 수 없습니다. 텍스트 복사를 이용해 주세요." });
    }
  };
  const downloadTransferData = () => {
    const url = URL.createObjectURL(new Blob([transferText], { type: "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tripSlug}-travel-data.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setTransferStatus({ tone: "success", message: "파일로 저장했습니다. 나중에 데이터 가져오기로 복원할 수 있어요." });
  };
  const applyTransferData = () => {
    try {
      const next = parseTransferText(transferText);
      setSelectedDay(next.selectedDay);
      setCompletedIds(next.completedPlaceIds);
      setCompletedGuideIds(next.completedGuideIds);
      setFavoriteIds(next.favoritePlaceIds);
      setNotes(next.notes);
      setReservationDoneIds(next.reservationDoneIds);
      setPlaceEdits(next.placeEdits);
      setHiddenPlaceIds(next.hiddenPlaceIds);
      setAddedPlaces(next.addedPlaces);
      setActualOnly(next.actualOnly);
      setSelectedPlaceId(null);
      setSheetOpen(false);
      setEditorOpen(false);
      setEditorPlace(null);
      setView("schedule");
      setTransferStatus({ tone: "success", message: "여행 기록을 업데이트했습니다. 방문 체크·메모·수정 내용을 확인해 보세요." });
    } catch (error) {
      setTransferStatus({ tone: "error", message: error instanceof Error ? error.message : "데이터를 읽지 못했습니다. JSON 전체를 다시 확인해 주세요." });
    }
  };
  const handleTransferFile = (file: File) => {
    file.text().then((value) => { setTransferText(value); setTransferStatus({ tone: "info", message: `${file.name}을 불러왔습니다. 내용을 확인한 뒤 업데이트하세요.` }); }).catch(() => setTransferStatus({ tone: "error", message: "파일을 읽지 못했습니다. JSON 파일인지 확인해 주세요." }));
  };
  const selectDay = (dayOfMonth: number) => { const nextDay = visibleDays.find((day) => day.dayOfMonth === dayOfMonth); if (!nextDay) return; setSelectedDay(dayOfMonth); setSelectedPlaceId(nextDay.places[0]?.id ?? null); setView("schedule"); setSheetOpen(false); };
  const focusPlace = (place: MapPlace) => {
    setSelectedDay(place.dayOfMonth);
    setSelectedPlaceId(place.id);
    setView("schedule");
    setSheetOpen(false);
    window.setTimeout(() => {
      const card = document.getElementById(`place-${place.id}`);
      const map = document.querySelector<HTMLElement>(".trip-map.is-schedule-map");
      const scroll = document.querySelector<HTMLElement>('[data-testid="mobile-scroll"]');
      if (!card || !map || !scroll) return;
      const targetTop = map.getBoundingClientRect().bottom + 12;
      const nextScrollTop = scroll.scrollTop + card.getBoundingClientRect().top - targetTop;
      scroll.scrollTo(0, Math.max(0, nextScrollTop));
    }, 120);
  };
  const selectPlace = (place: MapPlace) => { setSelectedDay(place.dayOfMonth); setSelectedPlaceId(place.id); setSheetOpen(true); window.setTimeout(() => document.getElementById(`place-${place.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); };
  const toggleId = (setIds: Dispatch<SetStateAction<string[]>>, id: string) => { setIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); };
  const openEditor = (place: MapPlace | null = null) => { setSheetOpen(false); window.setTimeout(() => { setEditorPlace(place); setEditorOpen(true); }, 180); };
  const savePlaceDraft = (draft: PlaceDraft) => {
    const existing = editorPlace;
    const id = existing?.id ?? `manual-${Date.now()}`;
    const sourceDay = editedDays.find((day) => day.dayNumber === (existing?.dayNumber ?? activeDay.dayNumber));
    const order = existing?.order ?? (sourceDay?.places.length ?? activeDay.places.length) + 1;
    const nextPlace = draftToPlace(draft, id, order);
    if (existing && addedPlaces.some((place) => place.id === existing.id)) {
      setAddedPlaces((current) => current.map((place) => place.id === existing.id ? { ...nextPlace, dayNumber: place.dayNumber, dayOfMonth: place.dayOfMonth, dayTitle: place.dayTitle } : place));
    } else if (existing) {
      setPlaceEdits((current) => ({ ...current, [existing.id]: nextPlace }));
    } else {
      setAddedPlaces((current) => [...current, { ...nextPlace, dayNumber: activeDay.dayNumber, dayOfMonth: activeDay.dayOfMonth, dayTitle: activeDay.title }]);
    }
    setCompletedIds((current) => draft.markVisited ? (current.includes(id) ? current : [...current, id]) : current.filter((item) => item !== id));
    setEditorOpen(false);
    setEditorPlace(null);
  };
  const deleteSelectedPlace = () => {
    if (!selectedPlace || !window.confirm(`${selectedPlace.name}을(를) 이 기기에서 숨길까요? 원본 일정은 바뀌지 않습니다.`)) return;
    if (addedPlaces.some((place) => place.id === selectedPlace.id)) setAddedPlaces((current) => current.filter((place) => place.id !== selectedPlace.id));
    else setHiddenPlaceIds((current) => current.includes(selectedPlace.id) ? current : [...current, selectedPlace.id]);
    setCompletedIds((current) => current.filter((id) => id !== selectedPlace.id));
    setFavoriteIds((current) => current.filter((id) => id !== selectedPlace.id));
    setReservationDoneIds((current) => current.filter((id) => id !== selectedPlace.id));
    setNotes((current) => { const next = { ...current }; delete next[selectedPlace.id]; return next; });
    setSelectedPlaceId(null);
    setSheetOpen(false);
  };
  const appContent: ReactNode = view === "schedule" ? <ScheduleView activeDay={activeDay} selectedPlace={selectedPlace} selectedPlaceId={selectedPlaceId} showAlternatives={showAlternatives} setShowAlternatives={setShowAlternatives} actualOnly={actualOnly} onToggleActualOnly={() => { setActualOnly((current) => !current); setSheetOpen(false); }} onAddPlace={() => openEditor()} onSelectPlace={selectPlace} onFocusPlace={focusPlace} onToggleComplete={(id) => toggleId(setCompletedIds, id)} onToggleFavorite={(id) => toggleId(setFavoriteIds, id)} completedIds={completedIds} favoriteIds={favoriteIds} userLocation={userLocation} onUserLocation={setUserLocation} /> : view === "map" ? <AllMapView allPlaces={allPlaces} selectedPlace={selectedPlace} onSelectPlace={selectPlace} onUserLocation={setUserLocation} userLocation={userLocation} /> : view === "reservations" ? <ReservationsView places={allPlaces} reservationDoneIds={reservationDoneIds} onToggleReservation={(id) => toggleId(setReservationDoneIds, id)} onSelectPlace={selectPlace} /> : <SavedView places={allPlaces} favoriteIds={favoriteIds} notes={notes} onSelectPlace={selectPlace} />;

  const headerTitle = view === "schedule" ? trip.title : view === "map" ? "전체 지도" : view === "reservations" ? "예약·운영 확인" : "저장한 장소";
  const changeView = (nextView: View) => { setView(nextView); setMenuOpen(false); };
  return <div className="trip-app"><MobileScroll className="trip-scroll"><div className="trip-scroll-content"><TravelHeader title={headerTitle} dateLabel={tripDateLabel} days={trip.days} activeDay={activeDay} view={view} menuOpen={menuOpen} onMenuToggle={setMenuOpen} onViewChange={changeView} onDayChange={selectDay} onOpenGuide={openGuide} onExportData={openExportData} onImportData={openImportData} />{appContent}</div></MobileScroll><ScrollToTopButton /><TravelBottomNav view={view} onViewChange={changeView} /><PlaceDetailSheet place={selectedPlace} day={selectedPlaceDay} open={sheetOpen} onClose={() => setSheetOpen(false)} note={selectedPlace ? notes[selectedPlace.id] ?? "" : ""} onNoteChange={(note) => { if (selectedPlace) setNotes((current) => ({ ...current, [selectedPlace.id]: note })); }} completed={selectedPlace ? completedIds.includes(selectedPlace.id) : false} favorite={selectedPlace ? favoriteIds.includes(selectedPlace.id) : false} onToggleComplete={() => { if (selectedPlace) toggleId(setCompletedIds, selectedPlace.id); }} onToggleFavorite={() => { if (selectedPlace) toggleId(setFavoriteIds, selectedPlace.id); }} onEdit={() => { if (selectedPlace) openEditor(selectedPlace); }} onDelete={deleteSelectedPlace} /><PlaceEditorSheet place={editorPlace} open={editorOpen} completed={editorPlace ? completedIds.includes(editorPlace.id) : false} onClose={() => { setEditorOpen(false); setEditorPlace(null); }} onSave={savePlaceDraft} /><TravelGuideSheet open={guideOpen} items={trip.guideItems ?? []} completedIds={completedGuideIds} onClose={() => setGuideOpen(false)} onToggle={(id) => toggleId(setCompletedGuideIds, id)} /><TravelDataTransferSheet open={transferOpen} mode={transferMode} text={transferText} status={transferStatus} onClose={() => setTransferOpen(false)} onTextChange={setTransferText} onImport={applyTransferData} onCopy={copyTransferData} onShare={shareTransferData} onDownload={downloadTransferData} onFileSelect={handleTransferFile} /></div>;
}
