import { GetProducts } from "./database";
import './static/storage.css';
import { Card } from "./product_card";
import { CirclePlus } from 'lucide-react';

type Props = {
    products: Product[],
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

function Storage({ products, setProducts }: Props) {
    return (
        <div className="storage-container">
            <div className="storage-header">
                <h2>Varelager</h2>
                <div className="storage-reload">
                    <button className="update-products" onClick={() => GetProducts({ setProducts })}>Opdater Produktliste</button>
                </div>
            </div>
            <div className="product-list">
                <div className="product-card" onClick={() => {/* Modal for adding product */}}>
                    <h3>Tilføj Produkt</h3>
                    <CirclePlus className="product-image" style={{ background: 'none', marginBottom: '30px' }} />
                    
                </div>
                {products.map((product) => (
                    Card(product, () => {/*ProductModal(product)*/})
                ))}
            </div>
        </div>
    );
}

function ProductModal(product: Product) {
    return (
        <div className="product-modal">
            <h2>Rediger Produkt</h2>
            <form className="product-form">
                <label>
                    Navn:
                    <input type="text" defaultValue={product.name} />
                </label>
                <label>
                    Mærke:
                    <input type="text" defaultValue={product.brand} />
                </label>
                <label>
                    Stregkode:
                    <input type="text" defaultValue={product.barcode} />
                </label>
                <label>
                    Pris:
                    <input type="number" step="0.01" defaultValue={product.price} />
                </label>
                <label>
                    Lager:
                    <input type="number" defaultValue={product.stock} />
                </label>
                <label>
                    Billede URL:
                    <input type="text" defaultValue={product.image} />
                </label>
                <div className="product-form-buttons">
                    <button type="submit" className="save-button">Gem</button>
                    <button type="button" className="cancel-button">Annuller</button>
                </div>
            </form>
        </div>
    );
}

export default Storage;