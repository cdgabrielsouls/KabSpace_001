# Firestore setup

The app reads these collections after authentication:

- `colleges/{collegeId}`: `name`, `isActive`
- `buildings/{buildingId}`: `collegeId`, `name`
- `floors/{floorId}`: `buildingId`, `floorNumber`
- `rooms/{roomId}`: `floorId`, `name`, `type`, `status`

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
