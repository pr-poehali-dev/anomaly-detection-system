
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'шт',
    quantity INTEGER DEFAULT 0,
    price NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL,
    supplier VARCHAR(255),
    status VARCHAR(20) DEFAULT 'new',
    total_amount NUMERIC(12, 2) DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE receipt_items (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES receipts(id),
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0
);

CREATE INDEX idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX idx_products_sku ON products(sku);
