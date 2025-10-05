# Product Requirements Document: D&D 2024 Play Tools

## Overview

A comprehensive web-based tool for D&D 2024 (5th Edition) that provides both Dungeon Master (DM) and Player tools for character management, encounter generation, and gameplay automation. The application features full server-side persistence, automated calculations, and extensive D&D 2024 rules implementation.

## Core Principles

- **D&D 2024 Rules**: All features follow D&D 2024 (5th Edition) rules and mechanics
- **Server-Side Persistence**: All data changes persist to the server automatically
- **GUI-Based Interactions**: All prompts and user interactions go through the graphical interface (no command-line)
- **Automation**: Extensive auto-calculation and auto-population features to streamline gameplay
- **Multi-User Support**: Account-based system with individual user data isolation

## Technical Architecture

### Backend (Node.js/Express)
- RESTful API for all data operations
- File-based storage (`accounts.json`) for user data
- Monster data caching system (D&D 5e SRD API)
- Automatic cache management for performance

### Frontend
- Single-page application with tab-based navigation
- Modal dialogs for all user interactions
- Real-time calculations and updates
- Debounced auto-save (500ms delay)

### Data Persistence
All data saves to server via API endpoints:
- Character sheets and stats
- Equipment, inventory, currency
- Spells, feats, traits, counters
- Dice configurations
- Saved encounters with folders
- Account credentials (with optional password protection)

---

## Feature Categories

## 1. Account Management System

### User Accounts
- **Account Creation**
  - Username-based accounts
  - Optional password protection
  - Create via signup modal
  - Validation for existing accounts

- **Authentication**
  - Login modal with username/password
  - Auto-login for last user (localStorage)
  - Password validation with error modals
  - Account not found handler (offers account creation)

- **Admin Panel** (Special "Admin" Account)
  - View all user accounts
  - Delete any account
  - Account overview with character counts
  - Refresh functionality

### Data Isolation
- **Per-Account Storage**:
  - Multiple characters (unlimited)
  - Dice roller configurations
  - Saved encounters with folder organization
  - Independent data per user

- **Auto-Save System**:
  - Debounced saves (500ms after last change)
  - Saves on any character modification
  - Server-side persistence for all changes
  - No manual save required

---

## 2. DM Tools

### Encounter Generator

#### Automated Encounter Creation
- **Input Parameters**:
  - Party level (1-20)
  - Party size (1-8 players)
  - Difficulty selection (5 levels):
    - Easy (95% win chance)
    - Medium (75% win chance)
    - Hard (50% win chance)
    - Very Hard (25% win chance)
    - You Gonna Die (5% win chance)
  - Monster count (Auto or 1-5 specific)

- **XP Budget System**:
  - Calculates XP budget per D&D 5e encounter rules
  - Displays actual XP vs budget
  - Shows budget utilization percentage
  - Scales with party size and level

- **Monster Selection Algorithm**:
  - Auto-selects appropriate CR range for difficulty
  - Balances monster count and CR to match XP budget
  - Supports specific monster count requests
  - Fallback to auto mode if constraints can't be met

- **Encounter Display**:
  - Lists all monsters with quantities
  - Individual and total XP calculations
  - Monster metadata (CR, type, size)
  - Win chance percentage indicator
  - Click monsters to view full stat blocks

#### Saved Encounters
- **Save Encounters**:
  - Custom naming via modal
  - Folder organization
  - Create new folders during save
  - Save both generated and custom encounters

- **Load Encounters**:
  - Filter by folder
  - Dropdown selection
  - One-click load

- **Manage Encounters**:
  - Delete with confirmation modal
  - Per-account storage
  - Server persistence

### Custom Encounter Builder
- **Manual Monster Addition**:
  - Add any monster from database
  - "Add to Encounter" from monster browser
  - Quantity controls (increment/decrement)

- **Live Statistics**:
  - Real-time total XP calculation
  - Total monster count display
  - Individual monster XP tracking

- **Monster Management**:
  - Remove individual monsters
  - Adjust quantities with +/- buttons
  - Clear all monsters option

- **Save Custom Encounters**:
  - Name and folder selection
  - Persist to server
  - Load later for use

### Monster Browser
- **Complete Monster Database**:
  - 300+ monsters from D&D 5e SRD API
  - Local caching for performance
  - Automatic image downloads when available

- **Search & Filter**:
  - Search by name or type
  - Filter by Challenge Rating (dropdown)
  - Real-time filtering

- **Monster Stat Blocks**:
  - Complete stats (AC, HP, Speed)
  - All 6 ability scores with modifiers
  - Saving throws and skills
  - Damage vulnerabilities/resistances/immunities
  - Condition immunities
  - Senses and languages
  - Special abilities
  - Actions, reactions, legendary actions
  - Monster artwork (when available)

- **Integration**:
  - Click monster to view details
  - Add to encounter builder from stat block
  - View from saved encounters

---

## 3. Player Tools - Character Management

### Multiple Character Support
- **Character Slots**:
  - Create unlimited characters per account
  - Character selector dropdown
  - Switch between characters instantly
  - Delete characters with confirmation modal

- **Per-Character Data**:
  - Independent character sheets
  - Separate equipment/inventory
  - Individual spell/feat selections
  - Character-specific counters
  - Isolated traits and features

### Character Sheet

#### Basic Information
- **Core Identity**:
  - Character name
  - Class (12 D&D 2024 classes):
    - Barbarian, Bard, Cleric, Druid, Fighter, Monk
    - Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard
  - Subclass (4 per class, 48 total):
    - Dynamically populated based on selected class
    - D&D 2024 subclass options
  - Level (1-20)
  - Background (free text)

- **Species System**:
  - Species selection (11 options):
    - Aasimar, Dragonborn, Dwarf, Elf, Gnome, Goliath
    - Half-Elf, Halfling, Human, Orc, Tiefling
  - Subspecies (40+ variants):
    - Dynamic options based on species
    - Examples: High Elf, Wood Elf, Drow
    - Dragonborn types (10 dragon ancestries)
    - Goliath giant ancestries (6 types)
    - Tiefling bloodlines (9 variants)

#### Ability Scores & Modifiers
- **6 Ability Scores**: STR, DEX, CON, INT, WIS, CHA
  - Range: 1-30
  - Auto-calculated modifiers
  - Real-time updates

- **Derived Stats**:
  - Initiative (DEX modifier)
  - Spell Save DC (8 + proficiency + casting mod)
  - Spell Attack Bonus (proficiency + casting mod)
  - Attack bonuses (melee, ranged, finesse)

#### Combat Statistics
- **Core Combat Stats**:
  - Armor Class (manual or auto-calculated)
  - Speed (auto-updated from traits)
  - Current HP / Max HP
  - Temporary HP

- **HP Auto-Calculator**:
  - "Set HP" button
  - Uses class hit die:
    - d6: Sorcerer, Wizard
    - d8: Bard, Cleric, Druid, Monk, Rogue, Warlock
    - d10: Fighter, Paladin, Ranger
    - d12: Barbarian
  - Applies D&D average HP formula
  - Includes CON modifier per level

- **Proficiency Bonus**:
  - Auto-calculated from level
  - D&D 2024 progression:
    - Levels 1-4: +2
    - Levels 5-8: +3
    - Levels 9-12: +4
    - Levels 13-16: +5
    - Levels 17-20: +6

### Saving Throws
- **All 6 Saves**: STR, DEX, CON, INT, WIS, CHA
- **Proficiency Tracking**:
  - Checkboxes for proficiency
  - Auto-marks class proficiencies (visual indicator)
  - D&D 2024: Each class has 2 proficient saves
- **Auto-Calculation**:
  - Bonus = Ability modifier + proficiency (if checked)
  - Real-time updates on ability/proficiency changes

### Skills System
- **All 18 D&D Skills** (grouped by ability):
  - **STR**: Athletics
  - **DEX**: Acrobatics, Sleight of Hand, Stealth
  - **INT**: Arcana, History, Investigation, Nature, Religion
  - **WIS**: Animal Handling, Insight, Medicine, Perception, Survival
  - **CHA**: Deception, Intimidation, Performance, Persuasion

- **Proficiency Tracking**:
  - Checkbox for each skill
  - Proficiency bonus added when checked
  - Auto-calculated bonuses

### Attack Bonuses Display
- **Three Attack Types**:
  - **Melee**: Proficiency + STR modifier
  - **Ranged**: Proficiency + DEX modifier
  - **Finesse**: Proficiency + higher of STR or DEX

- **Display Features**:
  - Large, clear bonus values
  - Formula breakdown (e.g., "Prof (+3) + STR (+2)")
  - Real-time recalculation
  - Displayed at top of Equipment section

### Features & Traits System

#### Auto-Population
- **Auto-Populate Class Traits**:
  - Loads all class features for current level
  - Level 1-20 progression
  - Complete feature descriptions
  - Examples: Rage, Spellcasting, Extra Attack, Ki, etc.
  - Removes outdated features when level changes

- **Auto-Populate Species Traits**:
  - Loads traits for species/subspecies
  - D&D 2024 racial features
  - Ability score increases
  - Special abilities (Darkvision, Breath Weapon, etc.)

- **Automatic Trait Effects**:
  - Speed bonuses (Fast Movement, Unarmored Movement)
  - Unarmored Defense calculations:
    - Barbarian: AC = 10 + DEX + CON
    - Monk: AC = 10 + DEX + WIS
  - Level-scaled bonuses (Monk Unarmored Movement):
    - +10 ft at level 2
    - +15 ft at level 6
    - +20 ft at level 10
    - +25 ft at level 14
    - +30 ft at level 18

#### Manual Trait Management
- **Add Custom Traits**:
  - Create user-defined features
  - Trait name and notes
  - Type selection (class, species, feat, other)

- **Trait Display**:
  - Collapsible cards (click to expand)
  - Expandable descriptions
  - Delete individual traits
  - Line-break support in notes

---

## 4. Equipment & Inventory

### Armor Management
- **Add Armor Items**:
  - Armor name
  - AC value
  - Bonus information (e.g., "+1", "Max Dex +2")
  - Optional notes (expandable)

- **Display Features**:
  - Expandable note sections
  - Delete individual items
  - Clean, organized layout

### Weapons Management
- **Add Weapons**:
  - Weapon name
  - Damage die (d4, d6, d8, d10, d12)
  - Bonus information (e.g., "+1 to hit", "+1d6 fire")
  - Optional notes (expandable)

- **Display Features**:
  - Damage die display
  - Expandable notes
  - Delete functionality

### Inventory System

#### Currency Tracking
- **5 Coin Types**:
  - Copper (CP)
  - Silver (SP)
  - Electrum (EP)
  - Gold (GP)
  - Platinum (PP)

- **Features**:
  - Numeric input for each type
  - Auto-save on change
  - Per-character storage

#### Item Management
- **Add Inventory Items**:
  - Item name
  - Quantity (adjustable)
  - Value (amount + currency type)
  - Optional notes (expandable)

- **Item Controls**:
  - Increment/decrement quantity
  - Value tracking in any currency
  - Expandable notes section
  - Delete items

---

## 5. Spell System

### Spell Database
- **Complete D&D 2024 Spells**:
  - All PHB 2024 spells
  - Organized by level (Cantrips, 1-9)
  - Complete descriptions
  - School of magic
  - Casting class information

### Spell Selection
- **Spell Selector Modal**:
  - Tabbed interface (10 tabs: Cantrips + levels 1-9)
  - Search functionality:
    - Search by name, description, or school
    - Real-time filtering
    - Cross-level search results
  - Class filtering:
    - Shows only class-available spells
    - "Show all class spells" toggle
    - Auto-filters based on character class

- **Selected Spells Display**:
  - Spell cards with:
    - Spell name
    - Level and school
    - Full description
    - Classes that can cast
  - Remove spells (click X)
  - Auto-sorted by level (Cantrips → 9th)

### Spellcasting Statistics

#### Spell Save DC
- **Auto-Calculation**:
  - Formula: 8 + proficiency + spellcasting modifier
  - Real-time updates on level/ability changes

- **Spellcasting Ability Selector**:
  - Intelligence (Wizard, Eldritch Knight, Arcane Trickster)
  - Wisdom (Cleric, Druid, Ranger)
  - Charisma (Bard, Paladin, Sorcerer, Warlock)
  - Auto-selects based on class

#### Spell Attack Bonus
- **Auto-Calculation**:
  - Formula: Proficiency + spellcasting modifier
  - Synchronized with Spell Save DC
  - Real-time updates

### Concentration Checker
- **Input Fields**:
  - Damage taken (numeric input)
  - Auto-populated CON save bonus

- **DC Calculation**:
  - Formula: Max of 10 or (damage / 2)
  - Automatically calculates from damage

- **Roll Modifiers**:
  - Advantage checkbox
  - Disadvantage checkbox
  - Mutually exclusive (can't have both)

- **Roll Mechanism**:
  - "Roll CON Save" button
  - Simulates d20 roll
  - Applies advantage/disadvantage (roll twice)

- **Result Display**:
  - Shows roll(s)
  - Displays total (roll + bonus)
  - Compares to DC
  - Visual success/failure indicator
  - Clear success/failure message

---

## 6. Feats System

### Feat Categories

#### Origin Feats (9 Total)
- No level prerequisite
- Available at character creation
- Feats:
  - Alert, Crafter, Healer, Lucky, Magic Initiate
  - Musician, Savage Attacker, Skilled, Tavern Brawler

#### General Feats (31 Total)
- Require 4th level minimum
- Some have additional prerequisites
- Includes:
  - Ability Score Improvement
  - Great Weapon Master
  - Sharpshooter
  - War Caster
  - 27 additional feats

### Feat Management
- **Feat Selector Modal**:
  - Tabbed interface (Origin / General)
  - Complete feat descriptions
  - Prerequisite information displayed
  - Add feat to character

- **Selected Feats Display**:
  - Feat cards with full details
  - Type indicator (Origin/General)
  - Remove button
  - Prerequisite display

- **Feat Tracking**:
  - No automatic stat application
  - Reference for players and DMs
  - Persists with character data

---

## 7. Counters & Resources

### Counter System
Tracks limited-use abilities and resources with auto-population.

#### Manual Counters
- **Create Custom Counters**:
  - Counter name (e.g., "Spell Slots - Level 3")
  - Maximum value
  - Current value (defaults to max)

#### Auto-Populate Counters
Automatically creates counters based on class, species, and level:

**Class-Based Counters**:
- **Barbarian**: Rage uses (increases with level)
- **Bard**: Bardic Inspiration (prof bonus or more at higher levels)
- **Cleric**: Channel Divinity (1-3 based on level)
- **Druid**: Wild Shape (2 uses)
- **Fighter**:
  - Action Surge (1-2 based on level)
  - Second Wind (1 use)
  - Indomitable (1-3 based on level)
- **Monk**: Ki Points (equals monk level)
- **Paladin**: Lay on Hands pool (5 × paladin level)
- **Sorcerer**:
  - Sorcery Points (equals sorcerer level)
  - Innate Sorcery (proficiency bonus)

**Spell Slot Counters** (for spellcasting classes):
- Auto-generates spell slot counters for levels 1-9
- Based on class and character level
- Uses D&D 2024 spell slot progression
- Removes for non-spellcasting classes

**Species-Based Counters**:
- **Dragonborn**: Breath Weapon (proficiency bonus)
- **Goliath** (6 subspecies):
  - Cloud's Jaunt (Cloud Giant)
  - Fire's Burn (Fire Giant)
  - Frost's Chill (Frost Giant)
  - Hill's Tumble (Hill Giant)
  - Stone's Endurance (Stone Giant)
  - Storm's Thunder (Storm Giant)
  - Large Form (all Goliath, level 5+)
- **Orc**: Relentless Endurance, Adrenaline Rush
- **Aasimar**: Healing Hands

### Counter Controls
- **Adjustment Buttons**:
  - Increment/decrement current value
  - Set to maximum (individual counter)
  - Click number to type specific value

- **Bulk Operations**:
  - "Reset All Counters" button (when counters exist)
  - Restores all counters to maximum

- **Counter Management**:
  - Edit counter (name and max value)
  - Delete counter (with confirmation)
  - Per-character storage
  - Auto-generated counters update with level changes

---

## 8. Dice Roller

### Dice Types
- **7 Standard Dice**:
  - d4, d6, d8, d10, d12, d20, d% (d100)
  - Set quantity for each type (0-99)

### Rolling Features
- **Roll Button**:
  - Rolls all selected dice
  - Visual results display

- **Results Display**:
  - Individual die results
  - Subtotals per die type
  - Grand total across all dice
  - Roll history (most recent)

- **Clear Button**:
  - Reset all counts to 0
  - Prepare for new roll

### Saved Dice Configurations
- **Save Configurations**:
  - Custom name via modal
  - Auto-generates name from dice (e.g., "2d6 + 1d20")
  - Persists to server (per account)

- **Load Configurations**:
  - Dropdown selector
  - One-click load
  - Instantly sets die quantities

- **Delete Configurations**:
  - Remove with confirmation modal
  - Server-side deletion

---

## 9. D&D 2024 Rules Implementation

### Character Rules
- **All 12 PHB 2024 Classes**:
  - Correct hit dice (d6 to d12)
  - Accurate saving throw proficiencies (2 per class)
  - 48 subclasses (4 per class)
  - Level 1-20 class features

- **11 PHB 2024 Species**:
  - 40+ subspecies variants
  - Correct ability score increases
  - Species traits and special abilities
  - D&D 2024 updated features

### Mechanics
- **Proficiency Bonus**:
  - Level-based calculation (D&D 2024)
  - +2 to +6 progression
  - Applied to saves, skills, attacks, spell DC

- **Spell Save DC**:
  - 2024 formula: 8 + prof + casting mod
  - Class-appropriate casting ability

- **Concentration**:
  - DC = max(10, damage/2)
  - CON save with advantage/disadvantage support

- **HP Calculation**:
  - Maximum at level 1
  - Average progression (D&D formula)
  - CON modifier per level

### Encounter Building
- **XP Budgets**:
  - Per D&D 5e encounter guidelines
  - Party size and level scaling
  - Difficulty multipliers

- **CR System**:
  - Appropriate monster selection
  - CR range for difficulty
  - Balanced encounter generation

---

## 10. User Interface & Experience

### Navigation
- **Tab-Based Layout**:
  - 3 main tabs: DM Tools, Player Tools, Dice Roller
  - Sub-tabs within sections
  - Clean, organized structure

- **DM Tools Tabs**:
  - Encounter Generator
  - Monster Browser

- **Player Tools Tabs**:
  - Character Sheet
  - Equipment
  - Inventory
  - Spells
  - Feats
  - Counters

### Modal System
- **15+ Modal Dialogs**:
  - Login/Signup
  - Add equipment/weapons/items
  - Spell selector (tabbed)
  - Feat selector (tabbed)
  - Save configurations (encounters, dice)
  - Delete confirmations
  - Add/edit/delete counters
  - Save encounters with folders
  - Custom trait creation

- **Modal Features**:
  - Consistent design
  - Cancel/Confirm actions
  - Input validation
  - Error handling

### Visual Feedback
- **Color-Coded Elements**:
  - Difficulty indicators (green to red)
  - Success/failure states (green/red)
  - Win chance percentages

- **Interactive Elements**:
  - Expandable sections (click to reveal)
  - Collapsible cards (traits, notes)
  - Active states (selected items)
  - Hover effects

- **Real-Time Updates**:
  - All bonuses calculate live
  - Spell Save DC updates instantly
  - Attack bonuses recalculate
  - Counter values update immediately

### Responsive Design
- **Clean Layout**:
  - Grid-based organization
  - Responsive containers
  - Mobile-friendly modals

- **Visual Hierarchy**:
  - Clear section headers
  - Organized stat displays
  - Logical groupings

### Easter Eggs
- **Bender Image**: Click footer text to toggle
- **Trogdor Logo**: Application branding on login

---

## Data Architecture

### Server-Side (accounts.json)
```json
{
  "name": "username",
  "hasPassword": true/false,
  "password": "encrypted_or_plain",
  "data": {
    "character": { /* character sheet data */ },
    "counters": [ /* resource counters */ ],
    "feats": [ /* selected feats */ ],
    "diceConfigs": [ /* saved dice configurations */ ],
    "encounters": [ /* saved encounters with folders */ ]
  }
}
```

### Character Object Structure
- Basic info (name, class, level, species, etc.)
- Ability scores (6 abilities)
- Saving throws (proficiencies)
- Skills (proficiencies)
- Combat stats (HP, AC, speed, initiative)
- Equipment (armor array, weapons array)
- Inventory (items array, currency object)
- Spells (selected spells array)
- Traits (features array)

### Auto-Save Triggers
- Ability score changes
- Skill/save proficiency toggles
- HP/AC/Speed modifications
- Equipment add/delete
- Spell/feat selection
- Counter adjustments
- Currency updates
- Trait modifications
- Inventory changes

---

## Success Metrics

### Functionality
- ✅ All D&D 2024 rules accurately implemented
- ✅ Full server-side data persistence
- ✅ No data loss between sessions
- ✅ All calculations auto-update in real-time
- ✅ Encounter generation balanced and functional

### User Experience
- ✅ All interactions via GUI (no command-line)
- ✅ Intuitive navigation and workflows
- ✅ Clear visual feedback for all actions
- ✅ Responsive and fast performance

### Content Coverage
- ✅ 12 classes with 48 subclasses
- ✅ 11 species with 40+ subspecies
- ✅ 300+ monsters with full stat blocks
- ✅ Complete spell database
- ✅ 40 feats (Origin and General)
- ✅ Comprehensive automation features

---

## Future Enhancements (Post-MVP)

### Gameplay Features
- **Combat System**:
  - Turn-based initiative tracker
  - Action economy (action, bonus, reaction)
  - Condition tracking (stunned, prone, etc.)
  - Damage application to monsters
  - Death saves for characters

- **Rest System**:
  - Short rest (restore some resources)
  - Long rest (full restoration)
  - Auto-reset appropriate counters

### Character Features
- **Advanced Calculations**:
  - Encumbrance tracking
  - Carry weight from equipment
  - Speed penalties from armor

- **Spell Enhancements**:
  - Spell slot consumption tracking
  - Prepared spells vs known spells
  - Ritual casting indicators

### DM Tools
- **Encounter Enhancements**:
  - Terrain/environment effects
  - Lair actions for legendary creatures
  - Dynamic difficulty adjustment

- **Campaign Management**:
  - Session tracking
  - XP award calculator
  - Treasure distribution tools

### Social Features
- **Multiplayer**:
  - Party-based sessions
  - Shared encounter viewer
  - DM-to-player encounter sharing

### Integration
- **External Services**:
  - D&D Beyond character import
  - Roll20 integration
  - PDF character sheet export

---

## Non-Goals (Current Version)

- ❌ Full campaign/story mode
- ❌ Character roleplay or dialogue systems
- ❌ Exploration or puzzle-solving gameplay
- ❌ Crafting system
- ❌ PvP combat
- ❌ Homebrew content creation tools
- ❌ Map or grid-based combat
- ❌ Mobile native apps (web-only)

---

## Technical Requirements

### Performance
- Debounced auto-save (500ms)
- Local caching for monster data
- Fast character switching
- Responsive UI updates

### Security
- Password protection optional
- Admin account isolation
- Server-side validation
- Safe data persistence

### Compatibility
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- No external dependencies for core features
- D&D 5e SRD API integration
- Node.js backend (Express)

### Data Integrity
- Atomic saves to prevent corruption
- Backward compatibility for old saves
- Validation on all inputs
- Error handling for API failures

---

## Conclusion

D&D 2024 Play Tools is a comprehensive, feature-rich application that provides essential functionality for both DMs and players. With full D&D 2024 rules implementation, extensive automation, server-side persistence, and an intuitive GUI, it streamlines character management and encounter generation while maintaining accuracy to the official game rules.
