// Pure TS Service API Helpers for Atlas IQ

export interface BoundingBox {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
  boundingBox: BoundingBox;
}

export interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    amenity?: string;
    tourism?: string;
    historic?: string;
    natural?: string;
    leisure?: string;
    shop?: string;
    website?: string;
    opening_hours?: string;
    phone?: string;
    description?: string;
    wikidata?: string;
    [key: string]: string | undefined;
  };
  cityName?: string;
}

export interface EnrichedPlaceData {
  rating: number | null;
  userRatingsTotal: number | null;
  priceLevel: number | null;
  photoUrl: string | null;
  distanceMeters: number | null;
  nameSimilarity: number | null;
}

// Curated static cities per country fallback
export const COUNTRY_CITIES: Record<string, string[]> = {
  india: ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Udaipur', 'Kochi', 'Agra', 'Varanasi', 'Amritsar'],
  usa: ['New York City', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami', 'Seattle', 'Boston', 'Austin', 'Denver', 'Las Vegas', 'New Orleans', 'Honolulu', 'Washington DC', 'San Diego', 'Portland'],
  'united states': ['New York City', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami', 'Seattle', 'Boston', 'Austin', 'Denver', 'Las Vegas', 'New Orleans', 'Honolulu', 'Washington DC', 'San Diego', 'Portland'],
  portugal: ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Funchal', 'Sintra', 'Cascais', 'Lagos', 'Evora'],
  italy: ['Rome', 'Milan', 'Florence', 'Venice', 'Naples', 'Turin', 'Bologna', 'Palermo', 'Genoa', 'Pisa', 'Siena', 'Verona', 'Amalfi', 'Positano', 'Como'],
  spain: ['Madrid', 'Barcelona', 'Seville', 'Valencia', 'Malaga', 'Granada', 'Bilbao', 'Ibiza', 'Mallorca', 'San Sebastian', 'Zaragoza', 'Santiago de Compostela'],
  france: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Cannes', 'Chamonix'],
  japan: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Sapporo', 'Fukuoka', 'Hiroshima', 'Nagoya', 'Nara', 'Okinawa', 'Kobe', 'Kanazawa', 'Hakone'],
  indonesia: ['Jakarta', 'Canggu', 'Ubud', 'Seminyak', 'Kuta', 'Sanur', 'Nusa Dua', 'Yogyakarta', 'Bandung', 'Surabaya', 'Medan', 'Makassar'],
  uk: ['London', 'Edinburgh', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol', 'Leeds', 'Newcastle', 'Belfast', 'Bath', 'Oxford', 'Cambridge'],
  'united kingdom': ['London', 'Edinburgh', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol', 'Leeds', 'Newcastle', 'Belfast', 'Bath', 'Oxford', 'Cambridge'],
  germany: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Dusseldorf', 'Stuttgart', 'Leipzig', 'Dresden', 'Nuremberg', 'Heidelberg', 'Bremen'],
  australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Cairns', 'Hobart', 'Canberra', 'Darwin'],
  canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Quebec City', 'Winnipeg', 'Halifax', 'Victoria'],
  brazil: ['Rio de Janeiro', 'Sao Paulo', 'Salvador', 'Brasilia', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
  mexico: ['Mexico City', 'Cancun', 'Guadalajara', 'Monterrey', 'Oaxaca', 'Merida', 'Cabo San Lucas', 'Puerto Vallarta', 'Puebla', 'Tulum'],
  greece: ['Athens', 'Santorini', 'Mykonos', 'Thessaloniki', 'Corfu', 'Rhodes', 'Chania', 'Heraklion', 'Zakynthos', 'Naxos'],
  thailand: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Koh Samui', 'Krabi', 'Hua Hin', 'Ayutthaya', 'Chiang Rai', 'Pai'],
  vietnam: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hoi An', 'Nha Trang', 'Hue', 'Ha Long Bay', 'Sapa', 'Phu Quoc', 'Da Lat']
};

export const getDeterministicHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getStringSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  // Substring check
  if (s1.includes(s2) || s2.includes(s1)) {
    const lenRatio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
    if (lenRatio > 0.4) return 0.85;
  }

  // Token Jaccard Check
  const words1 = s1.split(/[^a-z0-9]+/);
  const words2 = s2.split(/[^a-z0-9]+/);
  const intersection = words1.filter((w) => w.length > 2 && words2.includes(w));

  if (intersection.length > 0) {
    return intersection.length / Math.min(words1.length, words2.length);
  }

  return 0.0;
};

export const getMatchConfidence = (distanceMeters: number, nameSimilarity: number): number => {
  // Distance score: 1.0 at 0m, decaying linearly to 0 at 100m
  const distanceScore = Math.max(0, 1 - distanceMeters / 100);
  // Weight distance more heavily than name similarity —
  // proximity is more reliable than string matching for informal OSM names
  return distanceScore * 0.6 + nameSimilarity * 0.4;
};

// Minimum confidence to accept a candidate as a real match
export const MATCH_CONFIDENCE_THRESHOLD = 0.45;

export const getCleanCategory = (tags?: Record<string, string | undefined>): string => {
  if (!tags) return 'attraction';
  if (tags.amenity === 'cafe' || tags.amenity === 'ice_cream') return 'cafe';
  if (
    tags.amenity === 'restaurant' ||
    tags.amenity === 'fast_food' ||
    tags.amenity === 'pub' ||
    tags.amenity === 'bar'
  )
    return 'restaurant';
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.historic || tags.tourism === 'museum') return 'historic';
  if (tags.natural === 'waterfall' || tags.natural === 'peak' || tags.natural === 'beach')
    return 'nature';
  return 'attraction';
};

export const getCleanAddress = (
  tags?: Record<string, string | undefined>,
  fallbackName = 'Unknown Area'
): string => {
  if (!tags) return `Near ${fallbackName}`;
  const parts: string[] = [];
  if (tags['addr:street']) {
    parts.push(`${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim());
  }
  if (tags['addr:suburb'] || tags['addr:neighbourhood']) {
    parts.push((tags['addr:suburb'] || tags['addr:neighbourhood'])!);
  }
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:country']) parts.push(tags['addr:country']);

  return parts.length > 0 ? parts.join(', ') : `Near ${fallbackName}`;
};

// Nominatim Reverse Geocoding API
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AtlasIQ/1.0 (contact@yourdomain.com)'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      const parts: string[] = [];
      if (addr.road) parts.push(addr.road);
      if (addr.suburb || addr.neighbourhood || addr.village || addr.town) {
        parts.push(addr.suburb || addr.neighbourhood || addr.village || addr.town);
      }
      if (addr.city || addr.county) parts.push(addr.city || addr.county);
      if (addr.state) parts.push(addr.state);
      return parts.join(', ');
    }
    return data.display_name || null;
  } catch (err) {
    console.error('Error in reverse geocoding:', err);
    return null;
  }
};

// Nominatim Geocoding API
export const geocodePlace = async (query: string): Promise<GeocodeResult> => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'AtlasIQ/1.0 (contact@yourdomain.com)'
    }
  });
  if (!response.ok) throw new Error('Geocoding service unavailable');

  const data = await response.json();
  if (data.length === 0) throw new Error('Destination not found');

  const result = data[0];
  const bbox = result.boundingbox.map(Number); // [lat_min, lat_max, lon_min, lon_max]

  return {
    displayName: result.display_name,
    lat: Number(result.lat),
    lng: Number(result.lon),
    boundingBox: {
      latMin: bbox[0],
      latMax: bbox[1],
      lngMin: bbox[2],
      lngMax: bbox[3]
    }
  };
};

// Fetch cities in country from Nominatim
export async function getCitiesForCountry(countryQuery: string, limit = 20): Promise<any[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(countryQuery)}&format=json&featuretype=city&limit=${limit}`,
      { headers: { 'User-Agent': 'AtlasIQ/1.0 (contact@yourdomain.com)' } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Overpass API discover spots within bounding box
export const fetchSpotsFromOverpass = async (
  bbox: BoundingBox,
  centerLat: number,
  centerLng: number
): Promise<{ elements: OverpassElement[]; queryStr: string }> => {
  let latMin = bbox.latMin;
  let latMax = bbox.latMax;
  let lngMin = bbox.lngMin;
  let lngMax = bbox.lngMax;

  const latDelta = Math.abs(latMax - latMin);
  const lngDelta = Math.abs(lngMax - lngMin);

  if (latDelta > 0.4 || lngDelta > 0.4) {
    // Clamp to city center size
    latMin = centerLat - 0.12;
    latMax = centerLat + 0.12;
    lngMin = centerLng - 0.12;
    lngMax = centerLng + 0.12;
  }

  const query = `[out:json][timeout:25];
(
  nwr["amenity"~"cafe|restaurant|bar|fast_food|ice_cream"](${latMin},${lngMin},${latMax},${lngMax});
  nwr["tourism"~"attraction|viewpoint|museum|gallery|artwork|zoo|hotel|theme_park"](${latMin},${lngMin},${latMax},${lngMax});
  nwr["historic"](${latMin},${lngMin},${latMax},${lngMax});
  nwr["natural"~"waterfall|peak|beach|cave_entrance"](${latMin},${lngMin},${latMax},${lngMax});
  nwr["leisure"~"park|garden|nature_reserve"](${latMin},${lngMin},${latMax},${lngMax});
  nwr["shop"~"bakery|art|gift"](${latMin},${lngMin},${latMax},${lngMax});
);
out center;`;

  const url = 'https://overpass-api.de/api/interpreter';
  const response = await fetch(url, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'AtlasIQ/1.0 (contact@yourdomain.com)'
    }
  });

  if (!response.ok) throw new Error('Overpass OSM query failed');

  const data = await response.json();
  const elements = data.elements || [];

  const parsedElements = elements
    .map((el: any) => ({
      ...el,
      lat: el.lat || (el.center && el.center.lat),
      lon: el.lon || (el.center && el.center.lon)
    }))
    .filter((el: any) => el.lat != null && el.lon != null);

  return {
    elements: parsedElements,
    queryStr: query
  };
};

// Fetch Wikidata image
export const fetchWikidataImage = async (wikidataId?: string): Promise<string | null> => {
  if (!wikidataId) return null;
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${encodeURIComponent(wikidataId)}&property=P18&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const claim = data.claims && data.claims.P18 && data.claims.P18[0];
    const filename =
      claim && claim.mainsnak && claim.mainsnak.datavalue && claim.mainsnak.datavalue.value;
    if (filename) {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=800`;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching Wikidata image for ${wikidataId}:`, err);
    return null;
  }
};

// Fetch image from Wikimedia Commons using text search
export const fetchWikimediaCommonsImage = async (name: string): Promise<string | null> => {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=filetype:bitmap%20${encodeURIComponent(name)}&gsrlimit=1&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    
    const pageId = Object.keys(pages)[0];
    const imageInfo = pages[pageId]?.imageinfo?.[0];
    if (imageInfo?.url) {
      return imageInfo.url;
    }
    return null;
  } catch (err) {
    console.error(`Error in Wikimedia Commons search for "${name}":`, err);
    return null;
  }
};

// Mapillary image lookup
export const fetchMapillaryImage = async (lat: number, lng: number): Promise<string | null> => {
  const token = process.env.MAPILLARY_ACCESS_TOKEN || '';
  if (!token) return null;

  try {
    const delta = 0.0005;
    const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
    const url = `https://graph.mapillary.com/images?access_token=${token}&fields=id,thumb_1024_url&bbox=${bbox}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const img = data.data && data.data[0];
    if (img && img.thumb_1024_url) {
      return img.thumb_1024_url;
    }
    return null;
  } catch (err) {
    console.error('Error fetching Mapillary image:', err);
    return null;
  }
};

// Foursquare Places API lookup
export const enrichPlaceWithFoursquare = async (
  name: string,
  lat: number,
  lng: number
): Promise<EnrichedPlaceData | null> => {
  const key = process.env.FOURSQUARE_API_KEY || '';
  if (!key) return null;

  try {
    const searchUrl = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&query=${encodeURIComponent(name)}&radius=150&limit=5`;
    const res = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': key
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const venues = data.results || [];
    if (venues.length === 0) return null;

    // Score all candidates, keep the best
    const scored = venues.map((venue: any) => {
      const distance = getDistanceInMeters(lat, lng, venue.geocodes.main.latitude, venue.geocodes.main.longitude);
      const similarity = getStringSimilarity(name, venue.name);
      const confidence = getMatchConfidence(distance, similarity);
      return { venue, distance, similarity, confidence };
    });

    scored.sort((a: any, b: any) => b.confidence - a.confidence);
    const best = scored[0];

    console.warn(
      `[Foursquare Match] "${name}" -> "${best.venue.name}" ` +
      `(dist: ${Math.round(best.distance)}m, sim: ${best.similarity.toFixed(2)}, confidence: ${best.confidence.toFixed(2)})`
    );

    if (best.confidence < MATCH_CONFIDENCE_THRESHOLD) {
      return null;
    }

    const photoUrl = `https://api.foursquare.com/v3/places/${best.venue.fsq_id}/photos?limit=1`;
    const photoRes = await fetch(photoUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': key
      }
    });
    if (!photoRes.ok) return null;
    const photos = await photoRes.json();
    const photo = photos && photos[0];
    if (photo) {
      return {
        photoUrl: `${photo.prefix}800x600${photo.suffix}`,
        distanceMeters: best.distance,
        nameSimilarity: best.similarity,
        rating: best.venue.rating ? best.venue.rating / 2.0 : null,
        userRatingsTotal: best.venue.stats?.ratings_count || null,
        priceLevel: null
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching Foursquare photo:', err);
    return null;
  }
};

// Google Places Nearby Search
export const enrichPlaceWithGoogle = async (
  name: string,
  lat: number,
  lng: number
): Promise<EnrichedPlaceData | null> => {
  const key = process.env.GOOGLE_PLACES_API_KEY || '';
  if (!key) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&keyword=${encodeURIComponent(name)}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK' || !data.results || data.results.length === 0) return null;

    // Score top 5 candidates, keep the best
    const candidates = data.results.slice(0, 5);
    const scored = candidates.map((candidate: any) => {
      const candidateLat = candidate.geometry.location.lat;
      const candidateLng = candidate.geometry.location.lng;
      const distanceMeters = getDistanceInMeters(lat, lng, candidateLat, candidateLng);
      const nameSimilarity = getStringSimilarity(name, candidate.name);
      const confidence = getMatchConfidence(distanceMeters, nameSimilarity);
      return { candidate, distanceMeters, nameSimilarity, confidence };
    });

    scored.sort((a: any, b: any) => b.confidence - a.confidence);
    const best = scored[0];

    console.warn(
      `[Google Places Match] "${name}" -> "${best.candidate.name}" ` +
      `(dist: ${Math.round(best.distanceMeters)}m, sim: ${best.nameSimilarity.toFixed(2)}, confidence: ${best.confidence.toFixed(2)})`
    );

    if (best.confidence < MATCH_CONFIDENCE_THRESHOLD) {
      return null;
    }

    const photoRef = best.candidate.photos && best.candidate.photos[0]
      ? best.candidate.photos[0].photo_reference
      : null;
    const photoUrl = photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${key}`
      : null;

    return {
      rating: best.candidate.rating || null,
      userRatingsTotal: best.candidate.user_ratings_total || null,
      priceLevel: best.candidate.price_level || 1,
      photoUrl,
      distanceMeters: best.distanceMeters,
      nameSimilarity: best.nameSimilarity
    };
  } catch (err) {
    console.error('Error enriching place with Google:', err);
    return null;
  }
};
