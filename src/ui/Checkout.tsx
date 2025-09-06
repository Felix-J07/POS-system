import { Link } from 'react-router';
import './static/Checkout.css';

type Props = {
    sale: Sale | null,
    setSales: React.Dispatch<React.SetStateAction<Sale | null>>,
    setCart: React.Dispatch<React.SetStateAction<CartType>>,
}

function Checkout({ sale, setSales, setCart }: Props) {
    if (!sale) {
        return <div className="checkout-container"><h2>Ingen varer i kurven</h2></div>;
    }

    function confirmPayment() {
        setCart({ cartProducts: [] as CartType['cartProducts'], totalPrice: 0 });
    }

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
            <button id="confirm-button" onClick={confirmPayment}><Link to="/" style={{ color: 'white' }}>Bekræft betaling</Link></button>
        </div>
    );
}

export default Checkout;