import './static/Checkout.css';

type Props = {
    cart: CartType,
    setCart: React.Dispatch<React.SetStateAction<CartType>>,
    sale: Sale | null,
    setSales: React.Dispatch<React.SetStateAction<Sale | null>>,
}

function Checkout({ cart, setCart, sale, setSales }: Props) {
    if (!sale) {
        return <div className="checkout-container"><h2>Ingen varer i kurven</h2></div>;
    }
    return (
        <div className="checkout-container">
            <h2>Betaling</h2>
            <div className="cart-items">
                {cart.cartProducts.map(({ product, amount }) => (
                    <div key={product.id} className="cart-item">
                        <span>{product.name}</span>
                        <span>{amount} x {product.price.toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <div className="total-price-container">
                <span>Total pris: </span>
                <span>{cart.totalPrice.toFixed(2)} kr</span>
            </div>
            <button id="confirm-button">Bekræft betaling</button>
        </div>
    );
}

export default Checkout;