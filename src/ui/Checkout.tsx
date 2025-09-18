import { Link } from 'react-router';
import './static/Checkout.css';
import { AddSale, UpdateProductStock } from './database';

type Props = {
    sale: Sale | null,
    setSales: React.Dispatch<React.SetStateAction<Sale | null>>,
    setCart: React.Dispatch<React.SetStateAction<CartType>>,
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

function Checkout({ sale, setCart, setProducts }: Props) {
    if (!sale) {
        return <div className="checkout-container"><h2>Ingen varer i kurven</h2></div>;
    }

    async function confirmPayment() {
        setCart({ cartProducts: [] as CartType['cartProducts'], totalPrice: 0 });
        if (sale) {
            await AddSale(sale);
            await UpdateProductStock(sale, setProducts);
        }
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
            <Link to="/" style={{ color: 'white' }} onClick={confirmPayment}><button id="confirm-button">Bekræft betaling</button></Link>
        </div>
    );
}

export default Checkout;