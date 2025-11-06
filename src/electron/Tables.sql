CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    brand TEXT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    bought_price REAL NOT NULL,
    stock INTEGER NOT NULL,
    happy_hour_price REAL,
    image TEXT,
    is_deleted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_unit REAL NOT NULL,
    total_price REAL NOT NULL,
    -- Indicates if the sale was a prize in a tournament
    -- 0 = regular sale, 1 = prize
    is_prize BOOLEAN NOT NULL DEFAULT 0,
    -- Indicates if the product is bought during happy hour
    -- 0 = regular sale, 1 = happy hour purchase
    is_happy_hour_purchase BOOLEAN NOT NULL DEFAULT 0,
    sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Indicates if the "sale" isn't actually a sale but a loss
    --  because of expiration date or other stuff
    -- 0 = sale, 1 = loss/no sale
    loss BOOLEAN DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS happy_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lan_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- If more tables are added go to the src/electron/database.ts to add it to the tableRequirements list

--INSERT INTO products (barcode, brand, name, price, bought_price, stock, happy_hour_price, image) VALUES
--('123456789012', 'BrandA', 'ProductA', 9.99, 7.99, 100, 7.99, 'path/to/imageA.jpg'),
--('234567890123', 'BrandB', 'ProductB', 19.99, 17.99, 50, 14.99, 'path/to/imageB.jpg'),
--('345678901234', 'BrandC', 'ProductC', 29.99, 20.99, 75, 24.99, 'path/to/imageC.jpg'),
--('456789012345', 'BrandD', 'ProductD', 7.14, 5.00, 1, 7.1423, 'path/to/imageD.jpg');

-- Regular sale
--INSERT INTO sales (transaction_id, product_id, quantity, price_per_unit, total_price, is_prize, is_happy_hour_purchase, loss) VALUES (1001, 1, 2, 15.00, 30.00, 0, 0, 0);

-- Happy hour purchase
--INSERT INTO sales (transaction_id, product_id, quantity, price_per_unit, total_price, is_prize, is_happy_hour_purchase, loss) VALUES (1002, 2, 1, 10.00, 10.00, 0, 1, 0);

-- Prize giveaway (no payment)
--INSERT INTO sales (transaction_id, product_id, quantity, price_per_unit, total_price, is_prize, is_happy_hour_purchase, loss) VALUES (1003, 3, 1, 0.00, 0.00, 1, 0, 0);

-- Loss due to expiration
--INSERT INTO sales (transaction_id, product_id, quantity, price_per_unit, total_price, is_prize, is_happy_hour_purchase, loss) VALUES (1004, 4, 5, 12.00, 60.00, 0, 0, 1);

-- Happy hour + prize combo
--INSERT INTO sales (transaction_id, product_id, quantity, price_per_unit, total_price, is_prize, is_happy_hour_purchase, loss) VALUES (1005, 5, 1, 0.00, 0.00, 1, 1, 0);

--INSERT INTO users (username, password) VALUES ('test', 'test');