-- Migration Script: Add Customer IDs to Existing Transactions
-- Run this AFTER creating the customers table

-- Step 1: Create customers from existing transaction names
INSERT INTO customers (name)
SELECT DISTINCT LOWER(TRIM(customer_name)) as name
FROM transactions
WHERE LOWER(TRIM(customer_name)) NOT IN (SELECT name FROM customers)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Update transactions with customer_id
UPDATE transactions t
SET customer_id = c.id
FROM customers c
WHERE LOWER(TRIM(t.customer_name)) = c.name
AND t.customer_id IS NULL;

-- Step 3: Normalize existing customer names to lowercase
UPDATE transactions
SET customer_name = LOWER(TRIM(customer_name));

-- Step 4: Normalize existing items to lowercase
UPDATE transactions
SET items_bought = LOWER(TRIM(items_bought));

-- Step 5: Update customer stats (will be auto-updated by trigger, but run manually to ensure)
UPDATE customers c
SET 
  total_purchases = (SELECT COALESCE(SUM(total_price), 0) FROM transactions WHERE customer_id = c.id),
  total_debt = (SELECT COALESCE(SUM(balance), 0) FROM transactions WHERE customer_id = c.id AND balance > 0),
  updated_at = NOW();

-- Verify migration
SELECT 
  COUNT(*) as total_transactions,
  COUNT(customer_id) as transactions_with_customer_id,
  COUNT(*) - COUNT(customer_id) as missing_customer_ids
FROM transactions;

SELECT 
  COUNT(*) as total_customers,
  SUM(total_purchases) as all_purchases,
  SUM(total_debt) as all_debt
FROM customers;
