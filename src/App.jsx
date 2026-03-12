import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AddTransaction from './pages/AddTransaction'
import Sales from './pages/Sales'
import Credit from './pages/Credit'
import BottomNav from './components/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <Router>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Total Fabrics</h1>
        </header>
        
        <main className="app-content">
          <Routes>
            <Route path="/" element={<AddTransaction />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/credit" element={<Credit />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </Router>
    </ErrorBoundary>
  )
}

export default App
