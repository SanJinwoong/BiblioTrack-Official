-- BiblioTrack Database Schema for Supabase
-- Execute this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable delete for all users" ON users;

DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for all users" ON categories;
DROP POLICY IF EXISTS "Enable update for all users" ON categories;
DROP POLICY IF EXISTS "Enable delete for all users" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON books;
DROP POLICY IF EXISTS "Enable insert for all users" ON books;
DROP POLICY IF EXISTS "Enable update for all users" ON books;
DROP POLICY IF EXISTS "Enable delete for all users" ON books;

DROP POLICY IF EXISTS "Enable read access for all users" ON checkouts;
DROP POLICY IF EXISTS "Enable insert for all users" ON checkouts;
DROP POLICY IF EXISTS "Enable update for all users" ON checkouts;
DROP POLICY IF EXISTS "Enable delete for all users" ON checkouts;

DROP POLICY IF EXISTS "Enable read access for all users" ON checkout_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON checkout_requests;
DROP POLICY IF EXISTS "Enable update for all users" ON checkout_requests;
DROP POLICY IF EXISTS "Enable delete for all users" ON checkout_requests;

DROP POLICY IF EXISTS "Enable read access for all users" ON reviews;
DROP POLICY IF EXISTS "Enable insert for all users" ON reviews;
DROP POLICY IF EXISTS "Enable update for all users" ON reviews;
DROP POLICY IF EXISTS "Enable delete for all users" ON reviews;

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('client', 'librarian')) NOT NULL,
    name VARCHAR(255),
    curp VARCHAR(18),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT,
    favorite_books TEXT[],
    following TEXT[],
    followers TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create Books table
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url TEXT,
    category VARCHAR(255) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create Checkouts table
CREATE TABLE IF NOT EXISTS checkouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'returned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create Checkout Requests table (separate from checkouts)
CREATE TABLE IF NOT EXISTS checkout_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_checkouts_user_id ON checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_book_id ON checkouts(book_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_status ON checkouts(status);
CREATE INDEX IF NOT EXISTS idx_checkout_requests_user_id ON checkout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_requests_book_id ON checkout_requests(book_id);
CREATE INDEX IF NOT EXISTS idx_checkout_requests_status ON checkout_requests(status);
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust these based on your authentication needs)
-- For now, we'll allow all operations for authenticated users

-- Users policies
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (true);
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (true);

-- Categories policies
CREATE POLICY "categories_select_policy" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_policy" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "categories_update_policy" ON categories FOR UPDATE USING (true);
CREATE POLICY "categories_delete_policy" ON categories FOR DELETE USING (true);

-- Books policies
CREATE POLICY "books_select_policy" ON books FOR SELECT USING (true);
CREATE POLICY "books_insert_policy" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "books_update_policy" ON books FOR UPDATE USING (true);
CREATE POLICY "books_delete_policy" ON books FOR DELETE USING (true);

-- Checkouts policies
CREATE POLICY "checkouts_select_policy" ON checkouts FOR SELECT USING (true);
CREATE POLICY "checkouts_insert_policy" ON checkouts FOR INSERT WITH CHECK (true);
CREATE POLICY "checkouts_update_policy" ON checkouts FOR UPDATE USING (true);
CREATE POLICY "checkouts_delete_policy" ON checkouts FOR DELETE USING (true);

-- Checkout Requests policies
CREATE POLICY "checkout_requests_select_policy" ON checkout_requests FOR SELECT USING (true);
CREATE POLICY "checkout_requests_insert_policy" ON checkout_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "checkout_requests_update_policy" ON checkout_requests FOR UPDATE USING (true);
CREATE POLICY "checkout_requests_delete_policy" ON checkout_requests FOR DELETE USING (true);

-- Reviews policies
CREATE POLICY "reviews_select_policy" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_policy" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_update_policy" ON reviews FOR UPDATE USING (true);
CREATE POLICY "reviews_delete_policy" ON reviews FOR DELETE USING (true);