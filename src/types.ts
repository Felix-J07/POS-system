export type Product = {
    id: number,
    barcode: string,
    brand: string,
    name: string,
    price: number,
    stock: number,
    happy_hour_price: number,
    image?: string, // Optional field for product images
}

export type Cart = {
    cartProducts: {
        product: Product, // Product details
        amount: number, // Amount of this product in the cart
    }[],
    totalPrice: number, // Total price of the cart
}

export type Sale = {
    id: number,
    datetime: string, // ISO date string
    total_sale_price: number,
    soldProducts: {
        product: Product,
        quantity: number,
        price: number // Price per unit at the time of sale
    }[] // Array of products sold in this sale
}

export type SaleStatistics = {
    id: number,
    datetime: string, // ISO date string
    total_sale_price: number,
    soldProduct: {
        product: Product,
        quantity: number,
        price: number // Price per unit at the time of sale
    } // Array of products sold in this sale
}

export type HappyHour = {
    products: Product[],
    startTime: Date,
    endTime: Date
}

export type HappyHourProduct = {
    product: Product,
    timestamps: {
        startTime: Date,
        endTime: Date
    }[]
}

export type Note = {
    product: Product,
    note: string
}