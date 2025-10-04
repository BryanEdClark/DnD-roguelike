# D&D Roguelike Monster Viewer & Encounter Generator

A local web application for D&D 2024 that provides a monster database browser and intelligent encounter generator with local caching.

## Features

### 🎲 Encounter Generator
- **Smart encounter generation** based on party level and size
- **4 difficulty levels:**
  - **Easy** - 95% win chance (guaranteed win)
  - **Medium** - 75% win chance (standard challenge)
  - **Hard** - 50% win chance (serious fight)
  - **You Gonna Die** - 5% win chance (near-certain TPK)
- **Automatic XP budgeting** using D&D 2024 rules
- **CR-based monster selection** with appropriate challenge scaling
- **Action economy optimization** - favors single monsters for small parties

### 🐉 Monster Browser
- **428 D&D 5e monsters** from CR 0-30
- **Full stat blocks** with abilities, actions, and legendary actions
- **Monster images** downloaded and cached locally
- **Search and filter** by name, type, or CR
- **Click monster cards** in encounters to view full details

### 💾 Local Caching
- **Monster data cached** after first fetch (instant subsequent loads)
- **Images cached** locally (no repeated downloads)
- **No external API calls** after initial data fetch

## Quick Start

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open browser:
```
http://localhost:3000
```

## How to Use

### Generate an Encounter

1. Go to **Encounter Generator** tab (default)
2. Set **Party Level** (1-20)
3. Set **Party Size** (1-8 players)
4. Adjust **Difficulty Slider**:
   - Easy: Guaranteed win for players
   - Medium: Fair fight, players likely win
   - Hard: Challenging, 50/50 outcome
   - You Gonna Die: TPK likely
5. Click **Generate Encounter**

The system will:
- Calculate XP budget based on D&D 2024 rules
- Select appropriate CR monsters
- Display encounter with XP totals and win chance
- Show individual monster cards

### Browse Monsters

1. Switch to **Monster Browser** tab
2. Use search box to find monsters by name/type
3. Filter by CR using dropdown
4. Click any monster to view full stat block with image

### View Monster Details from Encounter

- Click any monster card in the encounter
- Automatically switches to Monster Browser tab
- Loads full monster details

## Encounter Generation Logic

The system uses D&D 2024 encounter building rules:

### XP Budget Calculation
```
Total XP Budget = XP per Character × Party Size
```

### Difficulty Scaling

| Difficulty | CR Range | Win Chance | Use Case |
|------------|----------|------------|----------|
| Easy | Level - 3 to Level - 1 | 95% | Guaranteed wins, tutorial fights |
| Medium | Level - 2 to Level | 75% | Standard encounters |
| Hard | Level - 1 to Level + 1 | 50% | Boss fights, climactic battles |
| You Gonna Die | Level to Level + 3 | 5% | Near-impossible challenges |

### Monster Selection Strategy

1. **Small parties (1-2):** Prioritizes single monsters (avoids action economy imbalance)
2. **Larger parties (3+):** Allows multiple monsters (max: party size + 1)
3. **XP matching:** Selects monsters whose total XP is closest to budget
4. **CR filtering:** Only uses monsters within appropriate CR range for difficulty

## File Structure

```
DnD-rogulike/
├── server.js              # Express server with scraping & caching
├── package.json           # Dependencies
├── monster-info/          # Monster database & documentation
│   ├── monsters.json      # 428 monsters organized by CR
│   ├── cr-xp-reference.json
│   ├── encounter-building-guide.md
│   └── README.md
├── public/                # Frontend files
│   ├── index.html         # Main UI with tabs
│   ├── styles.css         # Dark D&D theme
│   └── app.js            # Encounter logic & monster browser
├── cache/                 # Auto-created local cache
│   ├── monsters/          # JSON stat blocks
│   └── images/            # Monster images
├── PRD.md                # Product requirements
└── README.md             # This file
```

## API Endpoints

### GET /api/monsters
Get all monsters or filter by CR
```
/api/monsters              # All monsters
/api/monsters?cr=5         # CR 5 monsters only
```

### GET /api/monster/:name
Get full monster stat block (cached)
```
/api/monster/Goblin
```

Returns complete stat block with:
- Basic stats (AC, HP, Speed)
- Ability scores
- Special abilities
- Actions, Reactions, Legendary Actions
- Cached image path

## Monster Data Source

Monster data is scraped from [aidedd.org](https://www.aidedd.org/dnd-filters/monsters.php) and cached locally.

**Data includes:**
- Full stat blocks
- Monster images
- D&D 5e SRD content

## Technical Stack

- **Backend:** Node.js, Express
- **Web Scraping:** Axios, Cheerio
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Data:** JSON files, local file caching

## D&D 2024 Rules Implementation

The encounter generator implements D&D 2024 DMG rules:

- **XP Budget System** (no multipliers for multiple monsters)
- **Level-based XP thresholds** for each difficulty
- **CR to XP conversion** table
- **Action economy considerations** for solo vs party play

See `monster-info/README.md` for detailed explanation of CR system and encounter building.

## Future Enhancements

- [ ] Save/load encounters
- [ ] Export encounters to PDF
- [ ] Random encounter tables by terrain/environment
- [ ] Custom monster creation
- [ ] Initiative tracker integration
- [ ] Spell database integration

## Development

### Start development server
```bash
npm run dev
```

### Clear cache
```bash
rm -rf cache/
```

## License

MIT

---

🐉 **Happy DMing!** Generate balanced encounters and browse monsters with ease.
