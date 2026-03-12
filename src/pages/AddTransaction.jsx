import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import CustomerInput from '../components/CustomerInput'
import Toast from '../components/Toast'

export default function AddTransaction() {
  const [formData, setFormData] = useState({
    customerName: '',
    itemsBought: '',
    totalPrice: '',
    amountPaid: ''
  })
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const totalPrice = parseFloat(formData.totalPrice) || 0
      const amountPaid = parseFloat(formData.amountPaid) || 0
      const balance = totalPrice - amountPaid

      let status = 'pending'
      if (balance === 0) status = 'paid'
      else if (amountPaid > 0) status = 'partial'

      const customerName = formData.customerName.toLowerCase().trim()

      // Check if customer exists, if not create
      let customerId
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
        
        // Refresh customer list
        fetchCustomers()
      }

      // Insert transaction
      const { error } = await supabase.from('transactions').insert([
        {
          customer_id: customerId,
          customer_name: customerName,
          items_bought: formData.itemsBought.toLowerCase().trim(),
          total_price: totalPrice,
          amount_paid: amountPaid,
          balance: balance,
          status: status,
          transaction_date: new Date().toISOString()
        }
      ])

      if (error) throw error
      
      showToast('Transaction added successfully!')
      setFormData({ customerName: '', itemsBought: '', totalPrice: '', amountPaid: '' })
    } catch (error) {
      showToast('Error: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const balance = (parseFloat(formData.totalPrice) || 0) - (parseFloat(formData.amountPaid) || 0)

  return (
    <div className="page">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <div className="page-header">
        <h1>Add Transaction</h1>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Customer Name</label>
          <CustomerInput
            value={formData.customerName}
            onChange={(value) => setFormData({ ...formData, customerName: value })}
            customers={customers}
            required
          />
        </div>

        <div className="form-group">
          <label>Items Bought</label>
          <textarea
            name="itemsBought"
            value={formData.itemsBought}
            onChange={handleChange}
            required
            placeholder="Enter items/fabrics bought"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Total Price (₦)</label>
          <input
            type="number"
            name="totalPrice"
            value={formData.totalPrice}
            onChange={handleChange}
            required
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Amount Paid (₦)</label>
          <input
            type="number"
            name="amountPaid"
            value={formData.amountPaid}
            onChange={handleChange}
            required
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className="balance-preview">
          <span>Balance:</span>
          <span className={balance > 0 ? 'debt' : 'paid'}>
            ₦{balance.toFixed(2)}
          </span>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  )
}
