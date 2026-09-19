export type RoomStatus = 'VACANT' | 'RESERVED'

export type College = {
  id: string
  name: string
  isActive: boolean
}

export type Room = {
  id: string
  name: string
  type: 'Computer lab' | 'Regular room'
  status: RoomStatus
}

export type Floor = {
  number: number
  rooms: Room[]
}

export const colleges: College[] = [
  { id: 'agriculture', name: 'College of Agriculture, Food, Environment and Natural Resources', isActive: false },
  { id: 'arts-sciences', name: 'College of Arts and Sciences', isActive: false },
  { id: 'criminal-justice', name: 'College of Criminal Justice', isActive: false },
  { id: 'economics', name: 'College of Economics, Management, and Development Studies', isActive: false },
  { id: 'education', name: 'College of Education', isActive: false },
  { id: 'ceit', name: 'College of Engineering and Information Technology', isActive: true },
  { id: 'nursing', name: 'College of Nursing', isActive: false },
  { id: 'sports', name: 'College of Sports, Physical Education and Recreation', isActive: false },
  { id: 'veterinary', name: 'College of Veterinary Medicine and Biomedical Sciences', isActive: false },
]

const room = (name: string, type: Room['type'], status: RoomStatus): Room => ({ id: name, name, type, status })

export const floors: Floor[] = [
  { number: 1, rooms: [room('101', 'Regular room', 'VACANT'), room('102', 'Regular room', 'RESERVED'), room('103', 'Regular room', 'VACANT')] },
  { number: 2, rooms: [room('CCL201', 'Computer lab', 'VACANT'), room('CCL202', 'Computer lab', 'RESERVED'), room('CCL203', 'Computer lab', 'VACANT'), room('204', 'Regular room', 'VACANT'), room('205', 'Regular room', 'RESERVED')] },
  { number: 3, rooms: [room('CCL301', 'Computer lab', 'RESERVED'), room('CCL302', 'Computer lab', 'VACANT'), room('CCL303', 'Computer lab', 'VACANT'), room('304', 'Regular room', 'RESERVED'), room('305', 'Regular room', 'VACANT')] },
  { number: 4, rooms: [room('CCL401', 'Computer lab', 'VACANT'), room('CCL402', 'Computer lab', 'VACANT'), room('CCL403', 'Computer lab', 'RESERVED'), room('404', 'Regular room', 'VACANT'), room('405', 'Regular room', 'VACANT')] },
]
