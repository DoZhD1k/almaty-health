import { NextResponse } from "next/server";
import { healthcareApi } from "@/lib/api/healthcare";

export async function GET() {
  try {
    const response = await healthcareApi.getFacilityStatistics();
    return NextResponse.json(response.results);
  } catch (error) {
    console.error("Error fetching facility statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch facility statistics" },
      { status: 500 }
    );
  }
}
