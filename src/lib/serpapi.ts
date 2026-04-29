export interface ExtractedBusiness {
  name: string;
  industry: string;
  city: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  maps_url: string | null;
  email: string | null;
  whatsapp: boolean;
}

interface SerpApiResult {
  title?: string;
  phone?: string;
  website?: string;
  address?: string;
  place_id?: string;
  type?: string;
  types?: string[];
}

function cleanBusinessName(raw: string): string {
  return raw
    .split(/\s*[-–|·•]\s*/)[0]
    .replace(/\(.*?\)/g, '')
    .replace(/,.*$/, '')
    .trim()
    .slice(0, 60);
}

export async function extractBusinesses(
  industry: string,
  city: string,
  maxResults: number = 100
): Promise<ExtractedBusiness[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error('SERPAPI_KEY no está configurada en .env');

  const results: ExtractedBusiness[] = [];
  let start = 0;
  const batchSize = 20;

  while (results.length < maxResults) {
    const params = new URLSearchParams({
      engine: 'google_maps',
      q: `${industry} en ${city}`,
      hl: 'es',
      api_key: apiKey,
      start: String(start),
    });

    const res = await fetch(`https://serpapi.com/search?${params}`);
    if (!res.ok) throw new Error(`SerpApi error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    const places: SerpApiResult[] = data.local_results ?? [];

    if (places.length === 0) break;

    for (const place of places) {
      if (results.length >= maxResults) break;

      const rawName = place.title ?? 'Sin nombre';
      const business: ExtractedBusiness = {
        name: cleanBusinessName(rawName),
        industry: place.type ?? place.types?.[0] ?? industry,
        city,
        phone: place.phone ?? null,
        website: place.website ?? null,
        address: place.address ?? null,
        maps_url: place.place_id
          ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
          : null,
        email: null,
        whatsapp: false,
      };

      if (business.phone) {
        business.whatsapp = isLikelyWhatsApp(business.phone);
      }

      results.push(business);
    }

    start += batchSize;
    if (results.length < maxResults && places.length === batchSize) {
      await sleep(500);
    } else {
      break;
    }
  }

  return results;
}

function isLikelyWhatsApp(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  const latamPrefixes = ['57', '52', '54', '55', '56', '51', '58', '593', '595', '598'];
  return latamPrefixes.some((p) => cleaned.startsWith(p)) || cleaned.length >= 10;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
