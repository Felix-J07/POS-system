import * as sqlite3 from "sqlite3"

let db = new sqlite3.Database('./database.db');

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