// Утилита для чтения GPKG файлов в Node.js
import sqlite3 from "sqlite3";
import path from "path";

interface GPKGFeature {
  type: "Feature";
  properties: any;
  geometry: any;
}

interface GPKGFeatureCollection {
  type: "FeatureCollection";
  features: GPKGFeature[];
}

// Функция для чтения слоя из GPKG файла
export async function readGPKGLayer(
  layerName: string
): Promise<GPKGFeatureCollection> {
  return new Promise((resolve, reject) => {
    const gpkgPath = path.join(
      process.cwd(),
      "public",
      "almaty_hospital_road_accessibility.gpkg"
    );

    const db = new sqlite3.Database(gpkgPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        reject(new Error(`Failed to open GPKG file: ${err.message}`));
        return;
      }
    });

    // Запрос для получения данных слоя
    const query = `SELECT * FROM "${layerName}"`;

    db.all(query, [], (err, rows) => {
      if (err) {
        db.close();
        reject(new Error(`Failed to query layer ${layerName}: ${err.message}`));
        return;
      }

      try {
        const features: GPKGFeature[] = rows.map((row: any) => {
          // Парсим геометрию из Well-Known Binary (WKB) формата
          let geometry = null;

          if (row.geom) {
            // Простое преобразование координат для точек
            // Для сложных геометрий нужна более продвинутая библиотека
            geometry = parseSimpleGeometry(row.geom);
          }

          // Убираем geom и fid из properties
          const { geom, fid, ...properties } = row;

          return {
            type: "Feature",
            properties,
            geometry,
          };
        });

        db.close((closeErr) => {
          if (closeErr) {
            console.warn("Error closing database:", closeErr);
          }
        });

        resolve({
          type: "FeatureCollection",
          features,
        });
      } catch (parseError) {
        db.close();
        reject(new Error(`Failed to parse features: ${parseError}`));
      }
    });
  });
}

// Простая функция парсинга геометрии (упрощенная версия)
function parseSimpleGeometry(wkbBuffer: Buffer) {
  // Это упрощенная версия парсинга WKB
  // Для полноценного парсинга нужна библиотека типа wkx или terraformer

  try {
    // Пытаемся определить тип геометрии по размеру буфера и данным
    if (wkbBuffer.length < 21) {
      return null;
    }

    // Простой парсер для точек (Point geometry)
    // WKB format: byte order (1) + geometry type (4) + X (8) + Y (8) = 21 bytes minimum
    const view = new DataView(
      wkbBuffer.buffer,
      wkbBuffer.byteOffset,
      wkbBuffer.byteLength
    );

    // Читаем порядок байт
    const byteOrder = view.getUint8(0);
    const isLittleEndian = byteOrder === 1;

    // Читаем тип геометрии
    const geomType = view.getUint32(1, isLittleEndian);

    switch (geomType) {
      case 1: // Point
        const x = view.getFloat64(5, isLittleEndian);
        const y = view.getFloat64(13, isLittleEndian);
        return {
          type: "Point",
          coordinates: [x, y],
        };

      default:
        // Для других типов геометрий возвращаем null
        // В реальном проекте нужно использовать специализированную библиотеку
        console.warn(`Unsupported geometry type: ${geomType}`);
        return null;
    }
  } catch (error) {
    console.warn("Failed to parse geometry:", error);
    return null;
  }
}

// Функция для получения списка слоев в GPKG файле
export async function getGPKGLayers(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const gpkgPath = path.join(
      process.cwd(),
      "public",
      "almaty_hospital_road_accessibility.gpkg"
    );

    const db = new sqlite3.Database(gpkgPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        reject(new Error(`Failed to open GPKG file: ${err.message}`));
        return;
      }
    });

    // Запрос для получения списка слоев
    const query =
      "SELECT table_name FROM gpkg_contents WHERE data_type = 'features'";

    db.all(query, [], (err, rows) => {
      db.close();

      if (err) {
        reject(new Error(`Failed to get layers: ${err.message}`));
        return;
      }

      const layers = rows.map((row: any) => row.table_name);
      resolve(layers);
    });
  });
}
