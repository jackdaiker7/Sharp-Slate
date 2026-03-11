# Sharp Slate — Project Context

## What This Is
A public DFS (Daily Fantasy Sports) optimizer website for DraftKings, built for the user Jack.
Live at: sharpslate.net
GitHub repo: sharp-slate
Hosted on: Netlify (auto-deploys on push to main)

## Working Directory
C:\Users\jackd\Documents\sharp-slate

## File Structure
```
sharp-slate/
├── index.html        # Main lineups page
├── about.html        # About page explaining the concept
├── style.css         # All styles (WTA-inspired purple theme, #2D0046)
├── app.js            # CSV parsing, opponent lookup, sorting, filtering
└── data/
    ├── players.csv   # Updated each week with new player pool
    └── config.json   # Tournament name, date, sport — updated each week
```

## Weekly Update Workflow
1. Jack pastes new CSV data in chat (or describes changes)
2. Claude updates data/players.csv and data/config.json
3. Jack opens GitHub Desktop → commits → pushes
4. Netlify auto-rebuilds sharpslate.net in ~1 min

## CSV Format
`Player, Pairing, Number, Projected Points, Salary, Optimal`
- Pairing: integer grouping two opponents in the same match
- Optimal: 1 = in optimal lineup, 0 = not selected
- Opponent is derived client-side from the Pairing column

## config.json Format
```json
{
  "tournament": "Miami Open",
  "date": "March 19-20, 2025",
  "sport": "Tennis"
}
```

## Tech Stack
- Vanilla HTML/CSS/JS — no framework, no build step
- PapaParse (CDN) for CSV parsing
- Google Fonts: Inter

## Design
- WTA-inspired purple theme: primary #2D0046, accent #9b30d9
- Nav bar with "Lineups" and "About" tabs
- Optimal lineup shown as cards at top (3x2 grid)
- Full player pool table below, sortable by any column, filterable by name
- Optimal players highlighted in purple with checkmark

## Sports Roadmap
Currently: Tennis
Planned: F1, UFC

## Known Issues / Notes
- Write tool fails on paths with spaces ("DFS Site") — use Bash cat heredoc instead
- Old working directory (C:\Users\jackd\OneDrive\Documents\DFS Site) is no longer used
