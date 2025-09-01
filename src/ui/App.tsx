import './static/App.css'
import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Cart from './Cart'
import ProductShowcase from './ProductShowcase'

function App() {
  const [checkout_bool, setCheckout_bool] = useState(false); // Boolean to toggle between checkout and product showcase
  
  const [products, setProducts] = useState<Product[]>([]) // Array of products from the database
  
  const [sales, setSales] = useState<Sale[]>([]) // Array of sales from the database

  const [cart, setCart] = useState<CartType>({ cartProducts: [] as CartType['cartProducts'], totalPrice: 0 }) // Cart containing products added to the cart


  if (checkout_bool === true) {
    // Show receipt
    return (
      <>
        <Navbar />
        <div className="main-container">
          <h2>Receipt</h2>
        </div>
      </>
    )
  } else {
    useEffect(() => {
      const handleKeyDown = () => {
        document.getElementById("barcodeCartInput")?.focus();
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => { document.removeEventListener("keydown", handleKeyDown) }
    }, []);
    
    return (
      <>
        <Navbar />
        <div className="main-container">
          <ProductShowcase products={products} cart={cart} setCart={setCart} setProducts={setProducts} />
          <Cart setCheckout_bool={setCheckout_bool} products={products} cart={cart} setCart={setCart}/>
        </div>
      </>
    )
  }
}

export default App