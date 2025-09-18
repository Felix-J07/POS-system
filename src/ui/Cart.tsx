import './static/Cart.css'
import type React from 'react'
import { Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GetPrice } from './helpers';
import { useState } from 'react';
import { Modal } from './modal';
import { Card } from './product_card';
import './static/ProductShowcase.css';

type CartProps = {
  products: Product[];
  cart: CartType;
  setCart: React.Dispatch<React.SetStateAction<CartType>>;
  setSale: React.Dispatch<React.SetStateAction<Sale | null>>;
};

function Cart({ products, cart, setCart, setSale }: CartProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
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

  const addPrizeModal = () => {
    setModalVisible(true);
    PrizeModal({ products, cart, setCart });
  };

  return (
    <>
      <div className="cart">
        <h3>Kurv</h3>
        <input autoFocus type="text" name="barcode" id="barcodeCartInput" placeholder="Stregkode:" onKeyUp={barcodeInput}/>
        <div className="cart-products">
          {cartProducts.map(({product, amount, is_prize}) => (
            productDiv(product, amount, cart, setCart, is_prize)
          ))}
        </div>
        <div className="cart-checkout">
          <div className="add-prize-button">
            <button type="button" onClick={addPrizeModal} style={{ color: '#333' }}>Tilføj præmie</button>
          </div>
          <p>Total Price: {totalPrice.toFixed(2)}</p>
          <div className="cart-checkout-buttons">
            <button type="button" id="clearCart" onClick={() => setCart({ cartProducts: [], totalPrice: 0 })}>Ryd kurven</button>
            <Link to="/checkout" style={{ color: 'white' }} id="checkout" onClick={() => setSale(SaleConvert(cart))}><button>Gå til betaling</button></Link>
          </div>
        </div>
      </div>
      {modalVisible && <Modal setModalVisible={setModalVisible} modal_content={<PrizeModal products={products} cart={cart} setCart={setCart} />} />}
    </>
  );
}

function productDiv(product: Product, amount: number, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>, is_prize: boolean = false): React.JSX.Element {
  const reduceAmount = () => {
    if (amount <= 1) {
      RemoveFromCart(product.id, cart, setCart, is_prize);
      return;
    }
    cart.cartProducts.forEach((item) => {
      if (item.product.id === product.id && item.is_prize === is_prize) {
        item.amount -= 1;
        setCart({ cartProducts: cart.cartProducts, totalPrice: cart.totalPrice - GetPrice(product) });
      }
    });
  };
  const increaseAmount = () => {
    AddToCart(product, cart, setCart, 1, is_prize);
  };
  const removeItem = () => {
    if (product.id !== null) {
      RemoveFromCart(product.id, cart, setCart, is_prize);
    }
  };

  return (
    <div className="cart-product" key={`${product.id}-${is_prize ? 'prize' : 'regular'}`} id={`cart-product-${product.id}`}>
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
            Pris: {is_prize ? 0.00.toFixed(2) : (GetPrice(product) * amount).toFixed(2)} kr
          </div>
        </div>
      </div>
    </div>
  );
}

function SaleConvert(cart: CartType): Sale | null {
  if (cart.cartProducts.length < 1) return null;
  let sale: Sale = {
    datetime: new Date().toISOString(),
    total_sale_price: parseFloat(cart.cartProducts.reduce((sum, item) => sum + (item.is_prize ? 0.00 : GetPrice(item.product) * item.amount), 0).toFixed(2)),
    soldProducts: cart.cartProducts.map(({ product, amount, is_prize }) => ({
      product: product,
      quantity: amount,
      price: is_prize ? 0.00 : parseFloat(GetPrice(product).toFixed(2)), // Get the price at the time of sale
      is_prize: is_prize ? 1 : 0
    }))
  }
  return sale;
}

function RemoveFromCart(productId: number, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>, is_prize: boolean) {
  const { cartProducts } = cart; // Fetch current products in cart
  const updatedProducts = cartProducts.filter(item => item.product.id !== productId || item.is_prize !== is_prize); // Remove the product with the given ID
  const updatedTotalPrice = updatedProducts.reduce((sum, item) => sum + item.price * item.amount, 0);
  setCart({ cartProducts: updatedProducts, totalPrice: updatedTotalPrice });
}

export function AddToCart(product: Product, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>, amount?: number, is_prize: boolean = false) {
  let newProduct: Product = { ...product }; // Create a copy of the product to avoid direct mutations
  if (is_prize) { newProduct.name = newProduct.name + " (Præmie)"; }

  const index = cart.cartProducts.findIndex(cartproduct => cartproduct.product.id === newProduct.id && cartproduct.is_prize === is_prize);
  let updatedTotalPrice = cart.totalPrice;
  const getPrice = is_prize ? 0 : GetPrice(newProduct);
  if (index === -1) {
    if (newProduct.stock < 1) { return; }
    if (amount !== undefined && amount > 0) {
      updatedTotalPrice += getPrice * amount;
    } else {
      amount = 1;
      updatedTotalPrice += getPrice;
    }
    setCart({ cartProducts: [{product: newProduct, amount: amount, price: getPrice, is_prize: is_prize}, ...cart.cartProducts ], totalPrice: updatedTotalPrice})
  } else {
    newProduct = cart.cartProducts[index].product;
    let updatedAmount = cart.cartProducts[index].amount;
    const oldPrice = cart.cartProducts[index].price;
    const is_prize = cart.cartProducts[index].is_prize;
    if (amount !== undefined) {
      if (amount === 0) { return; }
      const oldAmount = updatedAmount;
      updatedAmount += amount;
      if (updatedAmount > newProduct.stock) {
        updatedAmount = newProduct.stock;
        updatedTotalPrice -= oldAmount * oldPrice;
        return;
      } else if (updatedAmount < 1) {
        RemoveFromCart(newProduct.id, cart, setCart, is_prize);
        return;
      }
      updatedTotalPrice -= oldAmount * oldPrice;
      updatedTotalPrice += getPrice * updatedAmount;
    } else {
      if (newProduct.stock > updatedAmount) {
        updatedTotalPrice -= updatedAmount * oldPrice;
        updatedAmount += 1;
        updatedTotalPrice += getPrice * updatedAmount;
      }
    }
    cart.cartProducts = cart.cartProducts.filter((_, idx) => idx !== index);
    setCart({ cartProducts: [{product: newProduct, amount: updatedAmount, price: getPrice, is_prize: is_prize}, ...cart.cartProducts], totalPrice: updatedTotalPrice});
  }
}

//function productDiv(product: Product, amount: number, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>)
function PrizeModal({ products, cart, setCart }: { products: Product[], cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>> }): React.JSX.Element {
  const AddPrizeToCart = (product: Product) => {
    AddToCart(product, cart, setCart, 1, true);
  };

  return (
    <div>
      <h2>Tilføj præmie</h2>
      <div className='product-grid'>
        { products.map((product) => Card(product, () => { AddPrizeToCart(product); })) }
      </div>
    </div>
  );
}

export default Cart;