import sqlite3 from "sqlite3";
//import log from "electron-log";
import path from "path";
import { app, dialog } from "electron";
import { isDev } from "./util.js";
import fs from 'fs';

// Change log levels
//log.transports.console.level = "silly"; // everything goes to terminal
//log.transports.file.level = "info";     // only info+ goes to file
//Object.assign(console, log.functions);

const dbPath = isDev() ? path.join(app.getAppPath(), ".", "public", "database.db") : path.join(app.getPath("userData"), "database.db");

if (!fs.existsSync(dbPath)) {
  fs.copyFileSync(path.join(process.resourcesPath, "public", "database.db"), dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      //log.info('Database opening error: ', err);
    } else {
      //log.info("Database opened successfully");
    }
});

function runAsync(sql: string, params: any): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

export function GetProduct(productId: number): Promise<Product> {
  return new Promise((resolve, reject) => {
    db.get<Product>("SELECT * FROM products WHERE id = $id", { $id: productId }, async (error, row: any) => {
      if (error) {
        //log.info("Error fetching products:", error);
        reject(error);
        return;
      }
      if (!row) {
        reject(new Error("Product not found"));
        return;
      }

      try {
        const happyHourTimestamps = await getHappyHourTimestamps(row.id);
        const product: Product = {
          id: row.id,
          barcode: row.barcode,
          brand: row.brand,
          name: row.name,
          price: row.price,
          bought_price: row.bought_price,
          stock: row.stock,
          happy_hour_price: row.happy_hour_price,
          happy_hour_timestamps: happyHourTimestamps,
          image: row.image ?? null
        };
        resolve(product);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export function GetProducts(): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    db.all<Product[]>("SELECT * FROM products WHERE is_deleted = 0", async (error, rows) => {
      if (error) {
        //log.info("Error fetching products:", error);
        reject(error); // or reject(error);
        return;
      }

      const products: Product[] = await Promise.all(
        rows.map(async (row: any): Promise<Product> => ({
          id: row.id,
          barcode: row.barcode,
          brand: row.brand,
          name: row.name,
          price: row.price,
          bought_price: row.bought_price,
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
    type happy_hour = {id: number, product_id: number, start_time: number, end_time: number};
    db.all<happy_hour>("SELECT * FROM happy_hours WHERE product_id = $id", { $id: product_id }, (error, rows) => {
      if (error) {
        //log.info("Error fetching products:", error);
        reject(error); // or reject(error);
        return;
      }

      const timestamps = rows.map((row: happy_hour) => ({
        startTime: new Date(row.start_time),
        endTime: new Date(row.end_time)
      }))
      resolve(timestamps);
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
      "INSERT INTO products(barcode, brand, name, price, bought_price, stock, happy_hour_price, image) VALUES($barcode, $brand, $name, $price, $bought_price, $stock, $happy_hour_price, $image)",
      {
        $barcode: product.barcode,
        $brand: product.brand,
        $name: product.name,
        $price: product.price,
        $bought_price: product.bought_price,
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

    await runAsync("UPDATE products SET barcode = $barcode, brand = $brand, name = $name, price = $price, stock = $stock, happy_hour_price = $happy_hour_price, image = $image, updated_at = $updated_at WHERE id = $id", 
    {
      $barcode: product.barcode,
      $brand: product.brand,
      $name: product.name,
      $price: product.price,
      $stock: product.stock,
      $happy_hour_price: product.happy_hour_price,
      $image: product.image,
      $id: product.id,
      $updated_at: new Date().toISOString()
    });

    return true;
  } catch {
    return false;
  }
}

export async function DeleteProduct(productId: number) {
  await runAsync("DELETE FROM happy_hours WHERE product_id = $id", { $id: productId });

  await runAsync("UPDATE products SET is_deleted = 1 WHERE id = $id", { $id: productId });
}

export async function GetSales(condition?: string, params?: Record<string, any>): Promise<SaleStatistics[]> {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM sales LEFT JOIN products ON products.id = sales.product_id`;
    if (condition) {
      query += ` ${condition.trim()}`;
    }

    type database_sales = {id: number, transaction_id: number, product_id: number, quantity: number, price_per_unit: number, total_price: number, is_prize: 1 | 0, is_happy_hour_purchase: 1 | 0, sale_date: string, loss: 1 | 0}

    db.all<database_sales>(query, params, async (error, rows) => {
      if (error) {
        //log.info("Error fetching sales:", error);
        reject(error);
        return;
      }
      // Process rows
      const sales: SaleStatistics[] = await Promise.all(
        rows.map(async (row: database_sales) => ({
          id: row.id,
          datetime: new Date(row.sale_date),
          total_sale_price: row.total_price,
          soldProduct: {
            product: await GetProduct(row.product_id),
            quantity: row.quantity,
            price: row.price_per_unit,
            is_prize: row.is_prize === 1 ? true : false,
            is_happy_hour_purchase: row.is_happy_hour_purchase === 1 ? true : false,
            loss: row.loss === 1 ? true : false
          }
        }))
      );
      resolve(sales);
    });
  });
}

export async function AddSale(sale: Sale): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      // db.run("BEGIN TRANSACTION");
      try {
        let transactionId: number | undefined;
        for (const [i, { product, quantity, price, is_prize, is_happy_hour_purchase, loss }] of sale.soldProducts.entries()) {
          if (i === 0) {
            transactionId = await runAsync("INSERT INTO sales(product_id, quantity, price_per_unit, total_price, is_prize, is_happy_hour_purchase, loss) VALUES($product_id, $quantity, $price_per_unit, $total_price, $is_prize, $is_happy_hour_purchase, $loss)",
              {
                $product_id: product.id,
                $quantity: quantity,
                $price_per_unit: price,
                $total_price: price * quantity,
                $is_prize: is_prize,
                $is_happy_hour_purchase: is_happy_hour_purchase,
                $loss: loss ? 1 : 0
              }
            );

            await runAsync("UPDATE sales SET transaction_id = $transaction_id WHERE id = $id",
              {
                $transaction_id: transactionId,
                $id: transactionId
              }
            )
          } else {
            await runAsync(
              "INSERT INTO sales(transaction_id, product_id, quantity, price_per_unit, total_price, is_prize, is_happy_hour_purchase) VALUES($transaction_id, $product_id, $quantity, $price_per_unit, $total_price, $is_prize, $is_happy_hour_purchase)",
              {
                $transaction_id: transactionId,
                $product_id: product.id,
                $quantity: quantity,
                $price_per_unit: price,
                $total_price: price * quantity,
                $is_prize: is_prize,
                $is_happy_hour_purchase: is_happy_hour_purchase,
                $loss: loss ? 1 : 0
              }
            );
          }
        }
        // db.run("COMMIT");
        resolve(true);
      } catch (error) {
        // db.run("ROLLBACK");
        //log.info(error);
        reject(false);
      }
    });
  });
}

export async function UpdateProductStock(sale: Sale): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      // db.run("BEGIN TRANSACTION");
      try {
        for (const { product, quantity } of sale.soldProducts) {
          await runAsync("UPDATE products SET stock = stock - $quantity WHERE id = $id", 
            {
              $quantity: quantity,
              $id: product.id
            }
          )
        }
        // db.run("COMMIT");
        resolve(true);
      } catch (error) {
        // db.run("ROLLBACK");
        //log.info("Failed to update product stock", error);
        reject(false);
        return;
      }
    });
  });
}

export async function ExportDatabase(window: Electron.BrowserWindow): Promise<void> {
  try {
    const result = await dialog.showSaveDialog(window, {
      title: "Download path for database",
      properties: ["createDirectory", "showOverwriteConfirmation"],
      defaultPath: "database.db",
      filters: [
        { name: "Database Files", extensions: ["db"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (result.canceled || !result.filePath || result.filePath === "") {
      dialog.showErrorBox("Exportering af database", "Denne filsti er desværre ikke valid");
      return;
    }
    // Ensure the file has .db extension
    let exportPath = result.filePath;
    if (!exportPath.endsWith('.db')) {
      exportPath += '.db';
    }
    fs.copyFile(dbPath, exportPath, (err) => {
      if (err) {
        dialog.showErrorBox("Exportering af database", "Der opstod desværre en fejl ved exportering af database");
      } else {
        // Set the modification time to now
        const now: Date = new Date();
        fs.utimes(exportPath, now, now, () => {
          dialog.showMessageBox(window, {
            type: "info",
            title: "Eksport gennemført",
            message: "Databasen blev eksporteret succesfuldt til: " + exportPath
          });
        });
      }
    });
    return;
  } catch {
    dialog.showErrorBox("Exportering af database", "Fejl");
    return;
  }
}

export default db;