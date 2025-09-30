import './static/App.css'
import { useState, useEffect, type JSX } from 'react'
import Navbar from './Navbar'
import Cart from './Cart'
import ProductShowcase from './ProductShowcase'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Checkout from './Checkout'
import Storage from './Storage'
import Statistics from './Statistics'
import Settings from './Settings'
import Login from './Login'
import { GetProducts } from './database'
import { GetPriceAndHappyHour } from './helpers'

// React functional component for the entire app
function App() {
  // UseState for the app for logged_in state 
  // Set to false on startup
  const [logged_in, setLogged_in] = useState<boolean>(false);

  // UseState for the list of products
  const [products, setProducts] = useState<Product[]>([]) // Array of products from the database
  // Set product on product cards when app starts up
  useEffect(() => {
    GetProducts({ setProducts });
  }, []);
  
  // UseState for the cart
  const [cart, setCart] = useState<CartType>({ cartProducts: [] as CartType['cartProducts'], totalPrice: 0 })
  // Update cart if products change in the database
  useEffect(() => {
    setCart(prevCart => {
      // Goes through all products in the cart and updates their details from the products list
      // If a product is no longer available, it is removed from the cart
      // If a product's stock is less than the amount in the cart, it adjusts the amount to the available stock. But it does not take prizes into account (bug)
      // If a product's price has changed, it updates the price in the cart
      const updatedCartProducts = prevCart.cartProducts.map(item => {
        const updatedProduct = products.find(p => p.id === item.product.id);
        return updatedProduct
          ? { product: updatedProduct, amount: item.amount <= updatedProduct.stock ? item.amount : updatedProduct.stock, price: GetPriceAndHappyHour(updatedProduct)[0], is_prize: item.is_prize, is_happy_hour_purchase: item.is_happy_hour_purchase }
          : null;
      }).filter(item => item !== null);
      // Recalculate total price in case product prices changed
      const updatedTotalPrice = updatedCartProducts.reduce(
        (sum, item) => sum + item.price * item.amount, 0
      );
      return { cartProducts: updatedCartProducts, totalPrice: updatedTotalPrice };
    });
  }, [products]);

  // UseState for the current sale
  const [sale, setSale] = useState<Sale | null>(null)

  // If a key on keyboard is pressed, or if the barcode scanner scans a product, focus the barcode input field
  // Barcode scanners usually emulate keyboard input, so this works for both (Works for the scanner used by LAN during development)
  useEffect(() => {
    const handleKeyDown = () => {
      document.getElementById("barcodeCartInput")?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => { document.removeEventListener("keydown", handleKeyDown) }
  }, []);
  
  // Return the app wrapped in a HashRouter for routing
  // If logged_in is true, show the main app with routes to different pages
  // If logged_in is false, show the Login page (the navbar is also shown, but the links do nothing)
  return (
    <HashRouter>
      <Navbar />
      <div className="main-container">
        {logged_in && <div className="logout-button">
          <button id="logout" onClick={() => setLogged_in(false)}>Logud</button>
        </div>}
        <Routes>
          {logged_in ? (
            <>
              <Route path="/" element={<Index products={products} cart={cart} setCart={setCart} setProducts={setProducts} setSale={setSale} />} />
              <Route path="/checkout" element={<Checkout setCart={setCart} sale={sale} setSales={setSale} setProducts={setProducts} />} />
              <Route path="/storage" element={<Storage products={products} setProducts={setProducts} />} />
              <Route path="/statistics" element={<Statistics products={products} />} />
              <Route path="/settings" element={<Settings />} />
            </>
          ) : (
            <Route path="*" element={<Login setLogged_in={setLogged_in} />} />
          )}
        </Routes>
      </div>
    </HashRouter>
  )
}

// Component for the main page showing the product showcase and the cart
function Index({ products, cart, setCart, setProducts, setSale }: { products: Product[], cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>, setProducts: React.Dispatch<React.SetStateAction<Product[]>>, setSale: React.Dispatch<React.SetStateAction<Sale | null>> }): JSX.Element {
  return (
    <>
      <ProductShowcase products={products} cart={cart} setCart={setCart} setProducts={setProducts} />
      <Cart products={products} cart={cart} setCart={setCart} setSale={setSale} />
    </>
  )
}

export default App