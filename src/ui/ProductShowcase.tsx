import { AddToCart } from './Cart';
import './static/ProductShowcase.css';

type ProductShowcaseProps = {
    products: Product[];
    cart: CartType;
    setCart: React.Dispatch<React.SetStateAction<CartType>>;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

function ProductShowcase({ products, cart, setCart, setProducts }: ProductShowcaseProps) {
    const updateProducts = () => {
        // @ts-ignore
        window.electron.get_products().then((products: Product[]) => {
            console.log("ProductShowcase.tsx:", products);
            if (products === undefined) {
                console.error("Products is undefined in ProductShowcase.tsx");
                return;
            }
            setProducts(products);
        });
    };

    return (
        <div className="product-showcase">
            <div className="product-showcase-header">
                <h3>Produkter:</h3>
                <div className="product-showcase-reload">
                    <button className="update-products" onClick={updateProducts}>Opdater Produktliste</button>
                </div>
            </div>
            <div className="product-grid">
                {products.map((product) => (
                    Card(product, cart, setCart)
                ))}
            </div>
        </div>
    );
}

function Card(product: Product, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>): React.JSX.Element {
    return (
        <div className="product-card" key={product.id} onClick={() => AddToCart(product, cart, setCart)}>
            <span className="product-id" hidden>{product.id}</span>
            <p className="product-barcode">Stregkode: {product.barcode}</p>
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-info">
                <p className="product-brand">{product.brand}</p>
                <p className="product-name">{product.name}</p>
                <div className="product-stock-and-price">
                    <span className="product-stock">På lager: {product.stock}</span>
                    <span className="product-price">Pris: {product.price.toFixed(2)} kr</span>
                </div>
            </div>
        </div>
    );
}

export default ProductShowcase;