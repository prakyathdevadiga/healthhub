import { NextRequest, NextResponse } from "next/server";

const FDA_API_URL = "https://api.fda.gov/drug/label.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const medicineName = searchParams.get("name");

    // -----------------------------
    // Validate search input
    // -----------------------------
    if (!medicineName || !medicineName.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a medicine name.",
          results: [],
        },
        { status: 400 }
      );
    }

    const name = medicineName.trim();

    // -----------------------------
    // FDA API key
    // -----------------------------
    const apiKey = process.env.OPENFDA_API_KEY;

    if (!apiKey) {
      console.error("OPENFDA_API_KEY is missing.");

      return NextResponse.json(
        {
          success: false,
          error: "FDA API configuration is missing.",
          results: [],
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // Search generic OR brand name
    // -----------------------------
    const searchQuery =
      `openfda.generic_name:"${name}" OR ` +
      `openfda.brand_name:"${name}"`;

    const url = new URL(FDA_API_URL);

    url.searchParams.set("search", searchQuery);
    url.searchParams.set("limit", "10");
    url.searchParams.set("api_key", apiKey);

    // -----------------------------
    // Call openFDA
    // -----------------------------
    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    // -----------------------------
    // No medicine found
    // -----------------------------
    if (response.status === 404) {
      return NextResponse.json(
        {
          success: false,
          error: `No medicine information found for "${name}".`,
          results: [],
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Rate limit
    // -----------------------------
    if (response.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error:
            "FDA API request limit reached. Please try again later.",
          results: [],
        },
        { status: 429 }
      );
    }

    // -----------------------------
    // Other FDA API errors
    // -----------------------------
    if (!response.ok) {
      console.error(
        "openFDA error:",
        response.status,
        response.statusText
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to retrieve medicine information from the FDA.",
          results: [],
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // -----------------------------
    // Extract results
    // -----------------------------
    const results = Array.isArray(data.results)
      ? data.results
      : [];

    if (results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No medicine information found for "${name}".`,
          results: [],
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Clean FDA response
    // -----------------------------
    const medicines = results.map((medicine: any) => ({
      id:
        medicine.id ||
        medicine.set_id ||
        medicine.openfda?.spl_id?.[0] ||
        Math.random().toString(36),

      brandName:
        medicine.openfda?.brand_name?.[0] ||
        "Not available",

      genericName:
        medicine.openfda?.generic_name?.[0] ||
        "Not available",

      manufacturer:
        medicine.openfda?.manufacturer_name?.[0] ||
        "Not available",

      productType:
        medicine.openfda?.product_type?.[0] ||
        "Not available",

      route:
        medicine.openfda?.route?.[0] ||
        "Not available",

      activeIngredient:
        medicine.active_ingredient?.[0] ||
        medicine.openfda?.substance_name?.[0] ||
        "Not available",

      purpose:
        medicine.purpose?.[0] ||
        "Information not available",

      indications:
        medicine.indications_and_usage?.[0] ||
        "Information not available",

      warnings:
        medicine.warnings?.[0] ||
        "No warning information available",

      dosage:
        medicine.dosage_and_administration?.[0] ||
        "Information not available",

      sideEffects:
        medicine.adverse_reactions?.[0] ||
        "Information not available",

      pregnancy:
        medicine.pregnancy_or_breast_feeding?.[0] ||
        "Information not available",

      doNotUse:
        medicine.do_not_use?.[0] ||
        "Information not available",

      storage:
        medicine.storage_and_handling?.[0] ||
        "Information not available",
    }));

    // -----------------------------
    // Return data to frontend
    // -----------------------------
    return NextResponse.json({
      success: true,
      count: medicines.length,
      results: medicines,
    });
  } catch (error) {
    console.error("Medicine API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while fetching medicine information.",
        results: [],
      },
      { status: 500 }
    );
  }
}