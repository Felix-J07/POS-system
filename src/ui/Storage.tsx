import { GetProducts } from "./database";
import { GetPrice } from './helpers';
import './static/Storage.css';
import { Card } from "./product_card";
import { CirclePlus } from 'lucide-react';
import { useState } from "react";
import { ProductModal } from "./product_modal";

type StorageProps = {
    products: Product[],
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

function Storage({ products, setProducts }: StorageProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const emptyProduct = {id: -1, barcode: "", brand: "", name: "", price: 0, stock: 0, happy_hour_price: 0, happy_hour_timestamps: []};

    return (
        <>
            <div className="storage-container">
                <div className="storage-header">
                    <h2>Varelager</h2>
                    <div className="storage-reload">
                        <button className="update-products" onClick={() => GetProducts({ setProducts })}>Opdater Produktliste</button>
                    </div>
                </div>
                <div className="product-list">
                    <div className="product-card" onClick={() => {
                            setModalVisible(true);
                            setSelectedProduct(emptyProduct);
                        }}>
                        <h3>Tilføj Produkt</h3>
                        <CirclePlus className="product-image" style={{ background: 'none', marginBottom: '30px' }} />
                        
                    </div>
                    {products.map((product) => (
                        Card(product, () => {
                            setModalVisible(true);
                            setSelectedProduct(product);
                        })
                    ))}
                </div>
            </div>
            {modalVisible && selectedProduct && ProductModal({ selectedProduct, setSelectedProduct, setModalVisible, setProducts })}
        </>
    );
}

export default Storage;