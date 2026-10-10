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
    // Call OpenFDA
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
    const medicines = results.map((medicine: any) => {
      // --------------------------------
      // Short warning - maximum 3 sentences
      // --------------------------------
      const warningText =
        medicine.warnings?.[0] ||
        "Use only as directed.";

      const cleanedWarning = warningText
        .replace(/\s+/g, " ")
        .trim();

      const warningSentences = cleanedWarning
        .split(/(?<=[.!?])\s+/)
        .filter((sentence: string) => sentence.trim());

      const shortWarning =
        warningSentences.slice(0, 3).join(" ") ||
        "Use only as directed.";

      // --------------------------------
      // Clean active ingredient
      // --------------------------------
      const activeIngredient =
        medicine.openfda?.substance_name?.[0] ||
        medicine.active_ingredient?.[0] ||
        "Not available";

      return {
        id:
          medicine.id ||
          medicine.set_id ||
          medicine.openfda?.spl_id?.[0] ||
          Math.random().toString(36),

        // -----------------------------
        // Medicine
        // -----------------------------
        brandName:
          medicine.openfda?.brand_name?.[0] ||
          medicine.openfda?.generic_name?.[0] ||
          "Not available",

        // -----------------------------
        // Generic
        // -----------------------------
        genericName:
          medicine.openfda?.generic_name?.[0] ||
          "Not available",

        // -----------------------------
        // Manufacturer
        // -----------------------------
        manufacturer:
          medicine.openfda?.manufacturer_name?.[0] ||
          "Not available",

        // -----------------------------
        // More Information
        // -----------------------------
        productType:
          medicine.openfda?.product_type?.[0] ||
          "Not available",

        route:
          medicine.openfda?.route?.[0] ||
          "Not available",

        activeIngredient,

        // -----------------------------
        // Purpose
        // -----------------------------
        purpose:
          medicine.purpose?.[0] ||
          "Information not available",

        // -----------------------------
        // Uses & Indications
        // -----------------------------
        indications:
          medicine.indications_and_usage?.[0] ||
          "Information not available",

        // -----------------------------
        // Warning
        // -----------------------------
        warnings: shortWarning,
      };
    });

    // -----------------------------
    // Return data
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