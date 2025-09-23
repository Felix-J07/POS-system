import './static/product_card.css';
import { GetPriceAndHappyHour } from './helpers'

export function Card(product: Product, onClick?: () => void): React.JSX.Element {
    return (
        <div className="product-card" key={product.id} onClick={onClick}>
            <span className="product-id" hidden>{product.id}</span>
            <p className="product-barcode">Stregkode: {product.barcode}</p>
            <img src={product.image || "alt_img.png"} alt={product.name} className="product-image" />
            <div className="product-info">
                <p className="product-brand">{product.brand}</p>
                <p className="product-name">{product.name}</p>
                <div className="product-stock-and-price">
                    <span className="product-stock">På lager: {product.stock}</span>
                    <span className="product-price">Pris: {GetPriceAndHappyHour(product)[0].toFixed(2)} kr</span>
                </div>
            </div>
        </div>
    );
}