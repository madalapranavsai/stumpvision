# 🏏 Howzatt! Cricket Scorekeeper

A simple yet powerful **Cricket Scorekeeping Web App** that lets you manage live matches, keep score, track batters/bowlers, and generate a full scorecard.

---

## ✨ Features

- **Match Setup**
  - Enter Team 1 & Team 2 names
  - Toss winner & decision (Bat/Bowl)
  - Overs limit (1–50)

- **Live Match**
  - Add runs (0, 1, 2, 3, 4, 6)
  - Record wickets with dismissal type + fielder
  - Add extras (wide, no-ball, bye, leg-bye, penalty)
  - Track current striker, non-striker, bowler
  - Auto strike rotation & over progression
  - **Undo & Redo any ball** (correct mistakes instantly)
  - Live commentary feed

- **Scorecard**
  - Batting card (Runs, Balls, 4s, 6s, Strike Rate)
  - Bowling card (Overs, Maidens, Runs, Wickets, Economy)
  - Highlight striker and wicket takers
  - Show **All Out** summary if 10 wickets fall

- **Summary**
  - Team totals & result
  - Partnerships
  - Extras breakdown

---

## 📂 Project Structure
📁 howzatt-cricket-scorekeeper
├── setup.html        # Match setup page
├── setup.css         # Styling for setup
├── live.html         # Live match scoring page
├── live.css          # Styling for live match
├── scorecard.html    # Full scorecard view
├── scorecard.css     # Styling for scorecard
├── base_styles.css   # Shared global styles
└── score.js          # Core game logic
---

## 🚀 How to Use

1. **Start Match**
   - Open `setup.html`
   - Enter team names, toss result, and overs
   - Click **Start Match**

2. **Live Scoring**
   - Scoring buttons for runs, wickets, and extras
   - Undo/Redo buttons to correct mistakes
   - Commentary updates automatically
   - End innings manually when required

3. **View Scorecard**
   - Click **Scorecard** to open `scorecard.html`
   - Batting & bowling stats update in real time

---

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3 (modular stylesheets)
- **Logic**: Vanilla JavaScript (`score.js`)
- **Storage**: LocalStorage (persists match state across pages)

---

## 🔮 Planned Improvements

- Multiple innings support (2nd innings + target tracking)
- Export scorecard as **PDF/CSV**
- Responsive mobile-first design enhancements
- Better UI for fielder/bowler selection (dropdown instead of prompt)



---

## 👨‍💻 Author

Built with ❤️ by [Madala Pranav Sai]
