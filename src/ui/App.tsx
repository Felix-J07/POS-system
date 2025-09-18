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
import { GetProducts } from './database'
import { GetPrice } from './helpers'

function App() {  
  const [products, setProducts] = useState<Product[]>([]) // Array of products from the database
  // Set product on product cards when app starts up
  useEffect(() => {
    GetProducts({ setProducts });
  }, []);
  
  const [cart, setCart] = useState<CartType>({ cartProducts: [] as CartType['cartProducts'], totalPrice: 0 }) // Cart containing products added to the cart
  // Update cart prices if product prices change in the database
  useEffect(() => {
    setCart(prevCart => {
      const updatedCartProducts = prevCart.cartProducts.map(item => {
        const updatedProduct = products.find(p => p.id === item.product.id);
        return updatedProduct
          ? { product: updatedProduct, amount: item.amount <= updatedProduct.stock ? item.amount : updatedProduct.stock, price: GetPrice(updatedProduct), is_prize: item.is_prize }
          : item;
      });
      // Recalculate total price in case product prices changed
      const updatedTotalPrice = updatedCartProducts.reduce(
        (sum, item) => sum + item.price * item.amount, 0
      );
      return { cartProducts: updatedCartProducts, totalPrice: updatedTotalPrice };
    });
  }, [products]);

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
          <Route path="/checkout" element={<Checkout setCart={setCart} sale={sale} setSales={setSale} setProducts={setProducts} />} />
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