import './static/App.css'
import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Cart from './Cart'
import ProductShowcase from './ProductShowcase'
import type { Product, Cart as CartType } from "../types"

function App() {
  const [checkout_bool, setCheckout_bool] = useState(false); // Boolean to toggle between checkout and product showcase
  
  const [products, setProducts] = useState<Product[]>([
    {id:1, barcode:"123456", brand:"Brand A", name:"Product A", price:10.00, stock:5, happy_hour_price:2}, 
    {id:2, barcode:"789012", brand:"Brand B", name:"Product B", price:15.50, stock:3, happy_hour_price:3}, 
    {id:3, barcode:"345678", brand:"Brand C", name:"Product C", price:7.25, stock:10, happy_hour_price:1}
  ]) // Array of products from the database
  
  //const [sales, setSales] = useState<Sale[]>([]) // Array of sales from the database
  
  const [cart, setCart] = useState<CartType>({ cartProducts: [
    { product: {id:1, barcode:"123456", brand:"Brand A", name:"Product A", price:10.00, stock:5, happy_hour_price:2}, amount: 1 },
    { product: {id:2, barcode:"789012", brand:"Brand B", name:"Product B", price:15.50, stock:3, happy_hour_price:3}, amount: 1 },
    { product: {id:3, barcode:"345678", brand:"Brand C", name:"Product C", price:7.25, stock:10, happy_hour_price:1}, amount: 1 }
  ] as CartType['cartProducts'], totalPrice: 32.75 }) // Cart containing products added to the cart


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