import { AddToCart } from './Cart';
import './static/ProductShowcase.css';
import { GetProducts } from './database';
import { Card } from './product_card';

type ProductShowcaseProps = {
    products: Product[];
    cart: CartType;
    setCart: React.Dispatch<React.SetStateAction<CartType>>;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

function ProductShowcase({ products, cart, setCart, setProducts }: ProductShowcaseProps) {
    return (
        <div className="product-showcase">
            <div className="product-showcase-header">
                <h2>Produkter:</h2>
                <div className="product-showcase-reload">
                    <button className="update-products" onClick={() => GetProducts({ setProducts })}>Opdater Produktliste</button>
                </div>
            </div>
            <div className="product-grid">
                {products.map((product) => ( 
                    Card(product, () => AddToCart(product, cart, setCart))
                ))}
            </div>
        </div>
    );
}

export default ProductShowcase;