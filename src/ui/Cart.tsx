import './static/Cart.css'
import type React from 'react'
import { Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GetPriceAndHappyHour } from './helpers';
import { useState } from 'react';
import { Modal } from './modal';
import { Card } from './product_card';
import './static/ProductShowcase.css';

// Props for the Cart component (for TypeScript type checking)
type CartProps = {
  products: Product[];
  cart: CartType;
  setCart: React.Dispatch<React.SetStateAction<CartType>>;
  setSale: React.Dispatch<React.SetStateAction<Sale | null>>;
};

// React functional component for the cart
function Cart({ products, cart, setCart, setSale }: CartProps) {
  // State for controlling the visibility of the prize modal
  const [modalVisible, setModalVisible] = useState(false);
  
  // Destructure cart to get cartProducts and totalPrice
  const { cartProducts, totalPrice } = cart;

  // Function to handle barcode input from the input field
  const barcodeInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const barcode = event.currentTarget.value;
    // Split the barcode if it contains '*', which indicates a quantity prefix
    const barcodeSplittedArray: string[] = barcode.split("*");
    let amount: number = 1;
    let barcodeExtracted: string;
    // If the barcode contains '*', try to parse the amount and extract the actual barcode
    // Else just use the barcode as is
    if (barcode.includes("*")) {
      try {
        amount = parseInt(barcodeSplittedArray[0]);
        barcodeExtracted = barcodeSplittedArray[1];
      } catch (error) {
        console.log(error);
      }
    }
    else {
      barcodeExtracted = barcode;
    }

    // Check if the product with the scanned barcode exists in the products list
    const exists = products.some(product => String(product.barcode) === barcodeExtracted);
    if (event.key === 'Enter' && exists) {
      const product = products.filter((product) => product.barcode === barcodeExtracted);
      AddToCart(product[0], cart, setCart, amount);
      event.currentTarget.value = "";
    }

    // Change the border color of the input field to green if the product exists, else red
    event.currentTarget.style.borderColor = exists ? 'green' : 'red';
  };

  // Function to open the prize modal. The modal allows the user to select a product to add as a prize. A prize is a free product from fx a tournament.
  const addPrizeModal = () => {
    // Sets the modal visibility state to true
    setModalVisible(true);
    // Renders the PrizeModal component inside the Modal component
    PrizeModal({ products: products.filter(item => item.stock > 0), cart, setCart });
  };

  // Render the cart component
  // Includes an input field for barcode scanning, a list of products in the cart, and buttons for clearing the cart and proceeding to checkout
  // Each product in the cart is rendered using the productDiv function
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
      {modalVisible && <Modal setModalVisible={setModalVisible} modal_content={<PrizeModal products={products} cart={cart} setCart={setCart} />} title="Præmier" />}
    </>
  );
}

// Function to render each product in the cart
function productDiv(product: Product, amount: number, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>, is_prize: boolean = false): React.JSX.Element {
  // Action for reducing the amount of a product by one when pressing the '-' button
  // If the amount is 1, the product is removed from the cart
  const reduceAmount = () => {
    if (amount <= 1) {
      RemoveFromCart(product.id, cart, setCart, is_prize);
      return;
    }
    cart.cartProducts.forEach((item) => {
      if (item.product.id === product.id && item.is_prize === is_prize) {
        item.amount -= 1;
        setCart({ cartProducts: cart.cartProducts, totalPrice: cart.totalPrice - item.price });
      }
    });
  };
  // Action for increasing the amount of a product by one when pressing the '+' button
  // If the amount is equal to the stock, nothing happens
  const increaseAmount = () => {
    AddToCart(product, cart, setCart, 1, is_prize);
  };
  // Action for removing the product from the cart when pressing the trash icon button
  const removeItem = () => {
    if (product.id !== null) {
      RemoveFromCart(product.id, cart, setCart, is_prize);
    }
  };

  // Render the product in the cart with its image, name, brand, amount, and price
  // Includes buttons for increasing/decreasing the amount and removing the product from the cart
  // If the product is a prize, its price is shown as 0.00
  // The product is identified uniquely in the cart by its ID and whether it is a prize or not
  return (
    <div className="cart-product" key={`${product.id}-${is_prize ? 'prize' : 'regular'}`} id={`cart-product-${product.id}`}>
      <img src={product.image || "alt_img.png"} alt={product.name} className="cart-product-image" />
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
            Pris: {is_prize ? 0.00.toFixed(2) : (GetPriceAndHappyHour(product)[0] * amount).toFixed(2)} kr
          </div>
        </div>
      </div>
    </div>
  );
}

// Function to convert the current cart into a Sale object for processing during checkout
// If the cart is empty, it returns null
function SaleConvert(cart: CartType): Sale | null {
  if (cart.cartProducts.length < 1) return null;
  // Create a Sale object with the cart details
  let sale: Sale = {
    datetime: new Date().toISOString(), // Sale object accepts strings, not Date objects. Sqlite stores dates as strings
    total_sale_price: parseFloat(cart.cartProducts.reduce((sum, item) => sum + (item.is_prize ? 0.00 : item.price * item.amount), 0).toFixed(2)),
    soldProducts: cart.cartProducts.map(({ product, amount, price, is_prize, is_happy_hour_purchase }) => ({
      product: product,
      quantity: amount,
      price: is_prize ? 0.00 : parseFloat(price.toFixed(2)), // Get the price at the time of sale
      is_prize: is_prize ? 1 : 0,
      is_happy_hour_purchase: is_happy_hour_purchase
    }))
  }
  return sale;
}

// Function to remove a product from the cart based on its ID and whether it is a prize or not
function RemoveFromCart(productId: number, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>, is_prize: boolean) {
  const { cartProducts } = cart; // Fetch current products in cart
  const updatedProducts = cartProducts.filter(item => item.product.id !== productId || item.is_prize !== is_prize); // Remove the product with the given ID
  const updatedTotalPrice = updatedProducts.reduce((sum, item) => sum + item.price * item.amount, 0);
  setCart({ cartProducts: updatedProducts, totalPrice: updatedTotalPrice });
}

// Adding a product to the cart if enough stock
export function AddToCart(product: Product, cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>, amount?: number, is_prize: boolean = false) {
  let newProduct: Product = { ...product }; // Create a copy of the product to avoid direct mutations
  
  // If the product is a prize it is added to the cart with (Præmie) appended to the name
  if (is_prize) { newProduct.name = newProduct.name + " (Præmie)"; }

  // Finding the index of the added product in the cart (the same product can have to instances in the cart, one prize one payed)
  const index = cart.cartProducts.findIndex(cartproduct => cartproduct.product.id === newProduct.id && cartproduct.is_prize === is_prize);
  // Finding the index of the second instance of the product in the cart (the product not with the same 'is_prize' variable value). Then 
  const indexOfSecondProductInstance = cart.cartProducts.findIndex(cartproduct => cartproduct.product.id === newProduct.id && cartproduct.is_prize !== is_prize);
  let amountOfSecondInstance = 0;
  if (indexOfSecondProductInstance !== -1) {
    amountOfSecondInstance = cart.cartProducts[indexOfSecondProductInstance].amount;
  }
  const availableStock = newProduct.stock - amountOfSecondInstance;

  // Creating a variable to hold the updated total price and fetching the current price of the product + if happy hour has started
  let updatedTotalPrice = cart.totalPrice;
  let [getPrice, is_happy_hour] = GetPriceAndHappyHour(newProduct);
  getPrice = is_prize ? 0.00 : getPrice;

  // Checking if the specific product exists in the cart
  if (index === -1) {
    // Does nothing if the stock of the product is 0
    if (availableStock < 1) { return; }
    // Checks the amount is given as a number
    if (amount !== undefined && amount > 0) {
      // Checks if the wanted amount is bigger than the product stock
      if (availableStock < amount) {
        amount = availableStock;
      }
      updatedTotalPrice += getPrice * amount;
    } else {
      // If the user wants to add 0 products, no changes will be made
      if (amount === 0) { return; }
      amount = 1;
      updatedTotalPrice += getPrice;
    }
    // Adds one instance of the product with the defined amount, and updating the total price of the cart
    setCart({ cartProducts: [{product: newProduct, amount: amount, price: getPrice, is_prize: is_prize, is_happy_hour_purchase: is_happy_hour}, ...cart.cartProducts ], totalPrice: updatedTotalPrice})
  } else {
    // Fetching the information in the cart about the specific product
    newProduct = cart.cartProducts[index].product;
    const oldAmount = cart.cartProducts[index].amount;
    const oldPrice = cart.cartProducts[index].price;
    const is_prize = cart.cartProducts[index].is_prize;
    let updatedAmount = oldAmount;

    // Checks if amount is defined
    if (amount !== undefined) {
      // If the user wants to add 0 products, no changes will be made
      if (amount === 0) { return; }
      // Adding the wanted amount to the cart
      updatedAmount += amount;
      // Checking if the wanted amount is bigger than the total stock of the product
      if (updatedAmount > availableStock) {
        updatedAmount = availableStock;
        updatedTotalPrice -= oldAmount * oldPrice;
        return;
      } 
      // Removing from the cart if the updatedAmount is less than 1 (if the given amount is negative)
      else if (updatedAmount < 1) {
        RemoveFromCart(newProduct.id, cart, setCart, is_prize);
        return;
      }
      // Recalculating the total price by subtracting the old product cost and adding the updated cost, because product prices can change during usage
      updatedTotalPrice -= oldAmount * oldPrice;
      updatedTotalPrice += getPrice * updatedAmount;
    } 
    // If the amount is not given, the amount is set to one
    else {
      // Checking if the later updated amount will be bigger than the product stock
      if (availableStock > oldAmount) {
        updatedTotalPrice -= oldAmount * oldPrice;
        updatedAmount += 1;
        updatedTotalPrice += getPrice * updatedAmount;
      }
    }
    // Fetches the cartProduct list where the edited index is not included. The rest of the list is basically added to a list of only the edited product
    cart.cartProducts = cart.cartProducts.filter((_, idx) => idx !== index);
    setCart({ cartProducts: [{product: newProduct, amount: updatedAmount, price: getPrice, is_prize: is_prize, is_happy_hour_purchase: is_happy_hour}, ...cart.cartProducts], totalPrice: updatedTotalPrice});
  }
}

// Component for the prize modal
function PrizeModal({ products, cart, setCart }: { products: Product[], cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>> }): React.JSX.Element {
  // Action for adding a product as a prize to the cart when clicking on the product card in the modal
  const AddPrizeToCart = (product: Product) => {
    AddToCart(product, cart, setCart, 1, true);
  };

  // Render the prize modal with a grid of products that can be added as prizes
  // Each product is rendered using the Card component and clicking on a product adds it to the cart as a prize
  return (
    <div>
      <h2>Tilføj præmie</h2>
      <div className='product-grid'>
        { products.map((product) => {
          if (product.stock > 0) {
            return Card(product, () => { AddPrizeToCart(product); })
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default Cart;