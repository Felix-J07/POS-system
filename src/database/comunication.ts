import * as sqlite3 from "sqlite3"
import type { Product, Sale, SaleStatistics, HappyHourProduct } from "../types.ts"

let db = new sqlite3.Database('./database.db');

export function AddSales(sale: Sale) {
    db.serialize(() => {
        sale.soldProducts.forEach((soldProduct) => {
            db.run("INSERT INTO sales (product_id, quantity, total_price) VALUES ($productid, $quantity, $totalprice)", {
                $productid: soldProduct.product.id,
                $quantity: soldProduct.quantity,
                $totalprice: soldProduct.price * soldProduct.quantity
            });
        });
    });
}

export function GetSales(): Promise<SaleStatistics[]> {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM sales", async (error, rows) => {
        if (error) {
            reject(error);
            return;
        }

        try {
            const sales: SaleStatistics[] = await Promise.all(
                rows.map(async (row: any) => ({
                    id: row.id,
                    datetime: row.sale_date,
                    total_sale_price: row.total_price,
                    soldProduct: {
                        product: await GetProduct(row.product_id), // async call
                        quantity: row.quantity,
                        price: row.total_price / row.quantity,
                    },
                }))
            );
            resolve(sales);
        } catch (err) {
            reject(err);
        }
        });
    });
}


function GetProduct(id: number): Promise<Product> {
    return new Promise((resolve, reject) => {
    db.get("SELECT * FROM products WHERE id = $id", { $id: id }, (error, row: any) => {
      if (error) {
        reject(error);
        return;
      }

      const product: Product = {
        id: row.id,
        barcode: row.barcode,
        brand: row.brand,
        name: row.name,
        price: row.price,
        stock: row.stock,
        happy_hour_price: row.happy_hour_price,
        image: row.image ?? null,
      };

      resolve(product);
    });
  });
}

export function GetProducts(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM products", (error, rows) => {
            if (error) {
                console.error("Error fetching products:", error);
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

export function AddProduct(product: Product, note: string, edit: boolean = false) {
    db.serialize(() => {
        if (edit) {
            db.run("DELETE FROM products WHERE id = $id", { $id: product.id });
        }
        db.run("INSERT INTO products(barcode, brand, name, price, stock, happy_hour_price, image) VALUES($barcode, $brand, $name, $price, $stock, $happy_hour_price, $image)", {
            $barcode: product.barcode,
            $brand: product.brand,
            $name: product.name,
            $price: product.price,
            $stock: product.stock,
            $happy_hour_price: product.happy_hour_price,
            $image: product.image ?? ""
        });

        if (note) {
            db.run("DELETE FROM notes WHERE product_id = $id", { $id: product.id });
            db.run("INSERT INTO notes(product_id, note) VALUES ($product_id, $note)", {
                $product_id: product.id,
                $note: note
            });
        }
    });
}

export function GetHappyHours(product: Product): Promise<HappyHourProduct> {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM happy_hours WHERE product_id = $id", { $id: product.id }, (error, rows) => {
            if (error) {
                reject(error);
                return;
            }

            const timestamps: { startTime: Date, endTime: Date}[] = rows.map((row: any) => ({
                startTime: new Date(row.start_time),
                endTime: new Date(row.end_time)
            }));

            resolve({
                product: product,
                timestamps: timestamps
            });
        });
    });
}

export function AddHappyHour(product: Product, startTime: Date, endTime: Date) {
    db.run("INSERT INTO happy_hours(product_id, start_time, end_time) VALUES ($product_id, $start_time, $end_time)", {
        $product_id: product.id,
        $start_time: startTime.toISOString(),
        $end_time: endTime.toISOString()
    });
}