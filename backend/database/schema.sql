-- Create database if not exists
CREATE DATABASE IF NOT EXISTS JewellerySeller;
USE JewellerySeller;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('staff', 'superadmin') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    current_balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    quantity DECIMAL(10, 3) NOT NULL DEFAULT 0,
    weight_unit ENUM('g', 'kg', 'piece') DEFAULT 'g',
    price_per_unit DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contact_id INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('pending', 'partial', 'paid') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- Invoice items table
CREATE TABLE invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT,
    inventory_id INT,
    quantity DECIMAL(10, 3) NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

-- Insert default superadmin user
-- Password is 'admin123' (hashed)
INSERT INTO users (username, password, role) VALUES 
('admin', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'superadmin');

-- Indexes for better performance
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_invoices_contact ON invoices(contact_id);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- After creating tables, add some sample inventory data
INSERT INTO inventory (name, category, quantity, weight_unit, price_per_unit) VALUES
('Gold Ring 22K', 'Gold', 5, 'g', 5500),
('Silver Chain', 'Silver', 15, 'g', 85),
('Diamond Pendant', 'Diamond', 3, 'piece', 25000),
('Gold Necklace 24K', 'Gold', 2, 'g', 6200),
('Silver Anklet', 'Silver', 8, 'g', 95),
('Diamond Ring', 'Diamond', 4, 'piece', 35000),
('Gold Earrings 22K', 'Gold', 7, 'g', 5300),
('Silver Bracelet', 'Silver', 6, 'g', 90),
('CZ Ring', 'CZ', 12, 'piece', 1500),
('CZ Silver', 'CZ', 0, 'g', 200); 