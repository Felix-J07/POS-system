import { Trash, Plus } from 'lucide-react';
import { AddProduct, UpdateProduct, DeleteProduct } from './database';
import './static/product_modal.css';
import type { JSX } from 'react';


type ProductModalProps = {
    selectedProduct: Product,
    setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>,
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

export function ProductModal({ selectedProduct, setSelectedProduct, setModalVisible, setProducts }: ProductModalProps): JSX.Element {
    // Helper to update a timestamp in selectedProduct
    function updateTimestamp(index: number, field: 'startTime' | 'endTime', value: string) {
        if (!selectedProduct) return;
        const updatedTimestamps = selectedProduct.happy_hour_timestamps.map((ts, i) =>
            i === index ? { ...ts, [field]: new Date(value) } : ts
        );
        setSelectedProduct({ ...selectedProduct, happy_hour_timestamps: updatedTimestamps });
    }

    // Dummy implementations for removeTimestamp and addTimestamp to avoid errors
    function removeTimestamp(index: number) {
        if (!selectedProduct) return;
        const updatedTimestamps = selectedProduct.happy_hour_timestamps.filter((_, i) => i !== index);
        setSelectedProduct({ ...selectedProduct, happy_hour_timestamps: updatedTimestamps });
    }

    function addTimestamp() {
        const newTimestamp = { startTime: new Date(), endTime: new Date() };
        setSelectedProduct(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                happy_hour_timestamps: [
                    ...prev.happy_hour_timestamps,
                    newTimestamp
                ]
            };
        });
    }

    function HandleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = new FormData(event.target as HTMLFormElement);

        let happy_hour_timestamps: { startTime: Date, endTime: Date }[] = [];
        form.getAll("timestamp_index").forEach((indexStr) => {
            const index = Number(indexStr);
            const startTimeStr = form.get(`startTime_${index}`) as string;
            const endTimeStr = form.get(`endTime_${index}`) as string;
            if (startTimeStr && endTimeStr) {
                const startTime: Date = new Date(startTimeStr);
                let endTime: Date = new Date(endTimeStr);
                if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                    // Invalid date, skip this timestamp
                    return;
                }
                else if (endTime < startTime) {
                    // End time is before or equal to start time, skip this timestamp
                    endTime = startTime;
                }
                happy_hour_timestamps.push({
                    startTime: startTime,
                    endTime: endTime
                });
            }
        });

        const updatedProduct: Product = {
            id: selectedProduct.id,
            barcode: form.get("barcode") as string,
            brand: form.get("brand") as string,
            name: form.get("name") as string,
            price: parseFloat(form.get("price") as string) || 0,
            bought_price: selectedProduct.bought_price,
            stock: parseInt(form.get("stock") as string) || 0,
            image: form.get("image") as string,
            happy_hour_timestamps: happy_hour_timestamps,
            happy_hour_price: parseFloat(form.get("happy_hour_price") as string) || 0,
        }

        // Update the database and refresh product list
        if (selectedProduct.id && selectedProduct.id !== -1) {
            UpdateProduct(updatedProduct, setProducts);
        } else {
            AddProduct(updatedProduct, setProducts);
        }
        setModalVisible(false);
    }

    const deleteProduct = (productId: number) => {
        DeleteProduct(productId, setProducts);
        setModalVisible(false);
    }
    
    return (
        <form className="product-form" onSubmit={HandleFormSubmit} onKeyDown={e => e.key === 'Enter' && e.preventDefault()}>
            <label>
                Navn:
                <input type="text" defaultValue={selectedProduct.name} name="name" required />
            </label>
            <label>
                Mærke:
                <input type="text" defaultValue={selectedProduct.brand} name="brand" required />
            </label>
            <label>
                Stregkode:
                <input type="text" defaultValue={selectedProduct.barcode} name="barcode" required />
            </label>
            <label>
                Pris:
                <input type="number" min="0" step="0.01" defaultValue={selectedProduct.price} name="price" required />
            </label>
            <label>
                Pris for køb af vare:
                <input type="number" defaultValue={selectedProduct.bought_price} name="bought_price" />
            </label>
            <label>
                Lager:
                <input type="number" min="0" step="1" defaultValue={selectedProduct.stock} name="stock" required />
            </label>
            <label>
                Billede URL:
                <input type="text" defaultValue={selectedProduct.image} name="image" />
            </label>
            
            <div className="happy-hour-section">
                <label>
                    Happy hour pris:
                    <input type="number" min="0" step="0.01" defaultValue={selectedProduct.happy_hour_price} name="happy_hour_price" />
                </label>
                <h4>Happy Hour Tidsstempler</h4>
                {selectedProduct.happy_hour_timestamps.map((ts, index) => (
                    <div key={index} className="timestamp-row">
                        <input name="timestamp_index" type="hidden" value={index} />
                        <input
                            type="datetime-local"
                            value={formatDate(ts.startTime)}
                            onChange={(e) => updateTimestamp(index, 'startTime', e.target.value)}
                            name={`startTime_${index}`}
                        />
                    <span>→</span>
                    <input
                        type="datetime-local"
                        value={formatDate(ts.endTime)}
                        onChange={(e) => updateTimestamp(index, 'endTime', e.target.value)}
                        name={`endTime_${index}`}
                    />
                    <Trash className="remove-timestamp" onClick={() => removeTimestamp(index)} />
                    </div>
                ))}
                <button type="button" className="add-timestamp" onClick={addTimestamp}><Plus /> Tilføj Happy Hour Tidsstempel</button>
            </div>

            <div className="product-form-buttons">
                {selectedProduct.id && selectedProduct.id !== -1 && (
                    <button type="button" className="delete-button" onClick={() => deleteProduct(selectedProduct.id)}>Slet</button>
                )}
                    <button type="submit" className="save-button">Gem</button>
                <button type="button" className="cancel-button" onClick={() => setModalVisible(false)}>Annuller</button>
            </div>
        </form>
    );
}

function formatDate(date: string | number | Date ): string {
    // Converts a date to 'YYYY-MM-DDTHH:mm' format for datetime-local input
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}