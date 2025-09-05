import './static/Cart.css'
import type React from 'react'
import { Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GetProducts } from './database';

type CartProps = {
  products: Product[];
  cart: CartType;
  setCart: React.Dispatch<React.SetStateAction<CartType>>;
  setSale: React.Dispatch<React.SetStateAction<Sale | null>>;
};

function Cart({ products, cart, setCart, setSale }: CartProps) {
  
  const { cartProducts, totalPrice } = cart;

  const barcodeInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const barcode = event.currentTarget.value;
    const barcodeSplittedArray: string[] = barcode.split("*");
    let amount: number = 1;
    if (barcode.includes("*")) {
      try {
        amount = parseInt(barcodeSplittedArray[0]);
      } catch (error) {
        console.log(error);
      }
      
    }

    const exists = products.some(product => String(product.barcode) === barcodeSplittedArray[1]);
    if (event.key === 'Enter' && exists) {
      const product = products.filter((product) => product.barcode === barcodeSplittedArray[1]);
      AddToCart(product[0], cart, setCart, amount);
      event.currentTarget.value = "";
    }

    event.currentTarget.style.borderColor = exists ? 'green' : 'red';
  };

  return (
    <>
      <div className="cart">
        <h3>Cart</h3>
        <input autoFocus type="text" name="barcode" id="barcodeCartInput" placeholder="Stregkode:" onKeyUp={barcodeInput}/>
        <div className="cart-products">
          {cartProducts.map(({product, amount}) => (
            productDiv(product, amount, cart, setCart)))}
        </div>
        <div className="cart-checkout">
          <p>Total Price: {totalPrice.toFixed(2)}</p>
          <div className="cart-checkout-buttons">
            <button type="button" id="clearCart" onClick={() => setCart({ cartProducts: [], totalPrice: 0 })}>Ryd kurven</button>
            <button type="button" id="checkout" onClick={() => setSale(SaleConvert(cart))}><Link to="/checkout" style={{ color: 'white' }}>Gå til betaling</Link></button>
          </div>
        </div>
      </div>
    </>
  );
}

function productDiv(product: Product, amount: number, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>): React.JSX.Element {
  const reduceAmount = () => {
    if (amount <= 1) {
      RemoveFromCart(product.id, cart, setCart);
      return;
    }
    cart.cartProducts.forEach((item) => {
      if (item.product.id === product.id) {
        item.amount -= 1;
        setCart({ cartProducts: cart.cartProducts, totalPrice: cart.totalPrice - GetPrice(product) });
      }
    });
  };
  const increaseAmount = () => {
    AddToCart(product, cart, setCart, 1);
  };
  const removeItem = () => {
    if (product.id !== null) {
      RemoveFromCart(product.id, cart, setCart);
    }
  };

  return (
    <div className="cart-product" key={product.id} id={`cart-product-${product.id}`}>
      <img src={product.image} alt={product.name} className="cart-product-image" />
      <div className="cart-product-info">
        <div className="cart-product-row cart-product-row-top">
          <div className="cart-product-name">
            <span className="cart-product-brand">{product.brand}</span>
            <span className="cart-product-title">{product.name}</span>
          </div>
          <Trash className="remove-button" onClick={removeItem}/>
        </div>
        <div className="cart-product-row cart-product-row-bottom">
          <div className="cart-product-qty">
            <button type="button" className="qty-btn"data-id={product.id} onClick={reduceAmount}>-</button>
            <input type="number" min="1" value={amount} className="qty-input" disabled/>
            <button type="button" className="qty-btn"data-id={product.id} onClick={increaseAmount}>+</button>
          </div>
          <div className="cart-product-price">
            Pris: {(GetPrice(product) * amount).toFixed(2)} kr
          </div>
        </div>
      </div>
    </div>
  );
}

function SaleConvert(cart: CartType) {
  if (cart.cartProducts.length < 1) return null;
  let sale: Sale = {
    datetime: new Date().toISOString(),
    total_sale_price: parseFloat(cart.cartProducts.reduce((sum, item) => sum + GetPrice(item.product) * item.amount, 0).toFixed(2)),
    soldProducts: cart.cartProducts.map(({ product, amount }) => ({
      product: product,
      quantity: amount,
      price: parseFloat(GetPrice(product).toFixed(2)) // Get the price at the time of sale
    }))
  }
  return sale;
}

function RemoveFromCart(productId: number, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>) {
  const { cartProducts } = cart; // Fetch current products in cart
  const updatedProducts = cartProducts.filter(item => item.product.id !== productId);
  const updatedTotalPrice = updatedProducts.reduce((sum, item) => sum + GetPrice(item.product) * item.amount, 0);
  setCart({ cartProducts: updatedProducts, totalPrice: updatedTotalPrice });
}

export function AddToCart(newProduct: Product, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>, amount?: number) {
  const index = cart.cartProducts.findIndex(cartproduct => cartproduct.product.id === newProduct.id);
  let updatedTotalPrice = cart.totalPrice;
  if (index === -1) {
    if (amount !== undefined && amount > 0) {
      updatedTotalPrice += GetPrice(newProduct) * amount;
    } else {
      amount = 1;
      updatedTotalPrice += GetPrice(newProduct);
    }
    setCart({ cartProducts: [{product: newProduct, amount: amount}, ...cart.cartProducts ], totalPrice: updatedTotalPrice})
  } else {
    newProduct = cart.cartProducts[index].product;
    let updatedAmount = cart.cartProducts[index].amount;
    if (amount !== undefined) {
      if (amount === 0) { return; }
      updatedAmount += amount;
      if (updatedAmount > newProduct.stock) {
        updatedAmount = newProduct.stock;
      } else if (updatedAmount < 1) {
        RemoveFromCart(newProduct.id, cart, setCart);
        return;
      }
      updatedTotalPrice += GetPrice(newProduct) * (updatedAmount-amount);
    } else {
      if (newProduct.stock > updatedAmount) {
        updatedAmount += 1;
        updatedTotalPrice += GetPrice(newProduct);
      }
    }
    cart.cartProducts = cart.cartProducts.filter((cartProduct) => cartProduct.product.id !== newProduct.id)
    setCart({ cartProducts: [{product: newProduct, amount: updatedAmount}, ...cart.cartProducts], totalPrice: updatedTotalPrice});
  }
}

function GetPrice(product: Product): number {
  if (product.happy_hour_timestamps.some((timestamp) => timestamp.endTime.getTime() >= Date.now() && timestamp.startTime.getTime() <= Date.now())) {
    return product.happy_hour_price;
  }
  return product.price;
}

export default Cart;