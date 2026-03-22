
CREATE TABLE writeoffs (
    id SERIAL PRIMARY KEY,
    writeoff_number VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(20) DEFAULT 'new',
    total_amount NUMERIC(12, 2) DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE writeoff_items (
    id SERIAL PRIMARY KEY,
    writeoff_id INTEGER NOT NULL REFERENCES writeoffs(id),
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0
);

CREATE INDEX idx_writeoffs_created_at ON writeoffs(created_at DESC);
CREATE INDEX idx_writeoff_items_writeoff_id ON writeoff_items(writeoff_id);
