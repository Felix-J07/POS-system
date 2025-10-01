import { Link } from 'react-router';
import './static/Checkout.css';
import { AddSale, UpdateProductStock } from './database';

// TypeScript type checking for props
type Props = {
    sale: Sale | null,
    setSales: React.Dispatch<React.SetStateAction<Sale | null>>,
    setCart: React.Dispatch<React.SetStateAction<CartType>>,
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>
};

// Checkout component for user to accept payment
function Checkout({ sale, setCart, setProducts }: Props) {
    // If no sale is provided, display a message
    if (!sale) {
        return <div className="checkout-container"><h2>Ingen varer i kurven</h2></div>;
    }

    // Function to confirm payment, reset cart, add sale, and update product stock
    async function confirmPayment() {
        setCart({ cartProducts: [] as CartType['cartProducts'], totalPrice: 0 });
        if (sale) {
            await AddSale(sale);
            await UpdateProductStock(sale, setProducts);
        }
    }

    // Render the checkout component
    // Display sale items and total price, with a button to confirm payment
    // The confirm button runs confirmPayment function on click and navigates back to the main page
    return (
        <div className="checkout-container">
            <h2>Betaling</h2>
            <div className="cart-items">
                {sale.soldProducts.map(({ product, quantity, price }) => (
                    <div key={product.id} className="cart-item">
                        <span>{product.name}</span>
                        <span>{quantity} x {price.toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <div className="total-price-container">
                <span>Total pris: </span>
                <span>{sale.total_sale_price.toFixed(2)} kr</span>
            </div>
            <Link to="/" style={{ color: 'white' }} onClick={confirmPayment}><button id="confirm-button">Bekræft betaling</button></Link>
        </div>
    );
}

export default Checkout;