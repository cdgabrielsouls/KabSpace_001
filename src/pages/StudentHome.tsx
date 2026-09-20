import { ArrowRight, LogOut, MapPin } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function StudentHome() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  async function handleSignOut() {
    await signOut(auth)
    navigate('/')
  }

  return <main className="app-shell"><header className="app-header"><Link className="brand" to="/"><span className="logo-placeholder">K</span><span>KabSpace</span></Link><button className="sign-out" type="button" onClick={handleSignOut}><LogOut size={15} /> Sign out</button></header><section className="student-page"><p className="form-kicker">STUDENT SPACE</p><h1>Good to see you, {profile?.fullName?.split(' ')[0] ?? 'there'}.</h1><p className="student-intro">Find a quiet room on campus for your next study session.</p><Link className="student-primary-action" to="/colleges"><span><MapPin size={18} /> Browse available rooms</span><ArrowRight size={18} /></Link><div className="student-note"><span className="form-kicker">CURRENTLY AVAILABLE</span><strong>CEIT · DIT Building</strong><p>Explore floors and check room status before heading across campus.</p><Link to="/colleges">View campus directory <ArrowRight size={14} /></Link></div></section></main>
}
