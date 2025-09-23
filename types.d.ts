type Product = {
    id: number,
    barcode: string,
    brand: string,
    name: string,
    price: number,
    bought_price: number,
    stock: number,
    happy_hour_price: number,
    happy_hour_timestamps: {
        startTime: Date,
        endTime: Date
    }[]
    image?: string // Optional field for product images
}

type CartType = {
    cartProducts: {
        product: Product, // Product details
        amount: number, // Amount of this product in the cart
        price: number // Price for product when added in the cart
        is_prize: boolean, // Indicates if the product is a prize in a tournament
        is_happy_hour_purchase: boolean // Indicates if the product is bought during happy hour
    }[],
    totalPrice: number, // Total price of the cart
}

type Sale = {
    datetime: string, // ISO date string
    total_sale_price: number, // Total price of the sale
    payment_method?: 'cash' | 'card' | 'mobilepay', // Payment method used
    soldProducts: {
        product: Product,
        quantity: number, // Quantity of this product sold in the sale
        price: number, // Price per unit at the time of sale
        is_prize: number, // Indicates if the product is a prize in a tournament
        is_happy_hour_purchase: boolean // Indicates if the product is bought during happy hour
        loss?: boolean // If the product was a loss, not a sale or prize
    }[] // Array of products sold in this sale
}

type SaleStatistics = {
    id: number,
    datetime: Date,
    total_sale_price: number,
    soldProduct: {
        product: Product,
        quantity: number,
        price: number, // Price per unit at the time of sale
        is_prize: boolean, // Indicates if the product is a prize in a tournament
        is_happy_hour_purchase: boolean, // Indicates if the product is bought during happy hour
        loss: boolean// If the product was a loss, not a sale or prize
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
        get_sales: (condition?: string, params?: Object) => Promise<SaleStatistics[]>;
        add_sale: (sale: Sale) => Promise<void>;
        update_product_stock: (sale: Sale) => Promise<boolean>;
        export_database: () => Promise<void>;
        login(username: string, password: string): Promise<boolean>;
        import_database: () => void;
    }
}