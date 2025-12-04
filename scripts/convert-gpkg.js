// Скрипт для конвертации GPKG файла в GeoJSON файлы
// Запуск: node scripts/convert-gpkg.js

const fs = require("fs");
const path = require("path");

console.log("GPKG Converter");
console.log("==============");
console.log("");
console.log("Для конвертации GPKG файла в GeoJSON файлы нужно:");
console.log("");
console.log("1. Установить GDAL:");
console.log("   - Windows: скачать с https://gdal.org/download.html");
console.log("   - macOS: brew install gdal");
console.log("   - Linux: apt-get install gdal-bin");
console.log("");
console.log("2. Запустить команды для конвертации:");
console.log("");

const gpkgFile = path.join(
  __dirname,
  "..",
  "public",
  "almaty_hospital_road_accessibility.gpkg"
);
const outputDir = path.join(__dirname, "..", "public", "geo-files");

// Убедимся, что директория существует
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const layers = [
  "grid_accessibility",
  "hospitals",
  "roads_accessible_10min",
  "roads_accessible_15min",
  "roads_accessible_30min",
  "roads_accessible_60min",
];

console.log("Команды для конвертации:");
console.log("========================");
console.log("");

layers.forEach((layer) => {
  const outputFile = path.join(outputDir, `${layer}.geojson`);
  const command = `ogr2ogr -f GeoJSON "${outputFile}" "${gpkgFile}" ${layer}`;
  console.log(command);
});

console.log("");
console.log(
  "После выполнения этих команд, обновите API endpoint для чтения файлов."
);
console.log("");

// Проверим, существует ли GPKG файл
if (fs.existsSync(gpkgFile)) {
  console.log(`✅ GPKG файл найден: ${gpkgFile}`);
} else {
  console.log(`❌ GPKG файл не найден: ${gpkgFile}`);
  console.log(
    "Убедитесь, что файл almaty_hospital_road_accessibility.gpkg находится в папке public/"
  );
}

console.log("");
