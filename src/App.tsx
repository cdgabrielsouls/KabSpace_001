import { Moon, MoveUpRight, Sun } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import CollegeSelection from './pages/CollegeSelection'
import CeitBuilding from './pages/CeitBuilding'
import Login from './pages/Login'
import './App.css'

function Landing() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="KabSpace home"><span className="logo-placeholder" aria-hidden="true">K</span><span>KabSpace</span></a>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <button className="theme-toggle" type="button" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setIsDark((current) => !current)}>{isDark ? <Sun size={17} /> : <Moon size={17} />}</button>
          <Link className="nav-login" to="/login">Log in <MoveUpRight size={15} /></Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> CEIT · DIT BUILDING</p>
          <h1>Find your next <em>quiet place</em> to focus.</h1>
          <p className="hero-description">A simpler way to see what is happening in your campus rooms, so you can spend less time looking and more time learning.</p>
          <Link className="primary-action" to="/login">Get started <MoveUpRight size={18} /></Link>
          <p className="domain-note">For Cavite State University students and faculty</p>
        </div>

        <div className="availability-panel" aria-label="KabSpace room availability preview">
          <div className="panel-heading"><div><span className="panel-kicker">LIVE PREVIEW</span><h2>Room availability</h2></div><span className="status-pulse"><span /> Updating</span></div>
          <div className="building-line"><span>CEIT · DIT Building</span><span>Today, 10:42 AM</span></div>
          <div className="room-preview-list"><RoomPreview name="CCL201" type="Computer lab" status="VACANT" /><RoomPreview name="CCL202" type="Computer lab" status="RESERVED" /><RoomPreview name="204" type="Lecture room" status="VACANT" /></div>
          <div className="panel-footer"><span>Floor 2 of 4</span><Link to="/login">View all rooms <MoveUpRight size={14} /></Link></div>
        </div>
      </section>

      <section className="trust-strip" id="how-it-works"><p>One place to check before you head across campus.</p><div className="trust-items"><span><b>01</b> Choose your college</span><span><b>02</b> Select a building</span><span><b>03</b> See room status</span></div></section>
    </main>
  )
}

function RoomPreview({ name, type, status }: { name: string; type: string; status: 'VACANT' | 'RESERVED' }) {
  return <div className="room-row"><div><strong>{name}</strong><span>{type}</span></div><span className={`status-badge ${status.toLowerCase()}`}><i />{status}</span></div>
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="route-loading">Loading KabSpace...</div>
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return <AuthProvider><BrowserRouter><Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<Login />} /><Route path="/colleges" element={<ProtectedRoute><CollegeSelection /></ProtectedRoute>} /><Route path="/ceit" element={<ProtectedRoute><CeitBuilding /></ProtectedRoute>} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter></AuthProvider>
}

export default App
