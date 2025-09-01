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
    db.all("SELECT * FROM products", (error, rows) => {
      if (error) {
        log.info("Error fetching products:", error);
        reject([]); // or reject(error);
        return;
      }

      const products: Product[] = rows.map((row: any) => ({
          id: row.id,
          barcode: row.barcode,
          brand: row.brand,
          name: row.name,
          price: row.price,
          stock: row.stock,
          happy_hour_price: row.happy_hour_price,
          image: row.image ?? null,
      }));

      resolve(products);
    });
  });
}

export default db;