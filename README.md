# Total Fabrics - Credit Management System

A mobile-first React app for managing fabric sales, customer credits, and payments.

## Features

- **Add Transaction**: Record customer purchases with payment tracking
- **Sales Dashboard**: View all transactions with filtering and totals
- **Credit Tracker**: Monitor outstanding balances and debtors

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Supabase Table

Run this SQL in your Supabase SQL Editor:

```sql
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

CREATE INDEX idx_transactions_customer ON transactions(customer_name);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_balance ON transactions(balance);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Tech Stack

- React + Vite
- React Router
- Supabase (PostgreSQL)
- Mobile-first responsive design
