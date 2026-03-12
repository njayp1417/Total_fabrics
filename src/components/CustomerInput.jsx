import { useState, useEffect, useRef } from 'react'

export default function CustomerInput({ value, onChange, customers, required = true }) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    if (value && value.length > 0) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredCustomers(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredCustomers([])
      setShowSuggestions(false)
    }
  }, [value, customers])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (customerName) => {
    onChange(customerName)
    setShowSuggestions(false)
  }

  return (
    <div className="customer-input-wrapper">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value && filteredCustomers.length > 0 && setShowSuggestions(true)}
        placeholder="Enter customer name"
        required={required}
        autoComplete="off"
      />
      {showSuggestions && filteredCustomers.length > 0 && (
        <div ref={suggestionsRef} className="customer-suggestions">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="customer-suggestion-item"
              onClick={() => handleSelect(customer.name)}
            >
              <div className="suggestion-name">{customer.name}</div>
              <div className="suggestion-stats">
                {customer.total_debt > 0 && (
                  <span className="suggestion-debt">Owes: ₦{customer.total_debt.toFixed(2)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
