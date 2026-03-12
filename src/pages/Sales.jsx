import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import SearchBar from '../components/SearchBar'
import DateFilter from '../components/DateFilter'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import Toast from '../components/Toast'
import CustomerInput from '../components/CustomerInput'

export default function Sales() {
  const [transactions, setTransactions] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [editModal, setEditModal] = useState({ isOpen: false, transaction: null })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchTransactions()
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, total_debt')
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Failed to load customers:', error)
    }
  }

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      showToast('Failed to load transactions: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  const handleEdit = (transaction) => {
    setEditModal({ isOpen: true, transaction: { ...transaction } })
  }

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', deleteModal.id)

      if (error) throw error
      showToast('Transaction deleted successfully')
      fetchTransactions()
      setDeleteModal({ isOpen: false, id: null })
    } catch (error) {
      showToast('Failed to delete: ' + error.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const { transaction } = editModal
      const totalPrice = parseFloat(transaction.total_price)
      const amountPaid = parseFloat(transaction.amount_paid)
      const balance = totalPrice - amountPaid
      
      let status = 'pending'
      if (balance === 0) status = 'paid'
      else if (amountPaid > 0) status = 'partial'

      const customerName = transaction.customer_name.toLowerCase().trim()

      let customerId = transaction.customer_id
      const existingCustomer = customers.find(c => c.name === customerName)
      
      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{ name: customerName }])
          .select()
          .single()

        if (customerError) throw customerError
        customerId = newCustomer.id
        fetchCustomers()
      }

      const { error } = await supabase
        .from('transactions')
        .update({
          customer_id: customerId,
          customer_name: customerName,
          items_bought: transaction.items_bought.toLowerCase().trim(),
          total_price: totalPrice,
          amount_paid: amountPaid,
          balance,
          status
        })
        .eq('id', transaction.id)

      if (error) throw error
      showToast('Transaction updated successfully')
      fetchTransactions()
      setEditModal({ isOpen: false, transaction: null })
    } catch (error) {
      showToast('Failed to update: ' + error.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const totalSales = transactions.reduce((sum, t) => sum + (t.total_price || 0), 0)
  const totalPaid = transactions.reduce((sum, t) => sum + (t.amount_paid || 0), 0)

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false
    if (searchQuery && !t.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (startDate && new Date(t.transaction_date) < new Date(startDate)) return false
    if (endDate && new Date(t.transaction_date) > new Date(endDate + 'T23:59:59')) return false
    return true
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

      <DateFilter
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        onClear={() => { setStartDate(''); setEndDate('') }}
      />

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
        <Loader />
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
                  <div className="transaction-actions">
                    <button className="btn-edit" onClick={() => handleEdit(transaction)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(transaction.id)}>Delete</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, transaction: null })}
        title="Edit Transaction"
      >
        {editModal.transaction && (
          <form onSubmit={saveEdit} className="modal-form">
            <div className="form-group">
              <label>Customer Name</label>
              <CustomerInput
                value={editModal.transaction.customer_name}
                onChange={(value) => setEditModal({
                  ...editModal,
                  transaction: { ...editModal.transaction, customer_name: value }
                })}
                customers={customers}
                required
              />
            </div>
            <div className="form-group">
              <label>Items Bought</label>
              <textarea
                value={editModal.transaction.items_bought}
                onChange={(e) => setEditModal({
                  ...editModal,
                  transaction: { ...editModal.transaction, items_bought: e.target.value }
                })}
                required
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Total Price (₦)</label>
              <input
                type="number"
                value={editModal.transaction.total_price}
                onChange={(e) => setEditModal({
                  ...editModal,
                  transaction: { ...editModal.transaction, total_price: e.target.value }
                })}
                required
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Amount Paid (₦)</label>
              <input
                type="number"
                value={editModal.transaction.amount_paid}
                onChange={(e) => setEditModal({
                  ...editModal,
                  transaction: { ...editModal.transaction, amount_paid: e.target.value }
                })}
                required
                step="0.01"
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setEditModal({ isOpen: false, transaction: null })}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Transaction"
      >
        <div className="delete-confirm">
          <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setDeleteModal({ isOpen: false, id: null })}>Cancel</button>
            <button className="btn-danger" onClick={confirmDelete} disabled={actionLoading}>
              {actionLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
