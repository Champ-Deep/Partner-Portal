import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // If DB is not configured, return sample data immediately
    if (!process.env.DATABASE_URL) {
      return Response.json(getSampleGeoData());
    }

    // Get real geo activity data from the database
    const geoData = await sql`
      SELECT 
        id,
        country_code,
        region,
        activity_count,
        activity_date
      FROM geo_activity 
      WHERE activity_date >= NOW() - INTERVAL '30 days'
      ORDER BY activity_count DESC
      LIMIT 50
    `;

    // If no real data, return sample data with coordinates
    if (geoData.length === 0) {
      return Response.json(getSampleGeoData());
    }

    // Add coordinates to real data (in a real app, you'd have a geocoding service)
    const enrichedData = geoData.map((item) => ({
      ...item,
      lat: getCoordinatesForRegion(item.country_code, item.region).lat,
      lng: getCoordinatesForRegion(item.country_code, item.region).lng,
    }));

    return Response.json(enrichedData);
  } catch (error) {
    console.error("Error fetching geo activity:", error);
    // As a fallback, still serve sample data so the UI remains functional
    return Response.json(getSampleGeoData());
  }
}

// Helper function to get coordinates (simplified - in production use geocoding API)
function getCoordinatesForRegion(countryCode, region) {
  const coordinates = {
    US: { lat: 39.8283, lng: -98.5795 },
    GB: { lat: 55.3781, lng: -3.436 },
    CA: { lat: 56.1304, lng: -106.3468 },
    AU: { lat: -25.2744, lng: 133.7751 },
    DE: { lat: 51.1657, lng: 10.4515 },
    FR: { lat: 46.2276, lng: 2.2137 },
    JP: { lat: 36.2048, lng: 138.2529 },
    SG: { lat: 1.3521, lng: 103.8198 },
    IN: { lat: 20.5937, lng: 78.9629 },
    BR: { lat: -14.235, lng: -51.9253 },
    NL: { lat: 52.1326, lng: 5.2913 },
    SE: { lat: 60.1282, lng: 18.6435 },
    MX: { lat: 23.6345, lng: -102.5528 },
    ZA: { lat: -30.5595, lng: 22.9375 },
    KR: { lat: 35.9078, lng: 127.7669 },
  };

  return coordinates[countryCode] || { lat: 0, lng: 0 };
}

function getSampleGeoData() {
  return [
    {
      id: 1,
      country_code: "US",
      region: "California",
      activity_count: 2450,
      lat: 37.7749,
      lng: -122.4194,
      activity_date: new Date().toISOString(),
    },
    {
      id: 2,
      country_code: "GB",
      region: "London",
      activity_count: 1850,
      lat: 51.5074,
      lng: -0.1278,
      activity_date: new Date().toISOString(),
    },
    {
      id: 3,
      country_code: "CA",
      region: "Toronto",
      activity_count: 1320,
      lat: 43.6532,
      lng: -79.3832,
      activity_date: new Date().toISOString(),
    },
    {
      id: 4,
      country_code: "AU",
      region: "Sydney",
      activity_count: 980,
      lat: -33.8688,
      lng: 151.2093,
      activity_date: new Date().toISOString(),
    },
    {
      id: 5,
      country_code: "DE",
      region: "Berlin",
      activity_count: 1650,
      lat: 52.52,
      lng: 13.405,
      activity_date: new Date().toISOString(),
    },
    {
      id: 6,
      country_code: "FR",
      region: "Paris",
      activity_count: 1420,
      lat: 48.8566,
      lng: 2.3522,
      activity_date: new Date().toISOString(),
    },
    {
      id: 7,
      country_code: "JP",
      region: "Tokyo",
      activity_count: 2100,
      lat: 35.6762,
      lng: 139.6503,
      activity_date: new Date().toISOString(),
    },
    {
      id: 8,
      country_code: "SG",
      region: "Singapore",
      activity_count: 890,
      lat: 1.3521,
      lng: 103.8198,
      activity_date: new Date().toISOString(),
    },
    {
      id: 9,
      country_code: "IN",
      region: "Mumbai",
      activity_count: 1780,
      lat: 19.076,
      lng: 72.8777,
      activity_date: new Date().toISOString(),
    },
    {
      id: 10,
      country_code: "BR",
      region: "São Paulo",
      activity_count: 1150,
      lat: -23.5505,
      lng: -46.6333,
      activity_date: new Date().toISOString(),
    },
    {
      id: 11,
      country_code: "NL",
      region: "Amsterdam",
      activity_count: 750,
      lat: 52.3676,
      lng: 4.9041,
      activity_date: new Date().toISOString(),
    },
    {
      id: 12,
      country_code: "SE",
      region: "Stockholm",
      activity_count: 650,
      lat: 59.3293,
      lng: 18.0686,
      activity_date: new Date().toISOString(),
    },
    {
      id: 13,
      country_code: "MX",
      region: "Mexico City",
      activity_count: 920,
      lat: 19.4326,
      lng: -99.1332,
      activity_date: new Date().toISOString(),
    },
    {
      id: 14,
      country_code: "ZA",
      region: "Cape Town",
      activity_count: 480,
      lat: -33.9249,
      lng: 18.4241,
      activity_date: new Date().toISOString(),
    },
    {
      id: 15,
      country_code: "KR",
      region: "Seoul",
      activity_count: 1420,
      lat: 37.5665,
      lng: 126.978,
      activity_date: new Date().toISOString(),
    },
  ];
}
