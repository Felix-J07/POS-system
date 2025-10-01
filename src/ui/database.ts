// Fetching products from the database and adding them to the product list state
export function GetProducts({ setProducts }: { setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
    window.electron.get_products().then((products: Product[]) => {
        // Safety check to ensure the database is returning products
        if (products === undefined) {
            console.error("Products is undefined in ProductShowcase.tsx");
            return;
        }
        // Update the state with the fetched products
        setProducts(products);
    });
}

// Adding a new product to the database and refreshing the product list state
export function AddProduct(product: Product, setProducts: React.Dispatch<React.SetStateAction<Product[]>>) {
    window.electron.add_product(product).then(() => GetProducts({ setProducts }));
}

// Updating an existing product in the database and refreshing the product list state
export function UpdateProduct(product: Product, setProducts: React.Dispatch<React.SetStateAction<Product[]>>) {
    window.electron.update_product(product).then(() => GetProducts({ setProducts }));
}

// Deleting a product from the database and refreshing the product list state
export function DeleteProduct(productId: number, setProducts: React.Dispatch<React.SetStateAction<Product[]>>) {
    window.electron.delete_product(productId).then(() => GetProducts({ setProducts }));
}

// Fetching sales from the database and adding them to the sales statistics state
export async function GetSales(setSaleStatistics: React.Dispatch<React.SetStateAction<SaleStatistics[]>>, condition?: string, params?: Object) {
    window.electron.get_sales(condition, params).then((sales: SaleStatistics[]) => setSaleStatistics(sales));
}

// Adding a new sale to the database
export function AddSale(sale: Sale) {
    window.electron.add_sale(sale);
}

// Updating product stock based on a sale and refreshing the product list state
export function UpdateProductStock(sale: Sale, setProducts: React.Dispatch<React.SetStateAction<Product[]>>) {
    window.electron.update_product_stock(sale).then(() => GetProducts({ setProducts }));
}

// Exporting the database as a backup file on the user's computer
export function ExportDatabase() {
    window.electron.export_database();
}

// Temporary way of updating the database in AppData on user's computer
// In the future, this should be replaced with a proper file dialog to select the database file on the user's computer
export function ImportDatabase() {
    // Add an alert where the user confirms or denies the import
    const confirmed = window.confirm("Er du sikker på at du vil importere databasen? Databasen vil blive overskrevet.");
    if (!confirmed) {
        return;
    }

    window.electron.import_database();
}