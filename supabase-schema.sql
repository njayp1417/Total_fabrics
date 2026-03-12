-- Total Fabrics Database Schema
-- Run this in Supabase SQL Editor

-- Create customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  phone TEXT,
  total_purchases DECIMAL(10, 2) DEFAULT 0,
  total_debt DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
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
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_customer_name ON transactions(customer_name);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_balance ON transactions(balance);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations
CREATE POLICY "Allow all operations" ON customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update customer stats
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE customers
    SET 
      total_purchases = (SELECT COALESCE(SUM(total_price), 0) FROM transactions WHERE customer_id = NEW.customer_id),
      total_debt = (SELECT COALESCE(SUM(balance), 0) FROM transactions WHERE customer_id = NEW.customer_id AND balance > 0),
      updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE customers
    SET 
      total_purchases = (SELECT COALESCE(SUM(total_price), 0) FROM transactions WHERE customer_id = OLD.customer_id),
      total_debt = (SELECT COALESCE(SUM(balance), 0) FROM transactions WHERE customer_id = OLD.customer_id AND balance > 0),
      updated_at = NOW()
    WHERE id = OLD.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update customer stats
CREATE TRIGGER trigger_update_customer_stats
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_customer_stats();
