type Product = {
    id: number, // Unique identifier for the product in the database
    barcode: string, // Barcode of the product
    brand: string, // Brand of the product
    name: string, // Name of the product
    price: number, // Price the product is sold for
    bought_price: number, // Price the product was bought for
    stock: number, // Current stock of the product
    happy_hour_price: number,
    happy_hour_timestamps: {
        startTime: Date,
        endTime: Date
    }[], // Array of happy hour time periods for the product
    image?: string // Optional field for product images
}

type CartType = {
    cartProducts: {
        product: Product, // Product object
        amount: number, // Amount of this product in the cart
        price: number, // Price for product when added in the cart
        is_prize: boolean, // Indicates if the product is a prize in a tournament
        is_happy_hour_purchase: boolean // Indicates if the product is bought during happy hour
    }[], // Array of products in the cart
    totalPrice: number, // Total price of the cart
}

type Sale = {
    datetime: string, // ISO date string
    total_sale_price: number, // Total price of the sale
    payment_method?: 'cash' | 'card' | 'mobilepay', // Payment method used (future use)
    soldProducts: {
        product: Product, // Product object
        quantity: number, // Quantity of this product sold in the sale
        price: number, // Price per unit at the time of sale
        is_prize: number, // Indicates if the product is a prize in a tournament
        is_happy_hour_purchase: boolean // Indicates if the product is bought during happy hour
        loss?: boolean // If the product was a loss, not a sale or prize
    }[] // Array of products sold in this sale
}

type SaleStatistics = {
    id: number, // Unique identifier for the sale in the database
    datetime: Date, // Date and time of the sale
    total_sale_price: number, // Total price of the sale
    soldProduct: {
        product: Product, // Product object
        quantity: number, // Quantity of this product sold in the sale
        price: number, // Price per unit at the time of sale
        is_prize: boolean, // Indicates if the product is a prize in a tournament
        is_happy_hour_purchase: boolean, // Indicates if the product is bought during happy hour
        loss: boolean // If the product was a loss, not a sale or prize
    } // Product sold in this sale
}

// Extend the Window interface to include the electron API
// The API in the app to be able to use TypeScript type checking
interface Window {
    electron: {
        get_products: () => Promise<Product[]>;
        add_product: (product: Product) => Promise<void>;
        update_product: (product: Product) => Promise<void>;
        delete_product: (productId: number) => Promise<void>;
        get_sales: (condition?: string, params?: Object) => Promise<SaleStatistics[]>;
        add_sale: (sale: Sale) => Promise<void>;
        update_product_stock: (sale: Sale) => Promise<boolean>;
        export_database: () => Promise<void>;
        login(username: string, password: string): Promise<boolean>;
        import_database: () => void;
    }
}