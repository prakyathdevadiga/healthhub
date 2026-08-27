import { NextRequest, NextResponse } from "next/server";

const FDA_API_URL = "https://api.fda.gov/drug/label.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const medicineName = searchParams.get("name");

    if (!medicineName || medicineName.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Please provide a medicine name.",
        },
        { status: 400 }
      );
    }

    const name = medicineName.trim();

    // Search generic name first
    const genericSearch = encodeURIComponent(
      `openfda.generic_name:"${name}"`
    );

    let response = await fetch(
      `${FDA_API_URL}?search=${genericSearch}&limit=10`,
      {
        cache: "no-store",
      }
    );

    // If generic name doesn't return results,
    // search brand name.
    if (!response.ok) {
      const brandSearch = encodeURIComponent(
        `openfda.brand_name:"${name}"`
      );

      response = await fetch(
        `${FDA_API_URL}?search=${brandSearch}&limit=10`,
        {
          cache: "no-store",
        }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Medicine not found.",
          results: [],
        },
        { status: 404 }
      );
    }

    const data = await response.json();

    const results = data.results || [];

    // Convert FDA's large response into
    // clean data for our frontend.
    const medicines = results.map((medicine: any) => ({
      id: medicine.id,

      brandName:
        medicine.openfda?.brand_name?.[0] || "Not available",

      genericName:
        medicine.openfda?.generic_name?.[0] || "Not available",

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

    return NextResponse.json({
      success: true,
      count: medicines.length,
      results: medicines,
    });
  } catch (error) {
    console.error("FDA API Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while fetching medicine information.",
      },
      { status: 500 }
    );
  }
}