import { NextRequest, NextResponse } from "next/server";
import { getLayerData } from "@/lib/utils/geo-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get("layer");

  if (!layer) {
    return NextResponse.json(
      { error: "Layer parameter is required" },
      { status: 400 }
    );
  }

  try {
    console.log(`🗺️  Loading layer: ${layer}`);

    // Все слои загружаются из GeoJSON файлов
    const geoJsonData = await getLayerData(layer);

    return NextResponse.json(geoJsonData);
  } catch (error) {
    console.error(`❌ Error loading layer ${layer}:`, error);
    return NextResponse.json(
      { error: `Failed to load layer: ${layer}` },
      { status: 500 }
    );
  }
}

// Список доступных слоев
export async function POST() {
  return NextResponse.json({
    layers: [
      "grid_accessibility",
      "hospitals",
      "road_network",
      "roads_accessible_10min",
      "roads_accessible_15min",
      "roads_accessible_30min",
      "roads_accessible_60min",
    ],
  });
}
