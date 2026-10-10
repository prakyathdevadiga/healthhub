
import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/search";

export async function GET(request: NextRequest) {
  try {
    const input = request.nextUrl.searchParams.get("q")?.trim();

    if (!input || input.length < 2 || input.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter a city, area or six-digit PIN code.",
          locations: [],
        },
        { status: 400 }
      );
    }

    const isPinCode = /^\d{6}$/.test(input);

    // Reject other numeric-only inputs instead of treating them as places.
    if (/^\d+$/.test(input) && !isPinCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Indian PIN codes must contain exactly 6 digits.",
          locations: [],
        },
        { status: 400 }
      );
    }

    const url = new URL(NOMINATIM_URL);

    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "in");
    url.searchParams.set("addressdetails", "1");

    if (isPinCode) {
      url.searchParams.set("postalcode", input);
      url.searchParams.set("country", "India");
    } else {
      url.searchParams.set("q", `${input}, India`);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "HealthHub/1.0 (hospital locator)",
        "Accept-Language": "en",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error("Nominatim response:", response.status);

      return NextResponse.json(
        {
          success: false,
          error:
            "Location search is temporarily unavailable. Please try again later.",
          locations: [],
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const locations = Array.isArray(data)
      ? data
          .filter(
            (item: any) =>
              Number.isFinite(Number(item.lat)) &&
              Number.isFinite(Number(item.lon))
          )
          .map((item: any) => ({
            name: item.display_name,
            latitude: Number(item.lat),
            longitude: Number(item.lon),
          }))
      : [];

    if (locations.length === 0) {
      return NextResponse.json({
        success: false,
        error:
          "Location not found. Check the PIN code or try a more specific city or area.",
        locations: [],
      });
    }

    return NextResponse.json({
      success: true,
      locations,
      attribution: "© OpenStreetMap contributors",
    });
  } catch (error) {
    console.error("Geocoding API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to search for this location. Please try again.",
        locations: [],
      },
      {
        status:
          error instanceof Error &&
          error.name === "TimeoutError"
            ? 504
            : 500,
      }
    );
  }
}
