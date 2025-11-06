import sqlite3 from "sqlite3";
//import log from "electron-log"; // Uncomment to enable logging
import path from "path";
import { app, dialog } from "electron";
import { isDev } from "./util.js";
import fs from 'fs';

// Change log levels (For debugging purposes)
//log.transports.console.level = "silly"; // everything goes to terminal
//log.transports.file.level = "info";     // only info+ goes to file
//Object.assign(console, log.functions);

// Defines the path to the mutable database file (in userData folder for production, in public folder for development)
const dbPath = isDev() ? path.join(app.getAppPath(), ".", "public", "database.db") : path.join(app.getPath("userData"), "database.db");

// Copy the initial database from resources to userData if it doesn't exist yet (for production)
if (!fs.existsSync(dbPath)) {
  fs.copyFileSync(path.join(process.resourcesPath, "public", "database.db"), dbPath);
}

// Initialize the database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      //log.info('Database opening error: ', err); // Uncomment to enable logging
    } else {
      //log.info("Database opened successfully"); // Uncomment to enable logging
    }
});

// Creates function to run SQL queries with parameters and return a Promise
// Used for INSERT, UPDATE, DELETE queries, and returns the last inserted ID for INSERT queries
// Returns as promise to ensure async/await compatibility
// Prevents duplicating code
async function runAsync(sql: string, params: any): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// Function to get a single product by its ID, including its happy hour timestamps
export function GetProduct(productId: number): Promise<Product> {
  return new Promise((resolve, reject) => {
    // db.get retrieves a single row from the database that matches the query and parameters provided 
    // A callback function is provided to handle the result or any error that occurs during the query
    db.get<Product>("SELECT * FROM products WHERE id = $id", { $id: productId }, async (error, row: any) => {
      if (error) {
        //log.info("Error fetching products:", error); // Uncomment to enable logging
        reject(error);
        return;
      }
      // Checks if a row was not found
      if (!row) {
        reject(new Error("Product not found"));
        return;
      }

      // Tries to make a product type with happy hour timestamps
      // Calls getHappyHourTimestamps to fetch the happy hour timestamps in the needed type
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
        // Resolves the promise successfully with the product
        resolve(product);
      } catch (err) {
        // If fetching happy hour timestamps fails, reject the promise with the error
        reject(err);
      }
    });
  });
}

// Function to get all products that are not deleted, including their happy hour timestamps
export function GetProducts(): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    // db.all retrieves all rows from the database that match the query provided
    // A callback function is provided to handle the result or any error that occurs during the query
    db.all<Product[]>("SELECT * FROM products WHERE is_deleted = 0", async (error, rows) => {
      if (error) {
        //log.info("Error fetching products:", error); // Uncomment to enable logging
        reject(error);
        return;
      }

      // Maps each row to a Product type, including fetching happy hour timestamps for each product
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
      // Finally resolves the promise successfully with the array of products
      resolve(products);
    });
  });
}

// Helper function to get happy hour timestamps for a specific product
// Returns a promise that resolves to an array of objects with startTime and endTime as Date objects
// Prevents duplicating code
function getHappyHourTimestamps(product_id: number): Promise<{startTime: Date, endTime: Date}[]> {
  return new Promise((resolve, reject) => {
    // Defines a type for the happy_hour table rows for type safety in the db.all callback
    type happy_hour = {id: number, product_id: number, start_time: number, end_time: number};

    // db.all retrieves all rows from the happy_hours table that match the product_id provided
    db.all<happy_hour>("SELECT * FROM happy_hours WHERE product_id = $id", { $id: product_id }, (error, rows) => {
      if (error) {
        //log.info("Error fetching products:", error);
        reject(error); // or reject(error);
        return;
      }

      // Maps each row to an object with startTime and endTime as Date objects
      const timestamps = rows.map((row: happy_hour) => ({
        startTime: new Date(row.start_time),
        endTime: new Date(row.end_time)
      }))
      // Resolves the promise successfully with the array of timestamps
      resolve(timestamps);
    });
  });
}

// Helper function to insert happy hour timestamps for a product from a given Product object
// Prevents duplicating code
async function InsertHappyHourTimestamps(product: Product, productId: number): Promise<boolean> {
  // Tries to insert each happy hour timestamp into the database
  try {
    for (const { startTime, endTime } of product.happy_hour_timestamps) {
      // Uses the runAsync helper function to run the INSERT query
      await runAsync(
        "INSERT INTO happy_hours(product_id, start_time, end_time) VALUES($productid, $starttime, $endtime)",
        {
          $productid: productId,
          $starttime: startTime.toISOString(), // Convert Date to ISO string for SQLite
          $endtime: endTime.toISOString(), // Convert Date to ISO string for SQLite
        }
      );
    }
    return true;
  } catch {
    return false;
  }
}

// Function to add a new product to the database, including its happy hour timestamps
export async function AddProduct(product: Product): Promise<boolean> {
  try {
    // Insert product using runAsync and get its ID in the sqlite database
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
    // Insert happy hour timestamps using the helper function and uses the new productId returned from the runAsync function
    await InsertHappyHourTimestamps(product, productId);

    return true;
  } catch (err) {
    return false;
  }
}

// Function to update an existing product in the database, including its happy hour timestamps
export async function UpdateProduct(product: Product) {
  // Tries to update the product and its happy hour timestamps
  try {
    // First deletes all existing happy hour timestamps for the product to avoid duplicates
    // Then reinserts the happy hour timestamps from the provided Product object
    await runAsync("DELETE FROM happy_hours WHERE product_id = $id", { $id: product.id });
    await InsertHappyHourTimestamps(product, product.id);

    // Updates the product using runAsync
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

// Function to "delete" a product by marking it as deleted and removing its happy hour timestamps
export async function DeleteProduct(productId: number) {
  // First deletes all existing happy hour timestamps for the product to avoid dangling references
  // Then marks the product as deleted by setting is_deleted to 1
  // This approach preserves historical sales data while removing the product from active listings
  await runAsync("DELETE FROM happy_hours WHERE product_id = $id", { $id: productId });
  await runAsync("UPDATE products SET is_deleted = 1 WHERE id = $id", { $id: productId });
}

// Function to get sales data, optionally filtered by a condition and parameters
// Joins sales with products to include product details in the sales data
export async function GetSales(condition?: string, params?: Record<string, any>): Promise<SaleStatistics[]> {
  return new Promise((resolve, reject) => {
    // May be possible to remove the join if not needed in the future
    let query = `SELECT * FROM sales LEFT JOIN products ON products.id = sales.product_id`;
    if (condition) {
      query += ` ${condition.trim()}`;
    }

    // Defines a type for the sales table rows for type safety in the db.all callback
    type database_sales = {id: number, transaction_id: number, product_id: number, quantity: number, price_per_unit: number, total_price: number, is_prize: 1 | 0, is_happy_hour_purchase: 1 | 0, sale_date: string, loss: 1 | 0}

    // db.all retrieves all rows from the sales table (with optional condition) that match the query provided
    // A callback function is provided to handle the result or any error that occurs during the query
    db.all<database_sales>(query, params, async (error, rows) => {
      if (error) {
        //log.info("Error fetching sales:", error);
        reject(error);
        return;
      }
      // Maps each row to a SaleStatistics type, including fetching product details for each sold product
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

// Function to add a new sale to the database, including all sold products in the sale
// Inserts each sold product as a new row in the sales table
// The Sale object contains an array of sold products, each with its own details
// This loop inserts each sold product into the sales table
// Uses the transactionId to link multiple products sold in the same sale
// If it's the first product in the sale, a new transactionId is created and used for subsequent products
export async function AddSale(sale: Sale): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      // db.run("BEGIN TRANSACTION");
      try {
        let transactionId: number | undefined;
        for (const [i, { product, quantity, price, is_prize, is_happy_hour_purchase, loss }] of sale.soldProducts.entries()) {
          if (i === 0) {
            // Inserts a sale without transactionId for the first product to get the last inserted ID in sales database as transactionId
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

            // Updates the first inserted sale with the transactionId to link it to subsequent products in the same sale
            if (!transactionId) throw new Error("Failed to get transaction ID");
            await runAsync("UPDATE sales SET transaction_id = $transaction_id WHERE id = $id",
              {
                $transaction_id: transactionId,
                $id: transactionId
              }
            )
          } else {
            // Inserts subsequent products in the sale with the same transactionId
            if (!transactionId) throw new Error("Transaction ID is undefined for subsequent products");
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

// Function to update product stock based on a sale
export async function UpdateProductStock(sale: Sale): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      // db.run("BEGIN TRANSACTION");
      try {
        for (const { product, quantity } of sale.soldProducts) {
          // Decreases the stock of each product sold in the sale by the quantity sold
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

// Function to verify user login credentials
export function Login(username: string, password: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Fetches a user from the users table matching the provided username and password
    db.get<{id: number}|undefined>("SELECT * FROM users WHERE username = $username AND password = $password", { $username: username, $password: password }, (error, row) => {
      if (error) {
        //log.info("Error during login:", error);
        reject(error);
        return;
      }
      // If a row is found, the credentials are valid; otherwise, they are invalid
      if (row) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Function to export the current database to a user-specified location
// Opens a save dialog for the user to choose the export location
// Copies the current database file to the chosen location
// Ensures the exported file has a .db extension
// Sets the modification time of the exported file to the current time
// Provides user feedback on success or failure of the export operation
export async function ExportDatabase(window: Electron.BrowserWindow): Promise<void> {
  try {
    // Opens a save dialog for the user to choose the export location
    const result = await dialog.showSaveDialog(window, {
      title: "Download path for database",
      properties: ["createDirectory", "showOverwriteConfirmation"],
      defaultPath: "database.db",
      filters: [
        { name: "Database Files", extensions: ["db"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    // Checks if the user canceled
    if (result.canceled) { return; }

    // Checks if the user provided an invalid file path
    if (!result.filePath || result.filePath === "") {
      dialog.showErrorBox("Exportering af database", "Denne filsti er desværre ikke valid");
      return;
    }

    // Ensure the file has .db extension
    let exportPath = result.filePath;
    if (!exportPath.endsWith('.db')) {
      exportPath += '.db';
    }

    // Copies the current database file to the chosen location
    fs.copyFile(dbPath, exportPath, (err) => {
      if (err) {
        dialog.showErrorBox("Exportering af database", "Der opstod desværre en fejl ved exportering af database");
      } else {
        // Set the "date modified" timestamp to the current time
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
    // If any error occurs during the process, show an error dialog
    dialog.showErrorBox("Exportering af database", "Fejl");
    return;
  }
}

// Function to import the initial database by overwriting the current database file
export async function ImportDatabase(window: Electron.BrowserWindow) {
  // Uses the built in dialog showOpenDialog to let the user select a database from their own PC
  const result = await dialog.showOpenDialog(window, {
    title: "Vælg database", 
    filters: [
      {name: 'Database', extensions: ['db']}
    ],
    properties: [
      'openFile',
      'dontAddToRecent'
    ]
  });
  // Checks if the user canceled
  if (result.canceled) { return false; }

  // Checks that a proper file is chosen
  if (result.filePaths.length === 0 || result.filePaths[0] === "" || !result.filePaths[0].endsWith('.db')) {
    dialog.showErrorBox("Importering af database", "Denne fil er desværre ikke valid");
    return false;
  }

  // Checks that the database structure is valid
  const isValidStructure = await CheckDatabaseStructure(result.filePaths[0]);
  if (!isValidStructure) {
    dialog.showErrorBox("Importering af database", "Databasen har ikke den nødvendige struktur");
    return false;
  }

  // Copies the file from the user PC to the dbPath defined in the top of this file
  try {
    fs.copyFileSync(result.filePaths[0], dbPath);
  } catch {
    return false;
  }
  return true;
}

// Function to delete all data from the database
export function ResetDatabase() {
  // Adds an alert to make sure the user wants to reset the database. They have the posibility to cancel
  const confirmed = window.confirm("Er du sikker på at du vil nulstille databasen? Husk at gemme den gamle version først.");
  if (!confirmed) {
    return;
  }

  // List of all table names
  const tableNames = ["products", "sales", "happy_hours", "users", "lan_dates", "settings"];
  // Delete all data from all the tables
  for (const tableName of tableNames) {
    runAsync(`DELETE FROM ${tableName}`, {});
  }
}

// Function to fetch all the LAN dates from the database (The async and promise is not needed technically)
export async function GetLanDates() {
  return new Promise((resolve, reject) => {
    // Fetches all the rows in the lan_dates table
    db.all<LanDatesType>("SELECT start_date, end_date FROM lan_dates", (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      // Maps each row as a LanDatesType to in the end return a list of LanDatesType to the lanDates variable
      const lanDates = rows.map((row: any): LanDatesType => ({
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date)
      }));

      // Resolves the promise with the list of lan dates
      resolve(lanDates);
    });
  })
}

// Function to update the lan dates in the database
export async function UpdateLanDates(lanDates: LanDatesType[]) {
  return new Promise(async (resolve, reject) => {
    try {
      // Clears the database table to be able to insert all dates without needing to check for duplicates
      await runAsync("DELETE FROM lan_dates", {});

      // Goes through every item in the lanDates list and adds it to the database
      for (const {startDate, endDate} of lanDates) {
        await runAsync("INSERT INTO lan_dates(start_date, end_date) VALUES($start_date, $end_date)", {
          $start_date: startDate,
          $end_date: endDate
        });
      }
    } catch (error) {
      reject(error);
    }
    resolve(true);
  });
}

// Check if a database has the nessessary table structure
async function CheckDatabaseStructure(alt_dbPath: string) {
  // Establishes a temporary connection to the alternative database file
  const alt_db = new sqlite3.Database(alt_dbPath, (err) => {
    if (err) {
      //log.info('Database opening error: ', err); // Uncomment to enable logging
      return false;
    } else {
      //log.info("Database opened successfully"); // Uncomment to enable logging
    }
  });

  // Defines a list of required tables and their essential columns
  const tableRequirements: {tableName: string, requiredColumns: string[]}[] = [
    { tableName: "products", requiredColumns: ["id", "barcode", "brand", "name", "price", "bought_price", "stock", "happy_hour_price", "is_deleted", "image"] },
    { tableName: "sales", requiredColumns: ["id", "transaction_id", "product_id", "quantity", "price_per_unit", "total_price", "is_prize", "is_happy_hour_purchase", "sale_date", "loss"] },
    { tableName: "happy_hours", requiredColumns: ["id", "product_id", "start_time", "end_time"] },
    { tableName: "users", requiredColumns: ["id", "username", "password"] },
    { tableName: "lan_dates", requiredColumns: ["id", "start_date", "end_date"] },
    { tableName: "settings", requiredColumns: ["id", "key", "value"] },
  ]

  // Checks each table for existence and required columns
  for (const {tableName, requiredColumns} of tableRequirements) {
    // Checks if the table exists
    const tableExists: boolean = await new Promise((resolve, reject) => {
      alt_db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
        if (err) {
          reject(err);
          return false;
        }
        resolve(!!row);
      });
    });

    if (!tableExists) {
      // If the table doesn't exist, log an error and return
      //log.info(`Table ${tableName} is missing from the database`); // Uncomment to enable logging
      return false;
    }

    // Checks if the table has the required columns
    const columns: string[] = await new Promise((resolve, reject) => {
      alt_db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) {
          reject(err);
          return false;
        }
        resolve(rows.map((row: any) => row.name));
      });
    });

    for (const column of requiredColumns) {
      if (!columns.includes(column)) {
        // If a required column is missing, log an error
        //log.info(`Table ${tableName} is missing required column ${column}`); // Uncomment to enable logging
        return false;
      }
    }
  }

  // Closes the temporary database connection
  alt_db.close((err) => {
    if (err) {
      //log.info('Error closing database: ', err); // Uncomment to enable logging
    } else {
      //log.info("Database closed successfully"); // Uncomment to enable logging
    }
  });
  return true;
}