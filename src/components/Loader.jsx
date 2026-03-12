export default function Loader({ fullScreen = false }) {
  return (
    <div className={fullScreen ? 'loader-fullscreen' : 'loader-container'}>
      <div className="loader-spinner"></div>
      <p className="loader-text">Loading...</p>
    </div>
  )
}
