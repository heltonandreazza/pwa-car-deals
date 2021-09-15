"use strict";
// version 0.11

// SW EVENTS
// Download/Parsed
// Installing
// Installed/Waiting
// Activating
// Activated
// Redundant
const carDealsCacheName = "carDealsCacheV1";
const carDealsCacheImagesName = "carDealsCacheImagesV1";
const carDealsCachePagesName = "carDealsCachePagesV1";
const carDealsCache = [
  carDealsCacheName,
  carDealsCacheImagesName,
  carDealsCachePagesName,
];
const carDealsCacheFiles = [
  "https://cdn.jsdelivr.net/npm/pwacompat@2.0.17/pwacompat.min.js",
  "node_modules/localforage/dist/localforage.min.js",
  "js/app.js",
  "js/carPageService.js",
  "js/carService.js",
  "js/clientStorage.js",
  "js/constants.js",
  "js/swRegister.js",
  "js/template.js",
  "/",
  "index.html",
  "styles.css",
];

const latestPath =
  "/pluralsight/courses/progressive-web-apps/service/latest-deals.php";
const imagePath =
  "/pluralsight/courses/progressive-web-apps/service/car-image.php";
const carPath = "/pluralsight/courses/progressive-web-apps/service/car.php";

self.addEventListener("install", (event) => {
  console.log("from SW instal event");
  self.skipWaiting(); // skip waiting default status to activate sw
  const preCache = async () => {
    const cache = await caches.open(carDealsCacheName);
    cache.addAll(carDealsCacheFiles);
  };
  event.waitUntil(preCache());
});

self.addEventListener("activate", (event) => {
  console.log("from SW activate event");
  //good place for cleanupold cache files
  self.clients.claim(); // claim last version of sw available when update page
  const clearCache = async () => {
    const keys = await caches.keys();
    keys.forEach(async (k) => {
      if (carDealsCache.include(k)) {
        return;
      }
      await caches.delete(k);
    });
    event.waitUntil(clearCache());
  };
});

self.addEventListener("fetch", (e) => {
  //   console.log("fetch", e);
  const requestUrl = new URL(e.request.url);
  const requestPath = requestUrl.pathname;
  const fileName = requestPath.substring(requestPath.lastIndexOf("/") + 1);

  if (requestPath === latestPath || fileName === "sw.js") {
    // fetch from network only strategy
    return e.respondWith(fetch(e.request));
  } else if (requestPath === imagePath) {
    // fetch first network then cache offline strategy
    return e.respondWith(networkFirstStrategy(e.request));
  }
  // cache first then network strategy
  return e.respondWith(cacheFirstStrategy(e.request));
});

const cacheFirstStrategy = async (request) => {
  const cacheResponse = await caches.match(request);
  return cacheResponse || fetchRequestAndCache(request);
};

// fetch first network then cache offline strategy
const networkFirstStrategy = async (request) => {
  try {
    return await fetchRequestAndCache(request);
  } catch (e) {
    return await caches.match(request);
  }
};

const fetchRequestAndCache = async (request) => {
  const networkResponse = await fetch(request);
  const clonedResponse = networkResponse.clone();
  const cache = await caches.open(getCacheName(request));
  cache.put(request, networkResponse);
  return clonedResponse;
};

const getCacheName = (request) => {
  const requestUrl = new URL(request.url);
  const requestPath = requestUrl.pathname;

  if (requestPath === imagePath) {
    return carDealsCacheImagesName;
  } else if (requestPath === carPath) {
    return carDealsCachePagesName;
  } else {
    return carDealsCacheName;
  }
};

self.addEventListener("message", (e) => {
  console.log("Sw received message from Client: ", e.source.id, e.data);
  e.source.postMessage({
    clientId: e.source.id,
    message: "hello client, its SW",
  });
});
