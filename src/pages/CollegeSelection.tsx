import { ArrowRight, Check, LockKeyhole, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useEffect, useState } from 'react'
import { type College } from '../data/campus'
import { loadColleges } from '../data/campusRepository'

export default function CollegeSelection() {
  const navigate = useNavigate()
  const [colleges, setColleges] = useState<College[]>([])

  useEffect(() => {
    void loadColleges().then(setColleges)
  }, [])

  async function handleSignOut() {
    await signOut(auth)
    navigate('/')
  }

  return <main className="app-shell">
    <header className="app-header"><Link className="brand" to="/"><span className="logo-placeholder">K</span><span>KabSpace</span></Link><button className="sign-out" type="button" onClick={handleSignOut}><LogOut size={15} /> Sign out</button></header>
    <section className="college-page"><div className="page-intro"><div><p className="form-kicker">CAMPUS DIRECTORY</p><h1>Choose your college.</h1><p>Select an area to see its buildings and room availability.</p></div><span className="active-count"><Check size={15} /> {colleges.filter((college) => college.isActive).length} area available</span></div><div className="college-grid">{colleges.map((college) => college.isActive ? <Link className="college-card active" to="/ceit" key={college.id}><div><span className="card-label">AVAILABLE NOW</span><h2>{college.name}</h2><p>DIT Building · 4 floors</p></div><ArrowRight size={20} /></Link> : <div className="college-card locked" key={college.id}><div><h2>{college.name}</h2><p>Coming soon</p></div><LockKeyhole size={16} /></div>)}</div></section>
  </main>
}
