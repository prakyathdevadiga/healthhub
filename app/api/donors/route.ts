
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

const RADIUS_METERS = 25_000;
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

type Coordinates = {
  latitude: number;
  longitude: number;
};

async function geocodePlace(place: string): Promise<Coordinates | null> {
  const query = `${place}, Karnataka, India`;

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "HealthHubHealthcareApp/1.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Location search service is unavailable.");
  }

  const results = await response.json();

  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function calculateDistanceKm(
  a: Coordinates,
  b: Coordinates
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  return (
    6371 *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

/* REGISTER DONOR */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      bloodGroup,
      city,
      phone,
      available,
      firebaseUid,
    } = body;

    if (
      !name?.trim() ||
      !bloodGroup?.trim() ||
      !city?.trim() ||
      !phone?.trim()
    ) {
      return NextResponse.json(
        { message: "Please fill all required fields." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("healthhub");
    const donors = db.collection("donors");

    if (email) {
      const existingDonor = await donors.findOne({ email });

      if (existingDonor) {
        return NextResponse.json(
          { message: "You are already registered as a donor." },
          { status: 409 }
        );
      }
    }

    // Convert the donor's entered area into coordinates.
    // Registration still succeeds if geocoding cannot find the place.
    let location = undefined;

    try {
      const coordinates = await geocodePlace(city.trim());

      if (coordinates) {
        location = {
          type: "Point",
          coordinates: [
            coordinates.longitude,
            coordinates.latitude,
          ],
        };
      }
    } catch (error) {
      console.error("Donor geocoding failed:", error);
    }

    const donor = {
      name: name.trim(),
      email: email || null,
      firebaseUid: firebaseUid || null,
      bloodGroup: bloodGroup.trim().toUpperCase(),
      city: city.trim(),
      phone: phone.trim(),
      available: available ?? true,
      ...(location ? { location } : {}),
      createdAt: new Date(),
    };

    const result = await donors.insertOne(donor);

    return NextResponse.json(
      {
        message: "Donor registered successfully!",
        donor: { ...donor, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("DONOR REGISTRATION ERROR:", error);

    return NextResponse.json(
      { message: "Failed to register donor." },
      { status: 500 }
    );
  }
}

/* SEARCH DONORS */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const bloodGroup = searchParams.get("bloodGroup")?.trim();
    const city = searchParams.get("city")?.trim();

    const client = await clientPromise;
    const db = client.db("healthhub");
    const donors = db.collection("donors");

    const baseFilter: Record<string, unknown> = {
      available: true,
    };

    if (bloodGroup) {
      baseFilter.bloodGroup = bloodGroup.toUpperCase();
    }

    // No location search: preserve the normal donor-list behavior.
    if (!city) {
      const results = await donors
        .find(baseFilter)
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json(results);
    }

    const center = await geocodePlace(city);

    if (!center) {
      return NextResponse.json(
        { message: "We couldn't find that location. Try another place." },
        { status: 400 }
      );
    }

    // Exact city matches include legacy donors without coordinates.
    const exactFilter = {
      ...baseFilter,
      city: {
        $regex: `^${escapeRegex(city)}$`,
        $options: "i",
      },
    };

    const exactDonors = await donors
      .find(exactFilter)
      .toArray();

    // Create the geospatial index. Documents without a location
    // are allowed to remain in the collection.
    await donors.createIndex({ location: "2dsphere" });

    // Find geocoded donors within 25 km, applying the same
    // availability and blood-group filters.
    const nearbyDonors = await donors
      .find({
        ...baseFilter,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [center.longitude, center.latitude],
            },
            $maxDistance: RADIUS_METERS,
          },
        },
      })
      .toArray();

    const combined = new Map<string, Record<string, any>>();

    for (const donor of [...exactDonors, ...nearbyDonors]) {
      const id = donor._id.toString();

      const isExactLocation =
        donor.city?.trim().toLowerCase() === city.toLowerCase();

      let distanceKm: number | null = null;

      if (
        donor.location?.type === "Point" &&
        Array.isArray(donor.location.coordinates)
      ) {
        distanceKm = calculateDistanceKm(center, {
          longitude: donor.location.coordinates[0],
          latitude: donor.location.coordinates[1],
        });
      }

      combined.set(id, {
        ...donor,
        isExactLocation,
        distanceKm:
          distanceKm === null ? null : Number(distanceKm.toFixed(1)),
      });
    }

    // Exact location matches first, then nearest donors.
    const results = Array.from(combined.values()).sort((a, b) => {
      if (a.isExactLocation !== b.isExactLocation) {
        return a.isExactLocation ? -1 : 1;
      }

      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;

      return a.distanceKm - b.distanceKm;
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("DONOR SEARCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to search donors." },
      { status: 500 }
    );
  }
}
