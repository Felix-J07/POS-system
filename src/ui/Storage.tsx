import { AddSale, GetProducts } from "./database";
import './static/Storage.css';
import './static/product_loss.css';
import { Card } from "./product_card";
import { CirclePlus } from 'lucide-react';
import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { ProductModal } from "./product_modal";

// Props for the Storage component (type checking)
type StorageProps = {
    products: Product[],
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

// Show and manage product storage
// Add, edit, delete products
// Update product list from database
// Future: Add functionality to import/export product list as CSV. Add functionality to add lost products (products that are wasn't sold but were thrown away or given to LAN members)
function Storage({ products, setProducts }: StorageProps) {
    // Changes the main-container minWidth based on the page
    useEffect(() => {
        const element = document.querySelector(".main-container");
        if (element instanceof HTMLElement) {
            element.style.minWidth = "400px";
        }
    
        return () => {
            if (element instanceof HTMLElement) {
            element.style.minWidth = ""; // clean up on unmount
            }
        };
    }, []);

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [lossModalVisible, setLossModalVisible] = useState<boolean>(false);

    const emptyProduct = {id: -1, barcode: "", brand: "", name: "", price: 0, bought_price: 0, stock: 0, happy_hour_price: 0, happy_hour_timestamps: []};


    return (
        <>
            <div className="storage-container">
                <div className="storage-header">
                    <h2>Varelager</h2>
                    <div className="storage-reload">
                        <button className="update-products" onClick={() => GetProducts({ setProducts })}>Opdater Produktliste</button><br /><br />
                        <button className="add-product-loss" onClick={() => setLossModalVisible(true)}>Fjern usælgelige produkter</button>
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
            {modalVisible && selectedProduct && <Modal setModalVisible={setModalVisible} modal_content={<ProductModal selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} setModalVisible={setModalVisible} setProducts={setProducts} />} title={selectedProduct.id === -1 ? "Tilføj Produkt" : "Rediger Produkt"} />}
            {lossModalVisible && <Modal setModalVisible={setLossModalVisible} modal_content={<ProductLossDivs products={products} setProducts={setProducts} setLossModalVisible={setLossModalVisible} />} title="Tilføj tab af varer"/>}
        </>
    );
}

function ProductLossDivs({ products, setProducts, setLossModalVisible }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>>, setLossModalVisible: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [amounts, setAmounts] = useState<number[]>(Array(products.length).fill(0));

    function IncreaseAmount(index: number) {
        if (amounts[index] >= products[index].stock) {
            setAmounts(amounts.map((amt, i) => i === index ? products[index].stock : amt));
            return;
        }
        setAmounts(amounts.map((amt, i) => i === index ? amt + 1 : amt));
        return;
    }

    function ReduceAmount(index: number) {
        if (amounts[index] <= 0) {
            setAmounts(amounts.map((amt, i) => i === index ? 0 : amt));
            return;
        }
        setAmounts(amounts.map((amt, i) => i === index ? amt - 1 : amt));
        return;
    }

    function ConfirmLoss() {
        setLossModalVisible(false);
        let sale: Sale = { soldProducts: [], total_sale_price: 0, datetime: new Date().toISOString() };
        for (let i: number = 0; i < products.length; i++) {
            if (amounts[i] > 0) {
                sale.soldProducts.push({ product: products[i], quantity: amounts[i], price: 0, is_prize: 0, is_happy_hour_purchase: false, loss: true });
            }
        }
        if (sale.soldProducts.length > 0) {
            AddSale(sale, setProducts);
        }
    }

    return (
        <>
            {products.map((product: Product, index: number) => {
                if (product.stock > 0) {
                    return (
                        <div className="product-loss-div" key={product.id} id={`cart-product-${product.id}`}>
                            <img src={product.image || "alt_img.png"} alt={product.name} className="product-loss-image" />
                            <div className="product-loss-info">
                                <div className="product-loss-row product-loss-row-top">
                                    <div className="product-loss-name">
                                        <span className="product-loss-brand">{product.brand}</span>
                                        <span className="product-loss-title">{product.name}</span>
                                    </div>
                                </div>
                                <div className="product-loss-row product-loss-row-bottom">
                                    <div className="product-loss-qty">
                                        <button type="button" className="qty-btn"data-id={product.id} onClick={() => ReduceAmount(index)}>-</button>
                                        <input type="number" min="1" value={amounts[index].toFixed(0)} className="qty-input" disabled/>
                                        <button type="button" className="qty-btn"data-id={product.id} onClick={() => IncreaseAmount(index)}>+</button>
                                        <span style={ {color: 'red'} }> (Max: {product.stock})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                return null;
            })}
            <button className="product-loss-confirm" onClick={ConfirmLoss}>Bekræft tab af varer</button>
        </>
  );
}

export default Storage;