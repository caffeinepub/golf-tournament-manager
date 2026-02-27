# Golf Tournament Manager

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full tournament management: create, edit, delete tournaments with name, date, location, format (stroke play, match play, Stableford), and status (upcoming, in progress, completed)
- Player management: player profiles with name and handicap, add/remove players from tournaments
- Scorecard system: 18-hole score entry per player per tournament, gross and net score calculation, Stableford points calculation
- Live leaderboard: real-time rankings during tournament, final results, per-player score history
- Dashboard: overview of upcoming/past tournaments, quick stats (total players, tournaments played)
- Mobile-first UI with bottom navigation bar, golf-themed green palette, card-based layout
- Realistic mock data: 3+ sample tournaments, 8+ players, sample scores

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Set up React Router with bottom tab navigation (Dashboard, Tournaments, Players, Leaderboard)
2. Create AppContext with useState for tournaments, players, and scores
3. Build mock data: players (with handicaps), tournaments (upcoming/in-progress/completed), scorecards
4. Dashboard page: stats cards, upcoming tournaments list, recent results
5. Tournaments page: list view, create/edit/delete tournament modal
6. Tournament detail page: player roster, scorecard entry, leaderboard tab
7. Scorecard page: 18-hole grid for score entry, auto-calc gross/net/Stableford
8. Leaderboard page: ranked table with gross/net scores, Stableford points
9. Players page: player list, add/edit player, handicap display
10. Apply golf-themed design: greens (#15803d, #166534), white cards, clean typography

## UX Notes
- Bottom navigation with 4 tabs: Dashboard, Tournaments, Players, Leaderboard
- Tournament cards show status badge (upcoming = blue, in progress = green pulse, completed = gray)
- Scorecard uses compact grid layout optimized for mobile (swipeable or scrollable)
- Leaderboard shows +/- to par for stroke play, points for Stableford
- Floating action button for quick tournament/player creation
- Smooth transitions between views
