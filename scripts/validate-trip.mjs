#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const categories = new Set(["photo", "restaurant", "cafe", "hotel", "station", "airport", "logistics"]);
const reservationStatuses = new Set(["required", "recommended", "not_required", "check_required", "completed"]);
const japaneseText = /[\u3040-\u30ff\u3400-\u9fff]/;
const errors = [];

function addError(file, message) {
  errors.push(`${path.relative(root, file)}: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validateTrip(file) {
  let trip;
  try {
    trip = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    addError(file, `invalid JSON (${error.message})`);
    return { days: 0, places: 0 };
  }

  if (!isObject(trip)) {
    addError(file, "root must be an object");
    return { days: 0, places: 0 };
  }
  if (!isNonEmptyString(trip.title)) addError(file, "title is required");
  if (!Array.isArray(trip.days) || trip.days.length === 0) {
    addError(file, "days must be a non-empty array");
    return { days: 0, places: 0 };
  }

  const ids = new Set();
  const dayNumbers = new Set();
  let placeCount = 0;

  for (const [dayIndex, day] of trip.days.entries()) {
    const dayLabel = `day ${dayIndex + 1}`;
    if (!isObject(day)) {
      addError(file, `${dayLabel} must be an object`);
      continue;
    }
    for (const field of ["id", "city", "title"]) {
      if (!isNonEmptyString(day[field])) addError(file, `${dayLabel}.${field} is required`);
    }
    if (!Number.isInteger(day.dayNumber) || day.dayNumber < 1) addError(file, `${dayLabel}.dayNumber must be a positive integer`);
    if (!Number.isInteger(day.dayOfMonth) || day.dayOfMonth < 1 || day.dayOfMonth > 31) addError(file, `${dayLabel}.dayOfMonth must be an integer from 1 to 31`);
    if (dayNumbers.has(day.dayNumber)) addError(file, `duplicate dayNumber ${day.dayNumber}`);
    dayNumbers.add(day.dayNumber);
    if (!Array.isArray(day.places) || day.places.length === 0) {
      addError(file, `${dayLabel}.places must be a non-empty array`);
      continue;
    }

    const orders = new Set();
    for (const [placeIndex, place] of day.places.entries()) {
      const placeLabel = `${dayLabel} place ${placeIndex + 1}`;
      placeCount += 1;
      if (!isObject(place)) {
        addError(file, `${placeLabel} must be an object`);
        continue;
      }
      for (const field of ["id", "name", "category", "googleMapsUrl"]) {
        if (!isNonEmptyString(place[field])) addError(file, `${placeLabel}.${field} is required`);
      }
      if (ids.has(place.id)) addError(file, `duplicate place id ${place.id}`);
      ids.add(place.id);
      if (!Number.isInteger(place.order) || place.order < 1) addError(file, `${placeLabel}.order must be a positive integer`);
      if (orders.has(place.order)) addError(file, `${dayLabel} has duplicate place order ${place.order}`);
      orders.add(place.order);
      if (!categories.has(place.category)) addError(file, `${placeLabel}.category is not supported: ${place.category}`);
      if (place.latitude !== undefined || place.longitude !== undefined) {
        if (!isNumber(place.latitude) || !isNumber(place.longitude)) addError(file, `${placeLabel} latitude and longitude must be provided together as numbers`);
        if (isNumber(place.latitude) && (place.latitude < -90 || place.latitude > 90)) addError(file, `${placeLabel}.latitude is out of range`);
        if (isNumber(place.longitude) && (place.longitude < -180 || place.longitude > 180)) addError(file, `${placeLabel}.longitude is out of range`);
      }
      if (place.reservationStatus !== undefined && !reservationStatuses.has(place.reservationStatus)) addError(file, `${placeLabel}.reservationStatus is not supported: ${place.reservationStatus}`);
      if (place.menu !== undefined) {
        if (!Array.isArray(place.menu)) {
          addError(file, `${placeLabel}.menu must be an array`);
        } else {
          for (const [menuIndex, menu] of place.menu.entries()) {
            const menuLabel = `${placeLabel} menu ${menuIndex + 1}`;
            if (!isObject(menu) || !isNonEmptyString(menu.name) || !isNonEmptyString(menu.price)) addError(file, `${menuLabel} requires name and price`);
            if (isObject(menu) && japaneseText.test(menu.name) && !isNonEmptyString(menu.nameKo)) addError(file, `${menuLabel}.nameKo is required when name contains Japanese text`);
          }
        }
      }
    }

    if (day.routeOptions !== undefined) {
      if (!Array.isArray(day.routeOptions) || day.routeOptions.length === 0) {
        addError(file, `${dayLabel}.routeOptions must be a non-empty array`);
      } else {
        const routeIds = new Set();
        const placeIds = new Set(day.places.filter(isObject).map((place) => place.id));
        for (const [routeIndex, route] of day.routeOptions.entries()) {
          const routeLabel = `${dayLabel} route ${routeIndex + 1}`;
          if (!isObject(route)) {
            addError(file, `${routeLabel} must be an object`);
            continue;
          }
          for (const field of ["id", "title", "summary"]) {
            if (!isNonEmptyString(route[field])) addError(file, `${routeLabel}.${field} is required`);
          }
          if (routeIds.has(route.id)) addError(file, `${dayLabel} has duplicate route id ${route.id}`);
          routeIds.add(route.id);
          if (!Array.isArray(route.placeIds) || route.placeIds.length === 0) {
            addError(file, `${routeLabel}.placeIds must be a non-empty array`);
          } else {
            for (const placeId of route.placeIds) {
              if (!isNonEmptyString(placeId) || !placeIds.has(placeId)) addError(file, `${routeLabel} references an unknown place id: ${placeId}`);
            }
          }
        }
        if (day.defaultRouteId !== undefined && !routeIds.has(day.defaultRouteId)) addError(file, `${dayLabel}.defaultRouteId must match a route id`);
      }
    } else if (day.defaultRouteId !== undefined) {
      addError(file, `${dayLabel}.defaultRouteId requires routeOptions`);
    }
  }

  return { days: trip.days.length, places: placeCount };
}

const requestedFiles = process.argv.slice(2).map((file) => path.resolve(root, file));
const canonicalTravelRoot = path.join(root, "travel");
const files = requestedFiles.length > 0
  ? requestedFiles
  : (existsSync(canonicalTravelRoot) ? readdirSync(canonicalTravelRoot, { withFileTypes: true }) : [])
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(canonicalTravelRoot, entry.name, "trip.json"))
    .filter((file) => existsSync(file));

if (files.length === 0) {
  console.error("No trip.json files found. Pass a file path, for example: npm run validate:trip -- travel/kyoto-kobe-trip/trip.json");
  process.exit(1);
}

let totals = { days: 0, places: 0 };
for (const file of files) {
  if (!existsSync(file)) {
    addError(file, "file not found");
    continue;
  }
  const result = validateTrip(file);
  totals = { days: totals.days + result.days, places: totals.places + result.places };
}

if (errors.length > 0) {
  console.error(`Trip validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Trip validation passed: ${files.length} file(s), ${totals.days} day(s), ${totals.places} place(s).`);
