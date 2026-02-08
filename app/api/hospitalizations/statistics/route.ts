import { NextResponse } from "next/server";
import { healthcareApi } from "@/lib/api/healthcare";

export async function GET() {
  try {
    const response = await healthcareApi.getHospitalizationStatistics();
    return NextResponse.json(response.results);
  } catch (error) {
    console.error("Error fetching hospitalization statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospitalization statistics" },
      { status: 500 }
    );
  }
}
