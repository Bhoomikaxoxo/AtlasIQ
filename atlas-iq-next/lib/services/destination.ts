// Destination Orchestrator Service for Next.js 15 Backend

import prisma from '../prisma';
import { getCachedData, setCachedData } from './cache';
import {
  geocodePlace,
  reverseGeocode,
  fetchSpotsFromOverpass,
  getCitiesForCountry,
  fetchWikidataImage,
  enrichPlaceWithGoogle,
  enrichPlaceWithFoursquare,
  fetchMapillaryImage,
  fetchWikimediaCommonsImage,
  fetchPexelsImage,
  getCleanCategory,
  getCleanAddress,
  getDeterministicHash,
  getDistanceInMeters,
  getStringSimilarity,
  BoundingBox,
  OverpassElement,
  COUNTRY_CITIES
} from './api';

const CACHE_EXPIRY_DAYS = 7;

const MAPILLARY_SUITABLE_CATEGORIES = new Set(['viewpoint', 'nature', 'historic', 'attraction']);

const CATEGORY_IMAGES: Record<string, string[]> = {
  cafe: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?auto=format&fit=crop&w=600&q=80'
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80'
  ],
  viewpoint: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1433832597046-4f10e10ac764?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80'
  ],
  historic: [
    'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1549880180-2a4b9c7db08d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
  ],
  nature: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1434064511983-18c6dae20ed5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
  ],
  attraction: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513807022359-f104b375975f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
  ]
};

const getQualityScore = (node: OverpassElement): number => {
  let score = 0;
  if (node.tags) {
    score += Object.keys(node.tags).length;
    if (node.tags.website) score += 2;
    if (node.tags.opening_hours) score += 1;
    if (node.tags.phone) score += 1;
    if (node.tags.description) score += 3;
  }
  return score;
};

export const getOrCreateDestination = async (query: string) => {
  const normQuery = query.toLowerCase().trim();

  // 1. Check Redis Cache
  const cachedRedis = await getCachedData(`dest:${normQuery}`);
  if (cachedRedis) {
    console.log(`[Cache] Redis Hit for destination: ${normQuery}`);
    return cachedRedis;
  }

  // 2. Check existing cached destination in Postgres
  const existingDest = await prisma.destination.findUnique({
    where: { query: normQuery },
    include: { places: true }
  });

  if (existingDest) {
    const ageInMs = Date.now() - new Date(existingDest.fetchedAt).getTime();
    const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (ageInMs < expiryMs) {
      const result = {
        destination: existingDest,
        rawCount: existingDest.places.length,
        dedupedCount: existingDest.places.length,
        cities: JSON.parse(existingDest.boundingBox).citiesQueried || [existingDest.displayName.split(',')[0]]
      };
      // Populate Redis in background for future fast reads
      await setCachedData(`dest:${normQuery}`, result);
      return result;
    }
  }

  // 2. Geocode
  const location = await geocodePlace(query);
  const latDelta = Math.abs(location.boundingBox.latMax - location.boundingBox.latMin);
  const lngDelta = Math.abs(location.boundingBox.lngMax - location.boundingBox.lngMin);
  const sourcePlaceName = location.displayName.split(',')[0];

  let rawNodes: OverpassElement[] = [];
  let citiesQueriedList: string[] = [];
  let overpassQueryStr = '';

  // 3. Split query by cities if country-sized
  if (latDelta > 2.0 || lngDelta > 2.0) {
    const citiesData = await getCitiesForCountry(query, 15);
    let citiesToQuery = citiesData.map(c => c.display_name.split(',')[0]);

    if (citiesToQuery.length === 0) {
      const matchedCountry = Object.keys(COUNTRY_CITIES).find(c => normQuery.includes(c));
      citiesToQuery = matchedCountry ? COUNTRY_CITIES[matchedCountry] : [];
    }

    if (citiesToQuery.length > 0) {
      citiesQueriedList = citiesToQuery;
      const promises = citiesToQuery.map(async (city) => {
        try {
          const cityLoc = await geocodePlace(`${city}, ${query}`);
          const result = await fetchSpotsFromOverpass(cityLoc.boundingBox, cityLoc.lat, cityLoc.lng);
          if (!overpassQueryStr) overpassQueryStr = result.queryStr;
          return result.elements.map(node => ({ ...node, cityName: city }));
        } catch (err) {
          console.error(`Failed to fetch spots for city ${city}:`, err);
          return [];
        }
      });
      const results = await Promise.all(promises);
      rawNodes = results.flat();
    } else {
      try {
        const capitalLoc = await geocodePlace(`Capital of ${query}`);
        citiesQueriedList = [`Capital: ${capitalLoc.displayName.split(',')[0]}`];
        const result = await fetchSpotsFromOverpass(capitalLoc.boundingBox, capitalLoc.lat, capitalLoc.lng);
        rawNodes = result.elements;
        overpassQueryStr = result.queryStr;
      } catch {
        citiesQueriedList = ['Country Center'];
        const result = await fetchSpotsFromOverpass(location.boundingBox, location.lat, location.lng);
        rawNodes = result.elements;
        overpassQueryStr = result.queryStr;
      }
    }
  } else {
    citiesQueriedList = [sourcePlaceName];
    const result = await fetchSpotsFromOverpass(location.boundingBox, location.lat, location.lng);
    rawNodes = result.elements;
    overpassQueryStr = result.queryStr;
  }

  // 4. Deduplicate by name + proximity
  const validNodes = rawNodes.filter(node => node.tags && node.tags.name);
  const uniqueNodes: OverpassElement[] = [];

  for (const node of validNodes) {
    if (!node.tags?.name) continue;
    const isDuplicate = uniqueNodes.some(existing => {
      if (existing.tags?.name?.toLowerCase().trim() === node.tags?.name?.toLowerCase().trim()) {
        const dist = getDistanceInMeters(existing.lat, existing.lon, node.lat, node.lon);
        return dist < 50;
      }
      return false;
    });
    if (!isDuplicate) {
      uniqueNodes.push(node);
    }
  }

  uniqueNodes.sort((a, b) => getQualityScore(b) - getQualityScore(a));

  // 5. Store in Database
  const serializedBbox = JSON.stringify({
    ...location.boundingBox,
    citiesQueried: citiesQueriedList,
    overpassQuery: overpassQueryStr
  });

  const upsertedDest = await prisma.destination.upsert({
    where: { query: normQuery },
    create: {
      query: normQuery,
      displayName: location.displayName,
      boundingBox: serializedBbox,
      lat: location.lat,
      lng: location.lng
    },
    update: {
      displayName: location.displayName,
      boundingBox: serializedBbox,
      lat: location.lat,
      lng: location.lng,
      fetchedAt: new Date()
    }
  });

  // Bulk create/upsert raw places
  const placeUpserts = uniqueNodes.map(async (node, index) => {
    const placeId = node.id.toString();
    const category = getCleanCategory(node.tags);
    const score = getQualityScore(node);
    const name = node.tags?.name || 'Unnamed Spot';

    return prisma.place.upsert({
      where: { id: placeId },
      create: {
        id: placeId,
        name,
        category,
        lat: node.lat,
        lng: node.lon,
        address: getCleanAddress(node.tags, node.cityName || sourcePlaceName),
        photoUrl: '', // Will be enriched progressively
        photoSource: 'generic',
        photoIsGeneric: true,
        classification: 'unrated',
        isHidden: false,
        sourcePlace: node.cityName || sourcePlaceName,
        qualityScore: score,
        isEnriched: false,
        tags: node.tags as any,
        destinations: {
          connect: { id: upsertedDest.id }
        }
      },
      update: {
        qualityScore: score,
        destinations: {
          connect: { id: upsertedDest.id }
        }
      }
    });
  });

  await Promise.all(placeUpserts);

  const result = {
    destination: upsertedDest,
    rawCount: validNodes.length,
    dedupedCount: uniqueNodes.length,
    cities: citiesQueriedList
  };

  await setCachedData(`dest:${normQuery}`, result);

  return result;
};

export const getPaginatedSpots = async (query: string, page = 1, pageSize = 40) => {
  const normQuery = query.toLowerCase().trim();

  // Ensure destination exists
  const destInfo = await getOrCreateDestination(query);

  const startIndex = (page - 1) * pageSize;

  // Retrieve paginated spots linked to this destination ordered by quality score
  const places = await prisma.place.findMany({
    where: {
      destinations: {
        some: { query: normQuery }
      }
    },
    orderBy: {
      qualityScore: 'desc'
    },
    skip: startIndex,
    take: pageSize
  });

  const totalCount = await prisma.place.count({
    where: {
      destinations: {
        some: { query: normQuery }
      }
    }
  });

  // Progressive enrichment
  const enrichedPlaces = await Promise.all(
    places.map(async (place, idx) => {
      if (place.isEnriched) return place;

      const placeId = place.id;
      const tags = place.tags as Record<string, string | undefined> || {};
      const hash = getDeterministicHash(placeId);
      const category = place.category;

      let rating: number | null = null;
      let userRatingsTotal: number | null = null;
      let priceLevel: number | null = 1;
      let photoUrl: string | null = null;
      let photoSource = 'generic';
      let matchDistance: number | null = null;
      let nameSimilarity: number | null = null;

      // Priority 1: Wikidata P18 image
      if (tags && tags.wikidata) {
        const wikiPhoto = await fetchWikidataImage(tags.wikidata);
        if (wikiPhoto) {
          photoUrl = wikiPhoto;
          photoSource = 'wikidata';
          matchDistance = 0;
          nameSimilarity = 1.0;
        }
      }

      // Priority 2: Google Places Nearby Search
      if (!photoUrl) {
        const googleData = await enrichPlaceWithGoogle(place.name, place.lat, place.lng);
        if (googleData) {
          rating = googleData.rating;
          userRatingsTotal = googleData.userRatingsTotal;
          priceLevel = googleData.priceLevel;
          photoUrl = googleData.photoUrl;
          if (photoUrl) {
            photoSource = 'google';
            matchDistance = googleData.distanceMeters;
            nameSimilarity = googleData.nameSimilarity;
          }
        }
      }

      // Priority 3: Foursquare lookup
      if (!photoUrl) {
        const fsqData = await enrichPlaceWithFoursquare(place.name, place.lat, place.lng);
        if (fsqData) {
          rating = fsqData.rating;
          userRatingsTotal = fsqData.userRatingsTotal;
          photoUrl = fsqData.photoUrl;
          photoSource = 'foursquare';
          matchDistance = fsqData.distanceMeters;
          nameSimilarity = fsqData.nameSimilarity;
        }
      }

      // Priority 4: Wikimedia Commons Search
      if (!photoUrl) {
        const commonsPhoto = await fetchWikimediaCommonsImage(place.lat, place.lng);
        if (commonsPhoto) {
          photoUrl = commonsPhoto;
          photoSource = 'wikimedia_search';
          matchDistance = 0;
          nameSimilarity = 1.05; // Treat exact text matches on Wiki Commons highly
        }
      }

      // Priority 5: Pexels API (Dynamic contextual stock photos)
      if (!photoUrl) {
        const queryTerm = `${category} ${place.sourcePlace || ''}`.trim();
        const pexelsPhoto = await fetchPexelsImage(queryTerm);
        if (pexelsPhoto) {
          photoUrl = pexelsPhoto;
          photoSource = 'pexels';
          matchDistance = 0;
          nameSimilarity = 1.0;
        }
      }

      // Priority 6: Generic stock fallback
      if (!photoUrl) {
        const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.attraction;
        const imageIndex = (hash + idx) % images.length;
        photoUrl = images[imageIndex];
        photoSource = 'generic';
      }

      // Reverse geocode if no Google match to enrich the address
      let address = place.address;
      if (photoSource === 'generic' || photoSource === 'pexels') {
        const revGeo = await reverseGeocode(place.lat, place.lng);
        if (revGeo) {
          address = revGeo;
        }
      }

      // Classification
      const HIDDEN_GEM_THRESHOLD = 50;
      let classification = 'unrated';
      if (userRatingsTotal != null) {
        classification = userRatingsTotal < HIDDEN_GEM_THRESHOLD ? 'hidden' : 'popular';
      }
      const isHidden = classification === 'hidden';

      // Update place in database
      const updatedPlace = await prisma.place.update({
        where: { id: placeId },
        data: {
          photoUrl: photoUrl || '',
          photoSource,
          photoIsGeneric: photoSource === 'generic',
          rating,
          userRatingsTotal,
          priceLevel,
          matchDistance,
          nameSimilarity,
          classification,
          isHidden,
          address,
          isEnriched: true
        }
      });

      return updatedPlace;
    })
  );

  const hasMore = startIndex + pageSize < totalCount;
  const decodedBbox = JSON.parse(destInfo.destination.boundingBox);

  return {
    spots: enrichedPlaces,
    hasMore,
    location: {
      displayName: destInfo.destination.displayName,
      lat: destInfo.destination.lat,
      lng: destInfo.destination.lng,
      boundingBox: {
        latMin: decodedBbox.latMin,
        latMax: decodedBbox.latMax,
        lngMin: decodedBbox.lngMin,
        lngMax: decodedBbox.lngMax
      }
    },
    debugInfo: {
      citiesQueried: destInfo.cities,
      rawOsmCount: destInfo.rawCount,
      dedupedOsmCount: destInfo.dedupedCount,
      overpassQuery: decodedBbox.overpassQuery || ''
    }
  };
};
