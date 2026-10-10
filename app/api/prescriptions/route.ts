
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firebaseUid,
      medicineName,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      notes,
    } = body;

    if (
      typeof firebaseUid !== "string" ||
      !firebaseUid ||
      typeof medicineName !== "string" ||
      !medicineName.trim() ||
      typeof dosage !== "string" ||
      !dosage.trim() ||
      typeof frequency !== "string" ||
      !Array.isArray(times) ||
      times.length === 0 ||
      !times.every((time: unknown) => typeof time === "string") ||
      !times.every((time: string) =>
        /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(time)
      ) ||
      typeof startDate !== "string" ||
      typeof endDate !== "string" ||
      !startDate ||
      !endDate ||
      endDate < startDate
    ) {
      return NextResponse.json(
        { message: "Please check the required prescription details." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("healthhub");

    const prescription = {
      firebaseUid,
      medicineName: medicineName.trim(),
      dosage: dosage.trim(),
      frequency,
      times: [...new Set(times as string[])],
      startDate,
      endDate,
      notes: typeof notes === "string" ? notes.trim() : "",
      doseLogs: [],
      createdAt: new Date(),
    };

    const result = await db
      .collection("prescriptions")
      .insertOne(prescription);

    return NextResponse.json(
      {
        message: "Prescription saved successfully.",
        prescription: {
          ...prescription,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("PRESCRIPTION SAVE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to save prescription." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const firebaseUid = request.nextUrl.searchParams.get("firebaseUid");

    if (!firebaseUid) {
      return NextResponse.json(
        { message: "Firebase UID is required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("healthhub");

    const prescriptions = await db
      .collection("prescriptions")
      .find({ firebaseUid })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      prescriptions.map((prescription) => ({
        ...prescription,
        _id: prescription._id.toString(),
      }))
    );
  } catch (error) {
    console.error("PRESCRIPTION FETCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch prescriptions." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const { firebaseUid, prescriptionId, date, time, taken } = body;

    if (
      typeof firebaseUid !== "string" ||
      !firebaseUid ||
      typeof prescriptionId !== "string" ||
      !ObjectId.isValid(prescriptionId) ||
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      typeof time !== "string" ||
      typeof taken !== "boolean"
    ) {
      return NextResponse.json(
        { message: "Invalid dose update details." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("healthhub");
    const collection = db.collection("prescriptions");

    // Only update a prescription matching the supplied user ID.
    const filter = {
      _id: new ObjectId(prescriptionId),
      firebaseUid,
    };

    const prescription = await collection.findOne(filter);

    if (!prescription) {
      return NextResponse.json(
        { message: "Prescription not found." },
        { status: 404 }
      );
    }

    if (
      !Array.isArray(prescription.times) ||
      !prescription.times.includes(time) ||
      date < prescription.startDate ||
      date > prescription.endDate
    ) {
      return NextResponse.json(
        { message: "This dose is not scheduled for that date and time." },
        { status: 400 }
      );
    }

    // Remove the previous status for this exact date and time.
    await collection.updateOne(filter, {
      $pull: {
        doseLogs: { date, time },
      } as never,
    });

    // Save the new status only when the dose is marked as taken.
    if (taken) {
      await collection.updateOne(filter, {
        $push: {
          doseLogs: {
            date,
            time,
            taken: true,
            takenAt: new Date().toISOString(),
          },
        } as never,
      });
    }

    return NextResponse.json({
      message: taken
        ? "Dose marked as taken."
        : "Dose marked as not taken.",
      date,
      time,
      taken,
    });
  } catch (error) {
    console.error("DOSE UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update dose status." },
      { status: 500 }
    );
  }
}
