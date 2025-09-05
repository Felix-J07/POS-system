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

function App() {  
  const [products, setProducts] = useState<Product[]>([]) // Array of products from the database
  
  const [cart, setCart] = useState<CartType>({ cartProducts: [] as CartType['cartProducts'], totalPrice: 0 }) // Cart containing products added to the cart

  const [sale, setSale] = useState<Sale | null>(null) // Current sale being processed in checkout

  useEffect(() => {
    const handleKeyDown = () => {
      document.getElementById("barcodeCartInput")?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => { document.removeEventListener("keydown", handleKeyDown) }
  }, []);
  
  return (
    <HashRouter>
      <Navbar />
      <div className="main-container">
        <Routes>
          <Route path="/" element={<Index products={products} cart={cart} setCart={setCart} setProducts={setProducts} setSale={setSale} />} />
          <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} sale={sale} setSales={setSale} />} />
          <Route path="/storage" element={<Storage products={products} setProducts={setProducts} />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

function Index({ products, cart, setCart, setProducts, setSale }: { products: Product[], cart: CartType, setCart: React.Dispatch<React.SetStateAction<CartType>>, setProducts: React.Dispatch<React.SetStateAction<Product[]>>, setSale: React.Dispatch<React.SetStateAction<Sale | null>> }): JSX.Element {
  return (
    <>
      <ProductShowcase products={products} cart={cart} setCart={setCart} setProducts={setProducts} />
      <Cart products={products} cart={cart} setCart={setCart} setSale={setSale} />
    </>
  )
}

export default App