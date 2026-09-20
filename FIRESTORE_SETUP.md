# Firestore setup

The app reads these collections after authentication:

- `colleges/{collegeId}`: `name`, `isActive`
- `buildings/{buildingId}`: `collegeId`, `name`
- `floors/{floorId}`: `buildingId`, `floorNumber`
- `rooms/{roomId}`: `floorId`, `name`, `type`, `status`
- `reservations/{reservationId}`: `roomId`, `roomName`, `floorNumber`, `professorId`, `professorName`, `startAt`, `endAt`, `status`

User profiles are stored at `users/{uid}`. New accounts choose a role once during onboarding:

- Students are saved with `role: student`, `roleStatus: confirmed`.
- Professors are saved with `role: professor`, `roleStatus: pending` and reservation requests are saved with `status: PENDING`.

Use these IDs for the first CEIT seed:

- College: `ceit`
- Building: `dit-building`
- Floors: `floor-1`, `floor-2`, `floor-3`, `floor-4`

For each room, use the matching floor ID (`floor-1` through `floor-4`). Room `type` must be `Computer lab` or `Regular room`; `status` must be `VACANT` or `RESERVED`.

The app intentionally falls back to the local mock dataset until Firestore has data, so the UI remains available during setup.

## Deploy the rules

Install the Firebase CLI if needed, then from the project directory:

```text
firebase login
firebase use kabspace
firebase deploy --only firestore:rules
```

The included `firestore.rules` allows authenticated users to read campus data and only allows each signed-in user to read/write their own `users/{uid}` profile. Campus documents should be managed from the Firebase Console or an administrator-only server process.

Authenticated students can read pending and approved reservations. Professors can create their own pending reservation requests, but cannot edit or delete requests from the client.

## Admin beta

Do not use `admin123` / `pass123` as a hardcoded application credential. The admin dashboard uses the existing Firebase Auth account plus a Firestore role.

1. Create or sign in to a dedicated admin account through the normal KabSpace login.
2. In Firestore, open `users/{admin-uid}`.
3. Set `role` to `admin`.
4. Open `http://localhost:5173/admin` while signed in with that account.

The admin dashboard can approve professor profiles and pending reservations. Deploy `firestore.rules` after this change so those actions are enforced by Firebase, not just the UI.
