# D&D 2024 Encounter Building Guide

## Overview

This guide explains how to create appropriately challenging encounters for a D&D roguelike using the 2024 D&D rules.

## Challenge Rating (CR) System

**Challenge Rating (CR)** represents how threatening a monster is to a party of four player characters. The basic rule:
- If CR = Party Level: Moderate challenge for a party of 4
- If CR > Party Level: High difficulty
- If CR < Party Level: Lower difficulty

## XP Budget System (D&D 2024)

The 2024 DMG uses an XP Budget system. You calculate the total XP budget, then "spend" it on monsters.

### XP Budget per Character

| Party Level | Low Difficulty | Moderate Difficulty | High Difficulty |
|-------------|----------------|---------------------|-----------------|
| 1           | 50             | 75                  | 100             |
| 2           | 100            | 150                 | 200             |
| 3           | 150            | 225                 | 400             |
| 4           | 250            | 375                 | 500             |
| 5           | 500            | 750                 | 1,100           |
| 6           | 600            | 1,000               | 1,400           |
| 7           | 750            | 1,300               | 1,700           |
| 8           | 1,000          | 1,700               | 2,100           |
| 9           | 1,300          | 2,000               | 2,600           |
| 10          | 1,600          | 2,300               | 3,100           |
| 11          | 1,900          | 2,900               | 4,100           |
| 12          | 2,200          | 3,700               | 4,700           |
| 13          | 2,600          | 4,200               | 5,400           |
| 14          | 2,900          | 4,900               | 6,200           |
| 15          | 3,300          | 5,400               | 7,800           |
| 16          | 3,800          | 6,100               | 9,800           |
| 17          | 4,500          | 7,200               | 11,700          |
| 18          | 5,000          | 8,700               | 14,200          |
| 19          | 5,500          | 10,700              | 17,200          |
| 20          | 6,400          | 13,200              | 22,000          |

### Monster XP by Challenge Rating

| CR    | XP      | CR  | XP      | CR  | XP       |
|-------|---------|-----|---------|-----|----------|
| 0     | 0-10    | 8   | 3,900   | 17  | 18,000   |
| 1/8   | 25      | 9   | 5,000   | 18  | 20,000   |
| 1/4   | 50      | 10  | 5,900   | 19  | 22,000   |
| 1/2   | 100     | 11  | 7,200   | 20  | 25,000   |
| 1     | 200     | 12  | 8,400   | 21  | 33,000   |
| 2     | 450     | 13  | 10,000  | 22  | 41,000   |
| 3     | 700     | 14  | 11,500  | 23  | 50,000   |
| 4     | 1,100   | 15  | 13,000  | 24  | 62,000   |
| 5     | 1,800   | 16  | 15,000  | 25  | 75,000   |
| 6     | 2,300   | 17  | 18,000  | 26  | 90,000   |
| 7     | 2,900   |     |         | 30  | 155,000  |

## How to Build Encounters

### Step 1: Calculate XP Budget
**Formula:** `XP Budget = XP per Character × Party Size`

**Examples:**
- Level 3, 1 player, Moderate: 225 XP
- Level 5, 1 player, High: 1,100 XP
- Level 10, 1 player, Moderate: 2,300 XP

### Step 2: Select Monsters
Choose monsters whose combined XP equals (or is close to) the budget.

**Example for Level 5, 1 player, Moderate (750 XP budget):**
- Option A: 1× CR 5 monster (1,800 XP) - Too high, deadly
- Option B: 1× CR 3 monster (700 XP) - Perfect moderate challenge
- Option C: 3× CR 1 monsters (600 XP) - Slightly easier
- Option D: 1× CR 2 + 1× CR 1 (650 XP) - Good moderate challenge

### Step 3: Verify CR vs Level
Make sure no single monster's CR is more than 2-3 levels above the party level, as they may have abilities that can one-shot characters.

## Special Considerations for Roguelike (Single Player)

### Party Size = 1
For a single-player roguelike, use the "XP per Character" values directly without multiplication.

### Action Economy
Single characters face action economy disadvantage:
- Multiple weaker enemies can overwhelm a solo character through sheer number of attacks
- A single strong enemy is often more manageable for solo play
- **Recommendation:** Favor single monsters or pairs rather than large groups

### Difficulty Calibration for Solo Play

**Low Difficulty:**
- Use monsters with CR = Party Level - 2 to - 1
- Safe for progression, minimal risk

**Moderate Difficulty:**
- Use monsters with CR = Party Level - 1 to Party Level
- Standard challenge, requires tactics

**High Difficulty:**
- Use monsters with CR = Party Level to Party Level + 1
- High risk, high reward
- May require consumables or perfect play

**Boss Fights (Optional):**
- Use monsters with CR = Party Level + 2 to + 3
- Epic encounters for milestone levels
- Expect character resources to be fully expended

## Example Encounters for Solo Roguelike

### Level 1 Character
- **Low (50 XP):** 1× Bandit (CR 1/8, 25 XP) or 2× Kobolds (CR 1/8, 50 XP)
- **Moderate (75 XP):** 1× Goblin (CR 1/4, 50 XP) + 1× Kobold (CR 1/8, 25 XP)
- **High (100 XP):** 1× Wolf (CR 1/4, 50 XP) + 2× Kobolds (CR 1/8, 50 XP)

### Level 5 Character
- **Low (500 XP):** 1× Ogre (CR 2, 450 XP)
- **Moderate (750 XP):** 1× Basilisk (CR 3, 700 XP) or 1× Werewolf (CR 3, 700 XP)
- **High (1,100 XP):** 1× Ettin (CR 4, 1,100 XP)

### Level 10 Character
- **Low (1,600 XP):** 1× Hill Giant (CR 5, 1,800 XP)
- **Moderate (2,300 XP):** 1× Chimera (CR 6, 2,300 XP)
- **High (3,100 XP):** 1× Stone Giant (CR 7, 2,900 XP) or 1× Young Green Dragon (CR 8, 3,900 XP)

### Level 15 Character
- **Low (3,300 XP):** 1× Young Red Dragon (CR 10, 5,900 XP) - Slightly over budget
- **Moderate (5,400 XP):** 1× Adult White Dragon (CR 13, 10,000 XP) - Over budget, use carefully
- **High (7,800 XP):** 1× Adult Copper Dragon (CR 14, 11,500 XP) - Boss-tier

### Level 20 Character
- **Low (6,400 XP):** 1× Aboleth (CR 10, 5,900 XP)
- **Moderate (13,200 XP):** 1× Adult Gold Dragon (CR 17, 18,000 XP)
- **High (22,000 XP):** 1× Balor (CR 19, 22,000 XP) or 1× Ancient White Dragon (CR 20, 25,000 XP)

## Implementation Notes for Roguelike

### Encounter Selection Algorithm
1. Determine character level
2. Choose difficulty (Low/Moderate/High)
3. Calculate XP budget
4. Filter monsters within CR range (Level ± 2)
5. Select monster(s) whose total XP is closest to budget without exceeding significantly
6. For solo play, prefer single monsters over groups

### Adjustments for Game Balance
- **Early Levels (1-4):** Stick closely to XP budgets; characters are fragile
- **Mid Levels (5-10):** Allow slight XP overages (10-20%) for challenge
- **High Levels (11-16):** Characters have more tools; can handle budget overages
- **Epic Levels (17-20):** XP is less reliable; focus on tactical complexity

### Reward Scaling
Match loot quality to encounter difficulty:
- **Low:** Standard treasure for CR
- **Moderate:** Slightly enhanced treasure
- **High:** Enhanced treasure + chance for magic items
