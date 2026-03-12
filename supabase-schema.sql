-- Total Fabrics Database Schema
-- Run this in Supabase SQL Editor

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  items_bought TEXT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  balance DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'partial', 'pending')),
  transaction_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_customer ON transactions(customer_name);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_balance ON transactions(balance);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since no auth is used)
CREATE POLICY "Allow all operations" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);
