import { Trash, Plus } from 'lucide-react';
import { AddProduct, UpdateProduct, DeleteProduct, GetProducts } from './database';
import './static/product_modal.css';
import type { JSX } from 'react';
import { formatDate } from './helpers';
import { useState } from 'react';

// Props for ProductModal for type checking
type ProductModalProps = {
    selectedProduct: Product,
    setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>,
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

// Content in the Modal function for when the user adds a new product or edits an existing product
export function ProductModal({ selectedProduct, setSelectedProduct, setModalVisible, setProducts }: ProductModalProps): JSX.Element {
    // Set a temporary state for the happy hour timestamps of the selected product to not directly modify the selected product state
    const [tempHappyHourTimestamps, setTempHappyHourTimestamps] = useState(selectedProduct.happy_hour_timestamps);

    // Update the timestamp list when user changes a timestamp
    function updateTimestamp(index: number, field: 'startTime' | 'endTime', value: string) {
        if (!selectedProduct) return;
        const updatedTimestamps = tempHappyHourTimestamps.map((ts, i) =>
            i === index ? { ...ts, [field]: new Date(value) } : ts
        );
        setTempHappyHourTimestamps(updatedTimestamps);
    }

    // Removing a timestamp from the list when the trash icon is pressed
    function removeTimestamp(index: number) {
        const updatedTimestamps = tempHappyHourTimestamps.filter((_, i) => i !== index);
        setTempHappyHourTimestamps(updatedTimestamps);
    }

    // Adding a new timestamp to the list when the add button is pressed
    function addTimestamp() {
        if (!selectedProduct) return;
        // Add a new timestamp with current time as start and end time
        const newTimestamp = { startTime: new Date(), endTime: new Date() };
        // Update the selected product with the new timestamp
        setTempHappyHourTimestamps(prev => {
            // If no previous state, return early
            if (!prev) return prev;
            // Update the product with the new timestamp
            return [...prev, newTimestamp];
        });
    }

    // Handle form submission when user saves the product
    function HandleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent the page from reloading
        event.preventDefault();

        // Saves the submitted form as a FormData object
        const form = new FormData(event.target as HTMLFormElement);

        // Get all happy hour timestamps from the form
        // Each timestamp has a start and end time input field
        // The index of each timestamp is stored in a hidden input field
        // This allows for dynamic number of timestamps
        // Validate timestamps before saving
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

        // Create updated product object from the form data
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

        // If the id of the selected product is a number that is not -1, the product will be updated in the database
        // Otherwise add the product to the database as a new product
        if (selectedProduct.id && selectedProduct.id !== -1) {
            UpdateProduct(updatedProduct, setProducts);
        } else {
            AddProduct(updatedProduct, setProducts);
        }
        // Closes the modal
        setModalVisible(false);
    }

    // Delete the selected product from the database and close the modal
    const deleteProduct = (productId: number) => {
        DeleteProduct(productId, setProducts);
        setModalVisible(false);
    }
    
    // A form with input fields to add all the needed information about a product
    // Some of the input fields are "required" fields while others are not
    // There are cancel, delete and save buttons in the bottom of the form
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
                <input type="number" min="0" step="0.01" defaultValue={selectedProduct.bought_price} name="bought_price" />
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
                {tempHappyHourTimestamps.map((ts, index) => (
                    <div key={index} className="timestamp-row">
                        <input name="timestamp_index" type="hidden" value={index} />
                        <input
                            type="datetime-local"
                            value={formatDate(ts.startTime, 'datetime')}
                            onChange={(e) => updateTimestamp(index, 'startTime', e.target.value)}
                            name={`startTime_${index}`}
                        />
                    <span>→</span>
                    <input
                        type="datetime-local"
                        value={formatDate(ts.endTime, 'datetime')}
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