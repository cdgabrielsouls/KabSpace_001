import { Moon, MoveUpRight, Sun } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import CollegeSelection from './pages/CollegeSelection'
import CeitBuilding from './pages/CeitBuilding'
import Login from './pages/Login'
import RoleSetup from './pages/RoleSetup'
import AdminDashboard from './pages/AdminDashboard'
import StudentHome from './pages/StudentHome'
import './App.css'
import logo from './assets/kabspace-logo.png'

function Landing() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  return (
    <main className="site-shell route-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="KabSpace home">
          <img className="logo-placeholder" src={logo} alt="" aria-hidden="true" />
          <span>KabSpace</span>
        </a>

        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#campus">Campus</a>
          <button
            className="theme-toggle"
            type="button"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setIsDark((current) => !current)}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link className="nav-login" to="/login">Log in <MoveUpRight size={15} /></Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="pill-tag">Campus planning, simplified</span>
          <h1><span className="hero-brand-highlight">KabSpace</span></h1>
          <p className="hero-description">
            Find a quiet place to focus. Check room availability and reserve your space without the usual campus chaos.
          </p>

          <div className="cta-row">
            <Link className="primary-action" to="/login">Get started <MoveUpRight size={18} /></Link>
            <Link className="secondary-action" to="/colleges"><span className="play-pill" aria-hidden="true">▶</span> Browse spaces</Link>
          </div>

          <div className="hero-meta" aria-label="Platform stats">
            <div className="mini-stat">
              <strong>4</strong>
              <span>floors</span>
            </div>
            <div className="mini-stat">
              <strong>24/7</strong>
              <span>visibility</span>
            </div>
            <div className="mini-stat">
              <strong>Live</strong>
              <span>availability</span>
            </div>
          </div>
        </div>

        <div className="availability-panel" aria-label="Room availability preview">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">TODAY</span>
              <h2>CEIT · DIT Building</h2>
            </div>
            <span className="status-pulse"><span /> Open</span>
          </div>

          <div className="dash-card">
            <div>
              <small>Available rooms</small>
              <strong>12</strong>
            </div>
            <span className="pill-success">Ready</span>
          </div>

          <div className="stat-grid">
            <div className="mini-panel">
              <span>Study halls</span>
              <strong>6</strong>
            </div>
            <div className="mini-panel accent-panel">
              <span>Quiet zones</span>
              <strong>3</strong>
            </div>
          </div>

          <div className="progress-block">
            <div className="progress-header">
              <span>Peak window</span>
              <strong>2:00 PM</strong>
            </div>
            <div className="progress-track"><span /></div>
          </div>

          <div className="mini-rows">
            <div className="row-line"><span>Floor 2</span><strong>4 free</strong></div>
            <div className="row-line"><span>Floor 3</span><strong>3 free</strong></div>
            <div className="row-line"><span>Floor 4</span><strong>5 free</strong></div>
          </div>
        </div>
      </section>

      <section className="feature-band" id="features">
        <div className="feature-card">
          <div className="feature-icon accent">Search</div>
          <h3>Browse real-time availability</h3>
          <p>See which spaces are open, occupied, or pending before you walk across campus.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">Sync</div>
          <h3>Stay in sync with your plans</h3>
          <p>Check campus updates, room status, and reservation flow from one direct experience.</p>
        </div>
        <div className="feature-card" id="campus">
          <div className="feature-icon">Flow</div>
          <h3>Built for campus routines</h3>
          <p>From quick study sessions to academic reservations, KabSpace keeps your room decisions simple.</p>
        </div>
      </section>

      <section className="trust-strip" id="how-it-works">
        <p>Everything needed to move through campus with less friction and more focus.</p>
        <div className="trust-items">
          <span>Live room data</span>
          <span>Campus-wide access</span>
          <span>Smoother planning</span>
        </div>
      </section>
    </main>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="route-loading">Loading KabSpace...</div>
  return user ? children : <Navigate to="/login" replace />
}

function RoleRequired({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <div className="route-loading">Loading KabSpace...</div>
  return profile?.role ? children : <Navigate to="/onboarding" replace />
}

function AdminRequired({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <div className="route-loading">Loading KabSpace...</div>
  return profile?.role === 'admin' ? children : <Navigate to="/colleges" replace />
}

function StudentRequired({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <div className="route-loading">Loading KabSpace...</div>
  return profile?.role === 'student' ? children : <Navigate to="/colleges" replace />
}

function AppRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<ProtectedRoute><RoleSetup /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute><StudentRequired><StudentHome /></StudentRequired></ProtectedRoute>} />
      <Route path="/colleges" element={<ProtectedRoute><RoleRequired><CollegeSelection /></RoleRequired></ProtectedRoute>} />
      <Route path="/ceit" element={<ProtectedRoute><RoleRequired><CeitBuilding /></RoleRequired></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminRequired><AdminDashboard /></AdminRequired></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
