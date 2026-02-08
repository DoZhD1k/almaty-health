// Скрипт для предварительной конвертации GPKG в GeoJSON файлы
// Запуск: node scripts/convert-gpkg-simple.js

const fs = require("fs");
const path = require("path");

console.log("🗺️  GPKG to GeoJSON Converter (Simple Version)");
console.log("===============================================");
console.log("");

// Проверяем наличие GPKG файла
const gpkgFile = path.join(
  __dirname,
  "..",
  "public",
  "almaty_hospital_road_accessibility.gpkg"
);
const outputDir = path.join(__dirname, "..", "public", "geo-files");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("📁 Создана директория:", outputDir);
}

if (!fs.existsSync(gpkgFile)) {
  console.log("❌ GPKG файл не найден:", gpkgFile);
  console.log("");
  console.log(
    "Поместите файл almaty_hospital_road_accessibility.gpkg в папку public/"
  );
  process.exit(1);
}

console.log("✅ GPKG файл найден:", gpkgFile);
console.log(
  "📊 Размер файла:",
  (fs.statSync(gpkgFile).size / 1024 / 1024).toFixed(2),
  "MB"
);
console.log("");

// Создаем заглушки для тестирования
console.log("📝 Создание тестовых GeoJSON файлов...");
console.log("");

// Слои для создания
const layers = {
  roads_accessible_10min: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { accessibility: "10min" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [76.87, 43.23],
              [76.93, 43.23],
              [76.93, 43.27],
              [76.87, 43.27],
              [76.87, 43.23],
            ],
          ],
        },
      },
    ],
  },

  roads_accessible_15min: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { accessibility: "15min" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [76.84, 43.2],
              [76.96, 43.2],
              [76.96, 43.3],
              [76.84, 43.3],
              [76.84, 43.2],
            ],
          ],
        },
      },
    ],
  },

  roads_accessible_30min: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { accessibility: "30min" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [76.8, 43.16],
              [77.0, 43.16],
              [77.0, 43.34],
              [76.8, 43.34],
              [76.8, 43.16],
            ],
          ],
        },
      },
    ],
  },

  roads_accessible_60min: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { accessibility: "60min" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [76.75, 43.12],
              [77.05, 43.12],
              [77.05, 43.38],
              [76.75, 43.38],
              [76.75, 43.12],
            ],
          ],
        },
      },
    ],
  },

  grid_accessibility: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { population_density: "high" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [76.88, 43.22],
              [76.92, 43.22],
              [76.92, 43.26],
              [76.88, 43.26],
              [76.88, 43.22],
            ],
          ],
        },
      },
    ],
  },
};

// Сохраняем каждый слой
Object.entries(layers).forEach(([layerName, data]) => {
  const outputFile = path.join(outputDir, `${layerName}.geojson`);

  try {
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`✅ ${layerName}.geojson`);
  } catch (error) {
    console.log(`❌ Ошибка при создании ${layerName}.geojson:`, error.message);
  }
});

console.log("");
console.log("🎉 Готово! Тестовые файлы созданы в:", outputDir);
console.log("");
console.log("📝 Следующие шаги:");
console.log(
  "1. Для получения реальных данных используйте QGIS или другой GIS инструмент"
);
console.log("2. Экспортируйте слои из GPKG в GeoJSON формат");
console.log("3. Поместите файлы в папку public/geo-files/");
console.log("4. API автоматически будет использовать реальные данные");
console.log("");
