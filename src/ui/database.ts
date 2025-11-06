// Fetching products from the database and adding them to the product list state
export function GetProducts({ setProducts }: { setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
    window.electron.get_products().then((products: Product[]) => {
        // Safety check to ensure the database is returning products
        if (products === undefined) {
            console.error("Fejl i databasen (produkter)");
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
    window.electron.get_sales(condition, params).then((sales: SaleStatistics[]) => {
        // Safety check to ensure the database is returning sales
        if (sales === undefined) {
            console.log("Fejl i databasen (salg)");
            return;
        }
        // Update the state with the fetched sales
        setSaleStatistics(sales);
    });
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

// Lets the user import a database file into the application (AppData on the PC)
export function ImportDatabase() {
    // Add an alert where the user confirms or denies the import
    const confirmed = window.confirm("Er du sikker på at du vil importere databasen? Databasen vil blive overskrevet.");
    if (!confirmed) {
        return;
    }

    window.electron.import_database();
}

export function GetLanDates(setLanDates: React.Dispatch<React.SetStateAction<LanDatesType[]>>) {
    window.electron.get_lan_dates().then((lanDates: LanDatesType[]) => {
        if (lanDates === undefined) {
            console.log("Fejl i databasen (LAN datoer)");
            return;
        }
        // Update the state with the fetched lan dates
        setLanDates(lanDates);
    })
}

export function UpdateLanDates(lanDates: LanDatesType[], setLanDates: React.Dispatch<React.SetStateAction<LanDatesType[]>>) {
    window.electron.update_lan_dates(lanDates).then(() => GetLanDates(setLanDates));
}