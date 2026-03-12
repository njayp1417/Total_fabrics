export default function DateFilter({ startDate, endDate, onStartChange, onEndChange, onClear }) {
  return (
    <div className="date-filter">
      <div className="date-input-group">
        <label>From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="date-input"
        />
      </div>
      <div className="date-input-group">
        <label>To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="date-input"
        />
      </div>
      {(startDate || endDate) && (
        <button className="date-clear-btn" onClick={onClear}>Clear</button>
      )}
    </div>
  )
}
