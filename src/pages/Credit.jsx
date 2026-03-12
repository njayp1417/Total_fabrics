import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Credit() {
  const [debtors, setDebtors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDebtors()
  }, [])

  const fetchDebtors = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gt('balance', 0)
      .order('transaction_date', { ascending: false })

    if (!error && data) {
      const grouped = data.reduce((acc, transaction) => {
        const name = transaction.customer_name
        if (!acc[name]) {
          acc[name] = {
            customerName: name,
            totalBalance: 0,
            transactions: []
          }
        }
        acc[name].totalBalance += transaction.balance
        acc[name].transactions.push(transaction)
        return acc
      }, {})

      setDebtors(Object.values(grouped).sort((a, b) => b.totalBalance - a.totalBalance))
    }
    setLoading(false)
  }

  const totalDebt = debtors.reduce((sum, d) => sum + d.totalBalance, 0)

  return (
    <div className="page">
      <div className="stats-card debt-card">
        <div className="stat">
          <span className="stat-label">Total Outstanding</span>
          <span className="stat-value debt">₦{totalDebt.toFixed(2)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Debtors</span>
          <span className="stat-value">{debtors.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="debtors-list">
          {debtors.length === 0 ? (
            <div className="empty-state">No outstanding balances</div>
          ) : (
            debtors.map((debtor, index) => (
              <div key={index} className="debtor-card">
                <div className="debtor-header">
                  <span className="debtor-name">{debtor.customerName}</span>
                  <span className="badge badge-danger">Pending</span>
                </div>
                <div className="debtor-amount">
                  <span>Amount Owed:</span>
                  <span className="debt-value">₦{debtor.totalBalance.toFixed(2)}</span>
                </div>
                <div className="debtor-count">
                  {debtor.transactions.length} unpaid transaction{debtor.transactions.length > 1 ? 's' : ''}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
