export function GetProducts({ setProducts }: { setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
    window.electron.get_products().then((products: Product[]) => {
        if (products === undefined) {
            console.error("Products is undefined in ProductShowcase.tsx");
            return;
        }
        setProducts(products);
    });
}

export function AddProduct(product: Product, setProducts: React.Dispatch<React.SetStateAction<Product[]>>) {
    window.electron.add_product(product).then(() => GetProducts({ setProducts }));
}

export function UpdateProduct(product: Product, setProducts: React.Dispatch<React.SetStateAction<Product[]>>) {
    window.electron.update_product(product).then(() => GetProducts({ setProducts }));
}

export function DeleteProduct(productId: number, setProducts: React.Dispatch<React.SetStateAction<Product[]>>) {
    window.electron.delete_product(productId).then(() => GetProducts({ setProducts }));
}

export async function GetSales(setSaleStatistics: React.Dispatch<React.SetStateAction<SaleStatistics[]>>, condition?: string, params?: Object) {
    window.electron.get_sales(condition, params).then((sales: SaleStatistics[]) => setSaleStatistics(sales));
}

export function AddSale(sale: Sale) {
    window.electron.add_sale(sale);
}

export function UpdateProductStock(sale: Sale, setProducts: React.Dispatch<React.SetStateAction<Product[]>>) {
    window.electron.update_product_stock(sale).then(() => GetProducts({ setProducts }));
}

export function ExportDatabase() {
    window.electron.export_database();
}