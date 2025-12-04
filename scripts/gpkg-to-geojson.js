// Конвертер GPKG в GeoJSON
// Запуск: node scripts/gpkg-to-geojson.js

const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const wkx = require("wkx");

const GPKG_FILE = path.join(
  __dirname,
  "..",
  "public",
  "almaty_hospital_road_accessibility.gpkg"
);
const OUTPUT_DIR = path.join(__dirname, "..", "public", "geo-files");

// Слои для экспорта
const LAYERS_TO_EXPORT = [
  "grid_accessibility",
  "hospitals",
  "roads_accessible_10min",
  "roads_accessible_15min",
  "roads_accessible_30min",
  "roads_accessible_60min",
];

async function convertGPKG() {
  console.log("🗺️  GPKG to GeoJSON Converter");
  console.log("============================\n");

  // Проверяем файл
  if (!fs.existsSync(GPKG_FILE)) {
    console.error("❌ GPKG файл не найден:", GPKG_FILE);
    process.exit(1);
  }

  console.log("✅ GPKG файл найден:", GPKG_FILE);
  console.log(
    "📊 Размер:",
    (fs.statSync(GPKG_FILE).size / 1024 / 1024).toFixed(2),
    "MB\n"
  );

  // Создаем директорию
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // Инициализируем SQL.js
    console.log("🔄 Загрузка SQL.js...");
    const SQL = await initSqlJs();

    // Читаем GPKG файл
    console.log("📖 Чтение GPKG файла...\n");
    const fileBuffer = fs.readFileSync(GPKG_FILE);
    const db = new SQL.Database(fileBuffer);

    // Получаем список таблиц
    const tables = db.exec("SELECT table_name, data_type FROM gpkg_contents");

    if (tables.length > 0 && tables[0].values) {
      console.log("📋 Найденные слои:");
      tables[0].values.forEach((row) => {
        console.log(`   - ${row[0]} (${row[1]})`);
      });
      console.log("");
    }

    // Экспортируем каждый слой
    for (const layerName of LAYERS_TO_EXPORT) {
      await exportLayer(db, layerName);
    }

    db.close();

    console.log("\n🎉 Конвертация завершена!");
    console.log("📁 Файлы сохранены в:", OUTPUT_DIR);
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
    process.exit(1);
  }
}

async function exportLayer(db, layerName) {
  console.log(`\n📤 Экспорт слоя: ${layerName}`);

  try {
    // Получаем информацию о геометрии
    const geomInfo = db.exec(`
      SELECT column_name, geometry_type_name, srs_id 
      FROM gpkg_geometry_columns 
      WHERE table_name = '${layerName}'
    `);

    let geomColumn = "geom";
    if (geomInfo.length > 0 && geomInfo[0].values.length > 0) {
      geomColumn = geomInfo[0].values[0][0];
      console.log(
        `   Геометрия: ${geomInfo[0].values[0][1]} (колонка: ${geomColumn})`
      );
    }

    // Получаем все записи
    const result = db.exec(`SELECT * FROM "${layerName}" LIMIT 100000`);

    if (result.length === 0 || result[0].values.length === 0) {
      console.log(`   ⚠️ Слой пустой или не найден`);
      return;
    }

    const columns = result[0].columns;
    const rows = result[0].values;

    console.log(`   📊 Записей: ${rows.length}`);

    // Находим индекс колонки геометрии
    const geomIndex = columns.indexOf(geomColumn);
    if (geomIndex === -1) {
      console.log(`   ⚠️ Колонка геометрии не найдена`);
      return;
    }

    // Конвертируем в GeoJSON
    const features = [];
    let errorCount = 0;

    for (const row of rows) {
      try {
        const geomBlob = row[geomIndex];

        if (!geomBlob) {
          continue;
        }

        // Парсим WKB геометрию
        let geometry = null;

        if (geomBlob instanceof Uint8Array || Buffer.isBuffer(geomBlob)) {
          // GPKG использует GeoPackage Binary формат - нужно пропустить заголовок
          const buffer = Buffer.from(geomBlob);

          // GeoPackage Binary Header:
          // 2 bytes: magic number (GP)
          // 1 byte: version
          // 1 byte: flags
          // 4 bytes: srs_id
          // optional envelope (зависит от flags)

          if (buffer[0] === 0x47 && buffer[1] === 0x50) {
            // 'GP'
            const flags = buffer[3];
            const envelopeType = (flags >> 1) & 0x07;

            let headerSize = 8; // базовый заголовок

            // Добавляем размер envelope в зависимости от типа
            switch (envelopeType) {
              case 1:
                headerSize += 32;
                break; // xy
              case 2:
                headerSize += 48;
                break; // xyz
              case 3:
                headerSize += 48;
                break; // xym
              case 4:
                headerSize += 64;
                break; // xyzm
            }

            const wkbBuffer = buffer.slice(headerSize);
            geometry = wkx.Geometry.parse(wkbBuffer).toGeoJSON();
          } else {
            // Попробуем как обычный WKB
            geometry = wkx.Geometry.parse(buffer).toGeoJSON();
          }
        }

        if (!geometry) {
          continue;
        }

        // Собираем свойства
        const properties = {};
        columns.forEach((col, idx) => {
          if (idx !== geomIndex && col !== "fid") {
            properties[col] = row[idx];
          }
        });

        features.push({
          type: "Feature",
          properties,
          geometry,
        });
      } catch (err) {
        errorCount++;
        if (errorCount <= 3) {
          console.log(`   ⚠️ Ошибка парсинга геометрии: ${err.message}`);
        }
      }
    }

    if (errorCount > 3) {
      console.log(`   ⚠️ Всего ошибок парсинга: ${errorCount}`);
    }

    // Сохраняем GeoJSON
    const geoJson = {
      type: "FeatureCollection",
      features,
    };

    const outputFile = path.join(OUTPUT_DIR, `${layerName}.geojson`);
    fs.writeFileSync(outputFile, JSON.stringify(geoJson));

    console.log(`   ✅ Сохранено: ${features.length} объектов`);
    console.log(`   📄 Файл: ${outputFile}`);
    console.log(
      `   📦 Размер: ${(fs.statSync(outputFile).size / 1024).toFixed(1)} KB`
    );
  } catch (error) {
    console.log(`   ❌ Ошибка экспорта: ${error.message}`);
  }
}

// Запускаем
convertGPKG();
