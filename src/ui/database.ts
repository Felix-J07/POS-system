export function GetProducts({ setProducts }: { setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
    window.electron.get_products().then((products: Product[]) => {
        if (products === undefined) {
            console.error("Products is undefined in ProductShowcase.tsx");
            return;
        }
        setProducts(products);
    });
}