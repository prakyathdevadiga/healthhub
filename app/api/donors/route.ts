import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Received donor data:", body);

    const {
      name,
      email,
      bloodGroup,
      city,
      phone,
      available,
    } = body;

    // Check required fields
    if (!name || !bloodGroup || !city || !phone) {
      return NextResponse.json(
        {
          message: "Please fill all required fields.",
        },
        { status: 400 }
      );
    }

    // Email is optional for now
    const client = await clientPromise;

    const db = client.db("healthhub");

    const donors = db.collection("donors");

    // Check duplicate only if email exists
    if (email) {
      const existingDonor = await donors.findOne({ email });

      if (existingDonor) {
        return NextResponse.json(
          {
            message: "You are already registered as a donor.",
          },
          { status: 409 }
        );
      }
    }

    const donor = {
      name,
      email: email || null,
      bloodGroup,
      city,
      phone,
      available: available ?? true,
      createdAt: new Date(),
    };

    const result = await donors.insertOne(donor);

    console.log("Donor inserted:", result.insertedId);

    return NextResponse.json(
      {
        message: "Donor registered successfully!",
        donor: {
          ...donor,
          _id: result.insertedId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("DONOR REGISTRATION ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to register donor.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const bloodGroup = searchParams.get("bloodGroup");
    const city = searchParams.get("city");

    const client = await clientPromise;

    const db = client.db("healthhub");

    const donors = db.collection("donors");

    const filter: Record<string, string | boolean> = {
      available: true,
    };

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    if (city) {
      filter.city = city;
    }

    const results = await donors
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(results);
  } catch (error) {
    console.error("DONOR SEARCH ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to search donors.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}