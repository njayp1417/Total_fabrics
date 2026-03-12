import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Sales() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false })

    if (!error) {
      setTransactions(data || [])
    }
    setLoading(false)
  }

  const totalSales = transactions.reduce((sum, t) => sum + (t.total_price || 0), 0)
  const totalPaid = transactions.reduce((sum, t) => sum + (t.amount_paid || 0), 0)

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true
    return t.status === filter
  })

  const getStatusBadge = (status) => {
    const badges = {
      paid: { text: 'Successful', class: 'badge-success' },
      partial: { text: 'Partial', class: 'badge-warning' },
      pending: { text: 'Pending', class: 'badge-danger' }
    }
    return badges[status] || badges.pending
  }

  return (
    <div className="page">
      <div className="stats-card">
        <div className="stat">
          <span className="stat-label">Total Sales</span>
          <span className="stat-value">₦{totalSales.toFixed(2)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total Paid</span>
          <span className="stat-value paid">₦{totalPaid.toFixed(2)}</span>
        </div>
      </div>

      <div className="filter-buttons">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'paid' ? 'active' : ''} onClick={() => setFilter('paid')}>Successful</button>
        <button className={filter === 'partial' ? 'active' : ''} onClick={() => setFilter('partial')}>Partial</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="transactions-list">
          {filteredTransactions.length === 0 ? (
            <div className="empty-state">No transactions found</div>
          ) : (
            filteredTransactions.map(transaction => {
              const badge = getStatusBadge(transaction.status)
              return (
                <div key={transaction.id} className="transaction-card">
                  <div className="transaction-header">
                    <span className="customer-name">{transaction.customer_name}</span>
                    <span className={`badge ${badge.class}`}>{badge.text}</span>
                  </div>
                  <div className="transaction-items">{transaction.items_bought}</div>
                  <div className="transaction-footer">
                    <div className="transaction-amounts">
                      <span>Total: ₦{transaction.total_price.toFixed(2)}</span>
                      <span>Paid: ₦{transaction.amount_paid.toFixed(2)}</span>
                      {transaction.balance > 0 && (
                        <span className="balance-owed">Balance: ₦{transaction.balance.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="transaction-date">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
