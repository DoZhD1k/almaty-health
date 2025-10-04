import { NextResponse } from "next/server";

// Простой тестовый эндпоинт для проверки работы API
export async function GET() {
  try {
    console.log("Test endpoint called");
    
    // Проверяем переменные окружения
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("API URL from env:", apiUrl);
    
    // Пробуем сделать простой запрос к API
    const testUrl = `${apiUrl}/api/v1/healthcare/facility-statistic/?limit=1`;
    console.log("Testing API URL:", testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("API test response status:", response.status);
    console.log("API test response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API test error response:", errorText);
      
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}`,
        details: errorText,
        url: testUrl,
      }, { status: 500 });
    }
    
    const data = await response.json();
    console.log("API test success, data keys:", Object.keys(data));
    
    return NextResponse.json({
      success: true,
      message: "API connection successful",
      dataKeys: Object.keys(data),
      resultsCount: data.results ? data.results.length : 0,
      url: testUrl,
    });
    
  } catch (error) {
    console.error("Test endpoint error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.constructor.name : typeof error,
    }, { status: 500 });
  }
}