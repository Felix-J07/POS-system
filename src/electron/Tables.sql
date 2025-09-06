CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    brand TEXT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    happy_hour_price REAL,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS happy_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (barcode, brand, name, price, stock, happy_hour_price, image) VALUES
('123456789012', 'BrandA', 'ProductA', 9.99, 100, 7.99, 'path/to/imageA.jpg'),
('234567890123', 'BrandB', 'ProductB', 19.99, 50, 14.99, 'path/to/imageB.jpg'),
('345678901234', 'BrandC', 'ProductC', 29.99, 75, 24.99, 'path/to/imageC.jpg'),
('456789012345', 'BrandD', 'ProductD', 7.1423, 1, 7.1423, 'path/to/imageD.jpg');