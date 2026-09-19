import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { colleges as mockColleges, floors as mockFloors, type College, type Floor, type Room } from './campus'

export async function loadColleges(): Promise<College[]> {
  try {
    const snapshot = await getDocs(collection(db, 'colleges'))
    if (snapshot.empty) return mockColleges
    return snapshot.docs.map((item) => {
      const data = item.data()
      return { id: item.id, name: String(data.name), isActive: Boolean(data.isActive) }
    })
  } catch {
    return mockColleges
  }
}

export async function loadCeitFloors(): Promise<Floor[]> {
  try {
    const [buildingsSnapshot, floorsSnapshot, roomsSnapshot] = await Promise.all([
      getDocs(collection(db, 'buildings')),
      getDocs(collection(db, 'floors')),
      getDocs(collection(db, 'rooms')),
    ])
    const ceitBuilding = buildingsSnapshot.docs.find((item) => item.data().collegeId === 'ceit')
    const remoteFloors = floorsSnapshot.docs
      .filter((item) => item.data().buildingId === ceitBuilding?.id)
      .map((item) => {
        const data = item.data()
        const rooms: Room[] = roomsSnapshot.docs
          .filter((room) => room.data().floorId === item.id)
          .map((room): Room => {
            const roomData = room.data()
            return {
              id: room.id,
              name: String(roomData.name),
              type: roomData.type === 'Computer lab' ? 'Computer lab' : 'Regular room',
              status: roomData.status === 'RESERVED' ? 'RESERVED' : 'VACANT',
            }
          })
          .sort((first, second) => first.name.localeCompare(second.name, undefined, { numeric: true }))
        return { number: Number(data.floorNumber), rooms }
      })
      .sort((first, second) => first.number - second.number)
    return remoteFloors.length > 0 ? remoteFloors : mockFloors
  } catch {
    return mockFloors
  }
}
