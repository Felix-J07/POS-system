type Product = {
    id: number,
    barcode: string,
    brand: string,
    name: string,
    price: number,
    stock: number,
    happy_hour_price: number,
    happy_hour_timestamps: {
        startTime: Date,
        endTime: Date
    }[]
    image?: string, // Optional field for product images
}

type CartType = {
    cartProducts: {
        product: Product, // Product details
        amount: number, // Amount of this product in the cart
        price: number // Price for product when added in the cart
    }[],
    totalPrice: number, // Total price of the cart
}

type Sale = {
    datetime: string, // ISO date string
    total_sale_price: number,
    soldProducts: {
        product: Product,
        quantity: number,
        price: number // Price per unit at the time of sale
    }[] // Array of products sold in this sale
}

type SaleStatistics = {
    id: number,
    datetime: string, // ISO date string
    total_sale_price: number,
    soldProduct: {
        product: Product,
        quantity: number,
        price: number // Price per unit at the time of sale
    } // Array of products sold in this sale
}

type HappyHour = {
    products: Product[],
    startTime: Date,
    endTime: Date
}

interface Window {
    electron: {
        get_products: () => Promise<Product[]>;
        add_product: (product: Product) => Promise<void>;
        update_product: (product: Product) => Promise<void>;
        delete_product: (productId: number) => Promise<void>;
        // get_sales: () => Promise<Sale[]>;
        // add_sale: (sale: Sale) => Promise<void>;
    }
}