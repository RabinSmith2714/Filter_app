-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS filters;

-- Use the database
USE filters;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create filter_usage table
CREATE TABLE IF NOT EXISTS filter_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    filter_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 