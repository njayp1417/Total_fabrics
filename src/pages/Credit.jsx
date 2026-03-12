import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import SearchBar from '../components/SearchBar'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import Toast from '../components/Toast'

export default function Credit() {
  const [debtors, setDebtors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, debtor: null })
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchDebtors()
  }, [])

  const fetchDebtors = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gt('balance', 0)
        .order('transaction_date', { ascending: false })

      if (error) throw error

      if (data) {
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
    } catch (error) {
      showToast('Failed to load debtors: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  const openPaymentModal = (debtor) => {
    setPaymentModal({ isOpen: true, debtor })
    setSelectedTransaction(debtor.transactions[0].id)
    setPaymentAmount('')
  }

  const recordPayment = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const transaction = paymentModal.debtor.transactions.find(t => t.id === selectedTransaction)
      const payment = parseFloat(paymentAmount)
      
      if (payment <= 0 || payment > transaction.balance) {
        throw new Error('Invalid payment amount')
      }

      const newAmountPaid = transaction.amount_paid + payment
      const newBalance = transaction.total_price - newAmountPaid
      let newStatus = 'partial'
      if (newBalance === 0) newStatus = 'paid'

      const { error } = await supabase
        .from('transactions')
        .update({
          amount_paid: newAmountPaid,
          balance: newBalance,
          status: newStatus
        })
        .eq('id', selectedTransaction)

      if (error) throw error
      showToast('Payment recorded successfully')
      fetchDebtors()
      setPaymentModal({ isOpen: false, debtor: null })
      setPaymentAmount('')
    } catch (error) {
      showToast(error.message || 'Failed to record payment', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredDebtors = debtors.filter(d =>
    d.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalDebt = filteredDebtors.reduce((sum, d) => sum + d.totalBalance, 0)

  const selectedTransactionData = paymentModal.debtor?.transactions.find(t => t.id === selectedTransaction)

  return (
    <div className="page">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by customer name..."
      />

      <div className="stats-card debt-card">
        <div className="stat">
          <span className="stat-label">Total Outstanding</span>
          <span className="stat-value debt">₦{totalDebt.toFixed(2)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Debtors</span>
          <span className="stat-value">{filteredDebtors.length}</span>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="debtors-list">
          {filteredDebtors.length === 0 ? (
            <div className="empty-state">{searchQuery ? 'No matching debtors found' : 'No outstanding balances'}</div>
          ) : (
            filteredDebtors.map((debtor, index) => (
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
                <button className="btn-payment" onClick={() => openPaymentModal(debtor)}>
                  Record Payment
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <Modal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, debtor: null })}
        title="Record Payment"
      >
        {paymentModal.debtor && (
          <form onSubmit={recordPayment} className="modal-form">
            <div className="payment-info">
              <h3>{paymentModal.debtor.customerName}</h3>
              <p className="total-debt">Total Owed: ₦{paymentModal.debtor.totalBalance.toFixed(2)}</p>
            </div>

            <div className="form-group">
              <label>Select Transaction</label>
              <select
                value={selectedTransaction || ''}
                onChange={(e) => setSelectedTransaction(e.target.value)}
                required
              >
                {paymentModal.debtor.transactions.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.items_bought.substring(0, 30)}... - Balance: ₦{t.balance.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {selectedTransactionData && (
              <div className="transaction-details">
                <p>Total: ₦{selectedTransactionData.total_price.toFixed(2)}</p>
                <p>Paid: ₦{selectedTransactionData.amount_paid.toFixed(2)}</p>
                <p className="balance-highlight">Balance: ₦{selectedTransactionData.balance.toFixed(2)}</p>
              </div>
            )}

            <div className="form-group">
              <label>Payment Amount (₦)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                max={selectedTransactionData?.balance}
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setPaymentModal({ isOpen: false, debtor: null })}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
