
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const radians = (n: number) => (n * Math.PI) / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) *
      Math.cos(radians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return Number(
    (
      6371 *
      2 *
      Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    ).toFixed(1)
  );
}

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();

    const lat = Number(latitude);
    const lon = Number(longitude);
    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid location coordinates are required.",
          hospitals: [],
        },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEOAPIFY_API_KEY is missing from .env.local.",
          hospitals: [],
        },
        { status: 500 }
      );
    }

    const url = new URL("https://api.geoapify.com/v2/places");

    url.searchParams.set("categories", "healthcare.hospital");
    url.searchParams.set("filter", `circle:${lon},${lat},10000`);
    url.searchParams.set("bias", `proximity:${lon},${lat}`);
    url.searchParams.set("limit", "20");
    url.searchParams.set("apiKey", apiKey);

    const response = await fetch(url.toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Geoapify error:", response.status, details);

      return NextResponse.json(
        {
          success: false,
          error:
            response.status === 401 || response.status === 403
              ? "Geoapify API key is invalid or not authorized. Check your key."
              : response.status === 429
                ? "Geoapify usage limit reached. Please try again later."
                : "Hospital search is temporarily unavailable.",
          hospitals: [],
        },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const data = await response.json();
    const features = Array.isArray(data.features)
      ? data.features
      : [];

    const hospitals = features
      .map((feature: any) => {
        const properties = feature.properties || {};
        const coordinates = feature.geometry?.coordinates;

        if (
          !Array.isArray(coordinates) ||
          coordinates.length < 2
        ) {
          return null;
        }

        const hospitalLon = Number(coordinates[0]);
        const hospitalLat = Number(coordinates[1]);

        if (
          !Number.isFinite(hospitalLat) ||
          !Number.isFinite(hospitalLon)
        ) {
          return null;
        }

        const categories: string[] = Array.isArray(properties.categories)
          ? properties.categories
          : [];

        const emergency =
          properties.emergency === "yes"
            ? true
            : properties.emergency === "no"
              ? false
              : null;

        return {
          id:
            String(properties.place_id || "") ||
            `${hospitalLat}-${hospitalLon}`,
          name: properties.name || "Unnamed hospital",
          latitude: hospitalLat,
          longitude: hospitalLon,
          distance: calculateDistance(
            lat,
            lon,
            hospitalLat,
            hospitalLon
          ),
          address:
            properties.formatted ||
            properties.address_line2 ||
            properties.address_line1 ||
            "Address not available",
          phone:
            properties.datasource?.raw?.phone ||
            properties.datasource?.raw?.["contact:phone"] ||
            "",
          website:
            properties.datasource?.raw?.website ||
            "",
          emergency,
        };
      })
      .filter((hospital: any) => hospital !== null)
      .sort((a: any, b: any) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      count: hospitals.length,
      radiusKm: 10,
      hospitals,
      attribution: "Powered by Geoapify; © OpenStreetMap contributors",
    });
  } catch (error) {
    console.error("Hospital API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error &&
          error.name === "TimeoutError"
            ? "Hospital search timed out. Please try again."
            : "Unable to find hospitals right now. Please try again.",
        hospitals: [],
      },
      { status: 502 }
    );
  }
}
