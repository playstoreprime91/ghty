-- Migration: create product table
CREATE TABLE IF NOT EXISTS product (
  id SERIAL PRIMARY KEY,
  nazwa VARCHAR(200) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  cena NUMERIC(10,2) NOT NULL CHECK (cena >= 0),
  kategoria VARCHAR(100),
  stan_magazynu INT DEFAULT 0
);
