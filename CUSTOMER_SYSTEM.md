# Customer ID System Setup Guide

## 🎯 What Changed

**Before:** Customer names were just text, could have duplicates/typos
**Now:** Each unique customer has one ID, autocomplete prevents duplicates

## 📋 Setup Steps

### 1. Update Database Schema

Run `supabase-schema.sql` in your Supabase SQL Editor:
- Creates `customers` table
- Adds `customer_id` to `transactions` table
- Creates trigger to auto-update customer stats
- Adds indexes for performance

### 2. Migrate Existing Data

Run `migration.sql` in Supabase SQL Editor:
- Extracts unique customer names from transactions
- Creates customer records
- Links transactions to customers
- Normalizes all names to lowercase

### 3. Deploy Updated App

The app now:
- Shows autocomplete suggestions as you type
- Displays customer debt in suggestions
- Prevents duplicate customer names
- Capitalizes names for display (stored lowercase)
- Links all transactions to customer IDs

## 🔄 How It Works Now

### Adding Transaction:
1. User types "joh" → Autocomplete shows "john doe" (if exists)
2. User clicks suggestion → Name auto-fills
3. System checks if customer exists:
   - **Exists**: Uses existing customer_id
   - **New**: Creates customer, gets new customer_id
4. Transaction saved with customer_id link

### Benefits:
- ✅ Consistent customer names (no "John", "john", "JOHN")
- ✅ One customer = One ID (easy to track history)
- ✅ Auto-complete prevents typos
- ✅ Shows customer debt when selecting
- ✅ Customer stats auto-update (total purchases, debt)

## 🎨 Display vs Storage

**Storage (Database):**
- customer_name: "john doe"
- items_bought: "ankara fabric 5 yards"

**Display (UI):**
- Customer Name: "John Doe"
- Items: "Ankara Fabric 5 Yards"

## 🔍 Customer Stats

Each customer record tracks:
- `total_purchases`: Sum of all transaction totals
- `total_debt`: Sum of all outstanding balances
- Auto-updates via database trigger

## 📊 Example Workflow

**Scenario:** Mary buys fabric 3 times

**Transaction 1:**
- User types "mary" → No suggestions (new customer)
- Creates customer: { id: uuid-1, name: "mary johnson" }
- Creates transaction with customer_id: uuid-1

**Transaction 2:**
- User types "mar" → Shows "mary johnson" with debt info
- User clicks → Auto-fills "mary johnson"
- Uses existing customer_id: uuid-1

**Transaction 3:**
- Same as Transaction 2
- All 3 transactions linked to same customer_id

**Result:**
- Credit page groups all 3 transactions under "Mary Johnson"
- Shows total debt across all transactions
- Consistent naming, no duplicates

## 🚨 Important Notes

1. **Run migration ONCE** - Don't run multiple times
2. **Backup data first** - Always backup before migration
3. **Test on staging** - Test migration on copy of database first
4. **Case insensitive** - "John" and "john" treated as same customer
5. **Trim spaces** - "John " and "John" are same customer

## 🔧 Troubleshooting

**Issue:** Autocomplete not showing
- Check customers table has data
- Verify fetchCustomers() is called on mount

**Issue:** Duplicate customers created
- Check name normalization (toLowerCase + trim)
- Verify unique constraint on customers.name

**Issue:** Customer stats not updating
- Check trigger is created: `trigger_update_customer_stats`
- Manually run stats update query from migration.sql

## 📈 Future Enhancements

Possible additions:
- Customer phone numbers
- Customer addresses
- Purchase history view
- Customer loyalty points
- SMS/WhatsApp integration
- Customer notes/preferences
