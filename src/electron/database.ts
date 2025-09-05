import sqlite3 from "sqlite3";
import log from "electron-log";
import path from "path";
import { app } from "electron";
import { isDev } from "./util.js";

// Change log levels
log.transports.console.level = "silly"; // everything goes to terminal
log.transports.file.level = "info";     // only info+ goes to file
Object.assign(console, log.functions);

const dbPath = path.join(app.getAppPath(), isDev() ? "." : "..", "public", "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      log.info('Database opening error: ', err);
    } else {
      log.info("Database opened successfully");
    }
});

export function GetProducts(): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM products", async (error, rows) => {
      if (error) {
        log.info("Error fetching products:", error);
        reject(error); // or reject(error);
        return;
      }

      const products = await Promise.all(
        rows.map(async (row: any) => ({
          id: row.id,
          barcode: row.barcode,
          brand: row.brand,
          name: row.name,
          price: row.price,
          stock: row.stock,
          happy_hour_price: row.happy_hour_price,
          happy_hour_timestamps: await getHappyHourTimestamps(row.id),
          image: row.image ?? null,
        }))
      )
      resolve(products);
    });
  });
}

function getHappyHourTimestamps(product_id: number): Promise<{startTime: Date, endTime: Date}[]> {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM happy_hours WHERE product_id = $id", { $id: product_id }, (error, rows) => {
      if (error) {
        log.info("Error fetching products:", error);
        reject(error); // or reject(error);
        return;
      }

      const timestamps = rows.map((row: any) => ({
        startTime: new Date(row.start_time),
        endTime: new Date(row.end_time)
      }))
      resolve(timestamps);
    });
  });
}

export default db;