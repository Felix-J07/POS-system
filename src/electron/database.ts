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

function runAsync(sql: string, params: any): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

async function InsertHappyHourTimestamps(product: Product, productId: number): Promise<boolean> {
  try {
    for (const { startTime, endTime } of product.happy_hour_timestamps) {
      await runAsync(
        "INSERT INTO happy_hours(product_id, start_time, end_time) VALUES($productid, $starttime, $endtime)",
        {
          $productid: productId,
          $starttime: startTime.toISOString(),
          $endtime: endTime.toISOString(),
        }
      );
    }
    return true;
  } catch {
    return false;
  }
}

export async function AddProduct(product: Product): Promise<boolean> {
  try {
    // Insert product and get its ID
    const productId: number = await runAsync(
      "INSERT INTO products(barcode, brand, name, price, stock, happy_hour_price, image) VALUES($barcode, $brand, $name, $price, $stock, $happy_hour_price, $image)",
      {
        $barcode: product.barcode,
        $brand: product.brand,
        $name: product.name,
        $price: product.price,
        $stock: product.stock,
        $happy_hour_price: product.happy_hour_price,
        $image: product.image,
      }
    );

    await InsertHappyHourTimestamps(product, productId);

    return true;
  } catch (err) {
    return false;
  }
}

export async function UpdateProduct(product: Product) {
  try {
    await runAsync("DELETE FROM happy_hours WHERE product_id = $id", { $id: product.id });

    await InsertHappyHourTimestamps(product, product.id);

    await runAsync("UPDATE products SET barcode = $barcode, brand = $brand, name = $name, price = $price, stock = $stock, happy_hour_price = $happy_hour_price, image = $image WHERE id = $id", {
      $barcode: product.barcode,
      $brand: product.brand,
      $name: product.name,
      $price: product.price,
      $stock: product.stock,
      $happy_hour_price: product.happy_hour_price,
      $image: product.image,
      $id: product.id
    });

    return true;
  } catch {
    return false;
  }
}

export async function DeleteProduct(productId: number) {
  await runAsync("DELETE FROM happy_hours WHERE product_id = $id", { $id: productId });

  await runAsync("DELETE FROM products WHERE id = $id", { $id: productId });
}

export default db;