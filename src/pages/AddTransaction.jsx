import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AddTransaction() {
  const [formData, setFormData] = useState({
    customerName: '',
    itemsBought: '',
    totalPrice: '',
    amountPaid: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const totalPrice = parseFloat(formData.totalPrice) || 0
    const amountPaid = parseFloat(formData.amountPaid) || 0
    const balance = totalPrice - amountPaid

    let status = 'pending'
    if (balance === 0) status = 'paid'
    else if (amountPaid > 0) status = 'partial'

    const { error } = await supabase.from('transactions').insert([
      {
        customer_name: formData.customerName,
        items_bought: formData.itemsBought,
        total_price: totalPrice,
        amount_paid: amountPaid,
        balance: balance,
        status: status,
        transaction_date: new Date().toISOString()
      }
    ])

    setLoading(false)

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Transaction added successfully!')
      setFormData({ customerName: '', itemsBought: '', totalPrice: '', amountPaid: '' })
    }
  }

  const balance = (parseFloat(formData.totalPrice) || 0) - (parseFloat(formData.amountPaid) || 0)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Add Transaction</h1>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            placeholder="Enter customer name"
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

        {message && <div className={message.includes('Error') ? 'error-msg' : 'success-msg'}>{message}</div>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  )
}
