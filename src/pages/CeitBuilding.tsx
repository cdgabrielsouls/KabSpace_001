import { ArrowLeft, ChevronDown, LogOut, Monitor, MoveUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { floors as fallbackFloors, type Floor, type Room } from '../data/campus'
import { loadCeitFloors } from '../data/campusRepository'

function StatusBadge({ status }: { status: Room['status'] }) {
  return <span className={`status-badge ${status.toLowerCase()}`}><i />{status}</span>
}

export default function CeitBuilding() {
  const navigate = useNavigate()
  const [activeFloor, setActiveFloor] = useState(2)
  const [floors, setFloors] = useState<Floor[]>([])

  useEffect(() => {
    void loadCeitFloors().then(setFloors)
  }, [])

  const availableFloors = floors.length > 0 ? floors : fallbackFloors
  const floor = availableFloors.find((item) => item.number === activeFloor) ?? availableFloors[0]
  const vacantCount = floor.rooms.filter((room) => room.status === 'VACANT').length

  async function handleSignOut() {
    await signOut(auth)
    navigate('/')
  }

  return <main className="app-shell"><header className="app-header"><Link className="brand" to="/"><span className="logo-placeholder">K</span><span>KabSpace</span></Link><button className="sign-out" type="button" onClick={handleSignOut}><LogOut size={15} /> Sign out</button></header><section className="building-page"><Link className="back-link" to="/colleges"><ArrowLeft size={16} /> All colleges</Link><div className="building-heading"><div><p className="form-kicker">CEIT · DIT BUILDING</p><h1>Find a room to focus.</h1><p>Browse the four floors of the Department of Information Technology building.</p></div><div className="building-meta"><span className="building-meta-icon"><Monitor size={18} /></span><span><b>DIT Building</b><small>CEIT campus area</small></span></div></div><div className="floor-toolbar"><div className="floor-tabs" role="tablist" aria-label="Building floors">{availableFloors.map((item) => <button key={item.number} className={activeFloor === item.number ? 'selected' : ''} type="button" role="tab" aria-selected={activeFloor === item.number} onClick={() => setActiveFloor(item.number)}>Floor {item.number}</button>)}</div><div className="floor-select-wrap"><select value={activeFloor} onChange={(event) => setActiveFloor(Number(event.target.value))} aria-label="Select floor">{availableFloors.map((item) => <option key={item.number} value={item.number}>Floor {item.number}</option>)}</select><ChevronDown size={15} /></div></div><div className="floor-summary"><div><span className="form-kicker">FLOOR {floor.number}</span><h2>{vacantCount} rooms available</h2></div><span>{floor.rooms.length} rooms total</span></div><div className="room-grid">{floor.rooms.map((room) => <article className="room-card" key={room.id}><div className="room-card-top"><span className="room-number">{room.name}</span><StatusBadge status={room.status} /></div><p>{room.type}</p><a href="#details">Room details <MoveUpRight size={13} /></a></article>)}</div></section></main>
}
