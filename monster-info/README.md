# Monster Information System - Developer Guide

## Overview

This directory contains the complete monster database and encounter building system for the D&D Roguelike project. This guide explains how to use the Challenge Rating (CR) system to generate balanced, level-appropriate encounters for a single-player roguelike experience.

## File Structure

```
monster-info/
├── README.md                      # This file - comprehensive developer guide
├── monsters.json                  # Complete monster database (428 monsters)
├── encounter-building-guide.md    # Encounter building reference tables
└── cr-xp-reference.json          # CR to XP conversion data
```

## Monster Database Schema

### File: `monsters.json`

The monster database contains 428 D&D 5e monsters organized by Challenge Rating (CR).

**Structure:**
```json
{
  "metadata": {
    "source": "https://www.aidedd.org/dnd-filters/monsters.php",
    "total_monsters": 428,
    "cr_range": "0-30",
    "rules_edition": "D&D 5e"
  },
  "monsters_by_cr": {
    "0": [ /* CR 0 monsters */ ],
    "1/8": [ /* CR 1/8 monsters */ ],
    "1/4": [ /* CR 1/4 monsters */ ],
    ...
    "30": [ /* CR 30 monsters */ ]
  }
}
```

**Monster Entry Schema:**
```json
{
  "name": "Goblin",
  "type": "Humanoid (goblinoid)",
  "size": "Small",
  "source": "Monster Manual (SRD)",
  "url": "https://www.aidedd.org/dnd/monstres.php?vo=goblin"
}
```

**Fields:**
- `name`: Monster name (string)
- `type`: Creature type and subtype (string)
- `size`: Size category - Tiny, Small, Medium, Large, Huge, Gargantuan (string)
- `source`: Source book reference (string)
- `url`: Direct link to full stat block on aidedd.org (string)

**Accessing Full Stat Blocks:**
When you need complete combat stats (AC, HP, attacks, abilities), use WebFetch on the monster's URL. Example:
```
WebFetch(url: "https://www.aidedd.org/dnd/monstres.php?vo=goblin")
```

This returns:
- Armor Class (AC)
- Hit Points (HP) with dice formula
- Speed
- Ability Scores (STR, DEX, CON, INT, WIS, CHA)
- Skills, Senses, Languages
- Challenge Rating and XP value
- Special Abilities
- Actions (attacks, special moves)
- Legendary Actions (if applicable)

## Challenge Rating (CR) System Explained

### What is Challenge Rating?

**Challenge Rating (CR)** is a number that represents how dangerous a monster is to a party of four player characters.

**Core Principle:**
- A monster with CR equal to the party's level is a **moderate** challenge for a party of 4
- CR > Party Level = Harder encounter
- CR < Party Level = Easier encounter

**CR Range:** 0, 1/8, 1/4, 1/2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30

### CR to XP Conversion

Every CR value corresponds to a specific XP amount. This XP is used in the encounter building system.

**Complete CR to XP Table:**

| CR  | XP      | Example Monsters                           |
|-----|---------|-------------------------------------------|
| 0   | 0-10    | Commoner, Rat, Cat                        |
| 1/8 | 25      | Bandit, Kobold, Giant Rat                 |
| 1/4 | 50      | Goblin, Skeleton, Wolf                    |
| 1/2 | 100     | Orc, Hobgoblin, Shadow                    |
| 1   | 200     | Bugbear, Dire Wolf, Imp                   |
| 2   | 450     | Ogre, Griffon, Wererat                    |
| 3   | 700     | Basilisk, Werewolf, Minotaur              |
| 4   | 1,100   | Ettin, Black Pudding, Ghost               |
| 5   | 1,800   | Hill Giant, Air Elemental, Troll          |
| 6   | 2,300   | Chimera, Medusa, Wyvern                   |
| 7   | 2,900   | Stone Giant, Mind Flayer, Young Black Dragon |
| 8   | 3,900   | Frost Giant, Tyrannosaurus Rex            |
| 9   | 5,000   | Fire Giant, Cloud Giant, Glabrezu         |
| 10  | 5,900   | Aboleth, Stone Golem, Young Red Dragon    |
| 11  | 7,200   | Djinni, Horned Devil, Remorhaz            |
| 12  | 8,400   | Arcanaloth, Erinyes                       |
| 13  | 10,000  | Beholder, Adult Brass Dragon, Rakshasa    |
| 14  | 11,500  | Adult Black Dragon, Ice Devil             |
| 15  | 13,000  | Adult Bronze Dragon, Purple Worm          |
| 16  | 15,000  | Adult Blue Dragon, Iron Golem, Marilith   |
| 17  | 18,000  | Adult Gold Dragon, Dragon Turtle          |
| 18  | 20,000  | Demilich                                  |
| 19  | 22,000  | Balor                                     |
| 20  | 25,000  | Ancient Brass Dragon, Pit Fiend           |
| 21  | 33,000  | Ancient Black Dragon, Lich, Solar         |
| 22  | 41,000  | Ancient Bronze Dragon                     |
| 23  | 50,000  | Ancient Blue Dragon, Kraken, Empyrean     |
| 24  | 62,000  | Ancient Red Dragon, Ancient Gold Dragon   |
| 30  | 155,000 | Tarrasque                                 |

**Key Insight:** There's no mathematical formula for CR to XP. It must be looked up from this table. The progression is irregular, especially at higher CRs.

## D&D 2024 Encounter Building System

### The XP Budget Method

D&D 2024 uses an **XP Budget** system. Here's how it works:

1. **Determine party level and size**
2. **Choose difficulty level** (Low, Moderate, High)
3. **Look up XP budget per character** from the table
4. **Calculate total budget:** `XP Budget = XP per Character × Party Size`
5. **Spend the budget** by selecting monsters whose combined XP equals (or is close to) the budget

### XP Budget Per Character Table (D&D 2024)

| Party Level | Low    | Moderate | High   |
|-------------|--------|----------|--------|
| 1           | 50     | 75       | 100    |
| 2           | 100    | 150      | 200    |
| 3           | 150    | 225      | 400    |
| 4           | 250    | 375      | 500    |
| 5           | 500    | 750      | 1,100  |
| 6           | 600    | 1,000    | 1,400  |
| 7           | 750    | 1,300    | 1,700  |
| 8           | 1,000  | 1,700    | 2,100  |
| 9           | 1,300  | 2,000    | 2,600  |
| 10          | 1,600  | 2,300    | 3,100  |
| 11          | 1,900  | 2,900    | 4,100  |
| 12          | 2,200  | 3,700    | 4,700  |
| 13          | 2,600  | 4,200    | 5,400  |
| 14          | 2,900  | 4,900    | 6,200  |
| 15          | 3,300  | 5,400    | 7,800  |
| 16          | 3,800  | 6,100    | 9,800  |
| 17          | 4,500  | 7,200    | 11,700 |
| 18          | 5,000  | 8,700    | 14,200 |
| 19          | 5,500  | 10,700   | 17,200 |
| 20          | 6,400  | 13,200   | 22,000 |

**Important Notes:**
- D&D 2024 removed the 2014 "multiplier" system for multiple monsters
- Count each monster's XP at face value (no multiplication)
- The table assumes a party of 4, but for our roguelike with 1 player, use the "per character" values directly

### Difficulty Definitions

**Low Difficulty:**
- Party should win with minimal resource expenditure
- Little risk of character death
- May not even require healing

**Moderate Difficulty:**
- Party should win but will expend some resources (spell slots, HP, abilities)
- Characters might get low on HP but unlikely to die
- Standard "fair fight"

**High Difficulty:**
- Party is expected to win but will expend significant resources
- Real risk of character death if tactics are poor
- May need to use consumables (potions, scrolls)
- Should feel like a hard-fought victory

## Single-Player Roguelike Adaptations

### The Action Economy Problem

**Critical Concept:** D&D combat is heavily influenced by **action economy** - the number of actions each side gets per round.

- Standard party (4 players) gets 4 actions per round
- Single player gets 1 action per round

**Problem:** Multiple weak enemies can overwhelm a single character:
- 4× CR 1/4 Goblins (200 XP total) get 4 attacks per round
- Solo character gets 1 attack per round
- Even though the XP is balanced, the action economy heavily favors the monsters

**Solution for Solo Play:**
- **Prefer single monsters** or pairs at most
- Avoid large groups of weak enemies
- When using multiple enemies, keep it to 2-3 maximum

### Encounter Difficulty Guidelines for Solo Play

**Recommended CR Ranges by Difficulty:**

**Low Difficulty:**
- CR = Character Level - 2 to Character Level - 1
- Safe progression, minimal challenge
- Good for "hallway" encounters between major fights

**Moderate Difficulty:**
- CR = Character Level - 1 to Character Level
- Standard challenge requiring tactics
- Should be the most common encounter type

**High Difficulty:**
- CR = Character Level to Character Level + 1
- Significant challenge
- May require consumables or perfect play
- Good for "level boss" encounters

**Epic/Boss Difficulty (Optional):**
- CR = Character Level + 2 to Character Level + 3
- Very dangerous, high risk of death
- Only for climactic milestone battles
- Expect full resource expenditure

### XP Budget Examples for Solo Character

#### Level 3 Character (Moderate Difficulty: 225 XP)
**Option Analysis:**
- ✅ **1× Wererat** (CR 2, 450 XP) - Over budget, would be High difficulty
- ✅ **1× Ogre** (CR 2, 450 XP) - Over budget, would be High difficulty
- ✅ **3× Goblins** (CR 1/4, 150 XP) - Under budget, but action economy issue
- ✅ **1× Bugbear** (CR 1, 200 XP) - Perfect fit!

**Best Choice:** 1× Bugbear (CR 1, 200 XP) - Single enemy close to budget

#### Level 8 Character (High Difficulty: 2,100 XP)
**Option Analysis:**
- ✅ **1× Young Green Dragon** (CR 8, 3,900 XP) - Over budget, epic fight
- ✅ **1× Frost Giant** (CR 8, 3,900 XP) - Over budget, epic fight
- ✅ **1× Mind Flayer** (CR 7, 2,900 XP) - Close to budget, great choice!
- ❌ **2× Hell Hounds** (CR 3, 1,400 XP) - Under budget and action economy issues

**Best Choice:** 1× Mind Flayer (CR 7, 2,900 XP) - Slightly over but manageable

#### Level 15 Character (Moderate Difficulty: 5,400 XP)
**Option Analysis:**
- ✅ **1× Adult Green Dragon** (CR 15, 13,000 XP) - Way over budget, boss tier
- ✅ **1× Beholder** (CR 13, 10,000 XP) - Over budget, high difficulty
- ✅ **1× Adult Brass Dragon** (CR 13, 10,000 XP) - Over budget, high difficulty
- ✅ **1× Chimera** (CR 6, 2,300 XP) - Under budget, low difficulty
- ✅ **1× Medusa** (CR 6, 2,300 XP) - Under budget, low difficulty

**Note:** At level 15, the XP system breaks down. CR 13-14 monsters are more appropriate for "moderate" challenge than the budget suggests.

### Important: XP Budget Limitations

**The XP budget system becomes less reliable at higher levels (10+)**. Here's why:

1. **Character power scaling:** High-level characters have abilities that multiply their effectiveness
2. **Monster special abilities:** A CR 13 Beholder's eye rays can devastate a solo character regardless of XP math
3. **Tactical complexity:** High-CR monsters often have abilities that require specific counters

**Recommendation:**
- **Levels 1-5:** Trust the XP budget closely (±10%)
- **Levels 6-10:** Allow budget variance (±20%)
- **Levels 11-15:** Focus on CR relative to level, use XP as rough guide
- **Levels 16-20:** CR relative to level is primary, XP is secondary

## Encounter Generation Algorithm

### Step-by-Step Process

```
FUNCTION generateEncounter(characterLevel, difficulty):

    1. GET xpBudget from XP_BUDGET_TABLE[characterLevel][difficulty]
       // For solo play, this is already the total budget

    2. DETERMINE crRange based on difficulty:
       IF difficulty == "low":
           minCR = characterLevel - 2
           maxCR = characterLevel - 1
       ELSE IF difficulty == "moderate":
           minCR = characterLevel - 1
           maxCR = characterLevel
       ELSE IF difficulty == "high":
           minCR = characterLevel
           maxCR = characterLevel + 1

    3. FILTER monsters from database:
       eligibleMonsters = monsters WHERE CR >= minCR AND CR <= maxCR

    4. SELECT encounter composition:
       // Prefer single monsters for solo play

       4a. TRY single monster first:
           FOR EACH monster IN eligibleMonsters:
               monsterXP = CR_TO_XP[monster.cr]
               IF abs(monsterXP - xpBudget) <= (xpBudget * 0.3):
                   // Within 30% of budget
                   RETURN [monster]

       4b. IF no single monster found, try pairs:
           FOR EACH monster1 IN eligibleMonsters:
               FOR EACH monster2 IN eligibleMonsters WHERE monster2.cr <= monster1.cr:
                   totalXP = CR_TO_XP[monster1.cr] + CR_TO_XP[monster2.cr]
                   IF abs(totalXP - xpBudget) <= (xpBudget * 0.2):
                       RETURN [monster1, monster2]

       4c. FALLBACK: Return closest single monster by XP

    5. RETURN selected encounter
```

### Pseudocode Example

```python
def generate_encounter(char_level, difficulty, monsters_db, xp_budget_table, cr_to_xp):
    """
    Generate a balanced encounter for a solo character.

    Args:
        char_level: int (1-20)
        difficulty: str ("low", "moderate", "high")
        monsters_db: dict with structure from monsters.json
        xp_budget_table: 2D array from encounter-building-guide.md
        cr_to_xp: dict mapping CR to XP value

    Returns:
        list of monster objects
    """

    # Step 1: Get XP budget
    xp_budget = xp_budget_table[char_level][difficulty]

    # Step 2: Determine CR range
    if difficulty == "low":
        min_cr, max_cr = char_level - 2, char_level - 1
    elif difficulty == "moderate":
        min_cr, max_cr = char_level - 1, char_level
    else:  # high
        min_cr, max_cr = char_level, char_level + 1

    # Ensure CR bounds are valid
    min_cr = max(0, min_cr)
    max_cr = min(30, max_cr)

    # Step 3: Get eligible monsters
    eligible_monsters = []
    for cr, monster_list in monsters_db["monsters_by_cr"].items():
        cr_value = parse_cr(cr)  # Convert "1/4" to 0.25, "3" to 3, etc.
        if min_cr <= cr_value <= max_cr:
            eligible_monsters.extend(monster_list)

    # Step 4: Select encounter
    # Try single monster first (preferred for solo)
    best_single = None
    best_diff = float('inf')

    for monster in eligible_monsters:
        monster_xp = cr_to_xp[monster["cr"]]
        diff = abs(monster_xp - xp_budget)

        if diff < best_diff and diff <= xp_budget * 0.3:
            best_single = monster
            best_diff = diff

    if best_single:
        return [best_single]

    # Fallback: return closest single monster by XP
    closest = min(eligible_monsters,
                  key=lambda m: abs(cr_to_xp[m["cr"]] - xp_budget))
    return [closest]


def parse_cr(cr_string):
    """Convert CR string to numeric value."""
    if "/" in cr_string:
        num, denom = cr_string.split("/")
        return int(num) / int(denom)
    return int(cr_string)
```

## Data Structures Reference

### CR to XP Lookup (Use This in Code)

```json
{
  "0": 10,
  "1/8": 25,
  "1/4": 50,
  "1/2": 100,
  "1": 200,
  "2": 450,
  "3": 700,
  "4": 1100,
  "5": 1800,
  "6": 2300,
  "7": 2900,
  "8": 3900,
  "9": 5000,
  "10": 5900,
  "11": 7200,
  "12": 8400,
  "13": 10000,
  "14": 11500,
  "15": 13000,
  "16": 15000,
  "17": 18000,
  "18": 20000,
  "19": 22000,
  "20": 25000,
  "21": 33000,
  "22": 41000,
  "23": 50000,
  "24": 62000,
  "30": 155000
}
```

### XP Budget Lookup (Use This in Code)

```json
{
  "1": {"low": 50, "moderate": 75, "high": 100},
  "2": {"low": 100, "moderate": 150, "high": 200},
  "3": {"low": 150, "moderate": 225, "high": 400},
  "4": {"low": 250, "moderate": 375, "high": 500},
  "5": {"low": 500, "moderate": 750, "high": 1100},
  "6": {"low": 600, "moderate": 1000, "high": 1400},
  "7": {"low": 750, "moderate": 1300, "high": 1700},
  "8": {"low": 1000, "moderate": 1700, "high": 2100},
  "9": {"low": 1300, "moderate": 2000, "high": 2600},
  "10": {"low": 1600, "moderate": 2300, "high": 3100},
  "11": {"low": 1900, "moderate": 2900, "high": 4100},
  "12": {"low": 2200, "moderate": 3700, "high": 4700},
  "13": {"low": 2600, "moderate": 4200, "high": 5400},
  "14": {"low": 2900, "moderate": 4900, "high": 6200},
  "15": {"low": 3300, "moderate": 5400, "high": 7800},
  "16": {"low": 3800, "moderate": 6100, "high": 9800},
  "17": {"low": 4500, "moderate": 7200, "high": 11700},
  "18": {"low": 5000, "moderate": 8700, "high": 14200},
  "19": {"low": 5500, "moderate": 10700, "high": 17200},
  "20": {"low": 6400, "moderate": 13200, "high": 22000}
}
```

## Testing Encounter Balance

### How to Verify Your Encounter is Fair

1. **Check CR vs Level:**
   - Monster CR should be within ±2 of character level
   - CR more than +3 above character = potential one-shot mechanics

2. **Verify XP Budget:**
   - Calculate total monster XP
   - Compare to target XP budget for difficulty
   - Allow ±30% variance for low sample availability

3. **Action Economy Check:**
   - Solo character = 1 action/round
   - Each monster = 1 action/round
   - Ideal: 1-2 monsters
   - Maximum: 3 monsters (only if necessary)

4. **Special Ability Scan:**
   - Check monster stat block for save-or-die abilities
   - Verify character has counter-play options
   - Example: Mind Flayer's Mind Blast can stun - does character have good INT save or Legendary Resistance?

### Example Encounter Validation

**Scenario:** Level 10 character, Moderate difficulty (2,300 XP budget)

**Candidate Monster:** Young Red Dragon (CR 10, 5,900 XP)

**Validation:**
1. ✅ CR Check: CR 10 = Character Level 10 (perfect match)
2. ⚠️ XP Check: 5,900 XP vs 2,300 budget = +156% (way over)
3. ✅ Action Economy: 1v1 (ideal)
4. ⚠️ Special Abilities: Dragon has Frightful Presence (Wisdom save), Breath Weapon (Dex save, 16d6 damage)

**Conclusion:** This is actually a HIGH difficulty encounter, not Moderate. The XP budget suggests it's too hard, but the CR match means it's technically appropriate. Recommendation: Use for "High" difficulty or reduce to CR 9 monster.

**Better Choice:** Chimera (CR 6, 2,300 XP)
1. ❌ CR Check: CR 6 vs Level 10 = -4 (too easy)
2. ✅ XP Check: 2,300 XP = exact budget match
3. ✅ Action Economy: 1v1 (ideal)
4. ✅ Special Abilities: Multiple attacks but no save-or-die

**Conclusion:** XP is perfect but CR is too low. This would be an EASY fight, not Moderate.

**BEST Choice:** Young Green Dragon (CR 8, 3,900 XP)
1. ✅ CR Check: CR 8 vs Level 10 = -2 (within range)
2. ⚠️ XP Check: 3,900 XP vs 2,300 budget = +70% (higher but manageable)
3. ✅ Action Economy: 1v1 (ideal)
4. ✅ Special Abilities: Poison Breath (CON save), multiple attacks

**Conclusion:** Good Moderate encounter - CR is close to level, XP is elevated but single monster compensates.

## Common Pitfalls and Solutions

### Pitfall 1: Trusting XP Budget Alone at High Levels
**Problem:** Level 15 character, Moderate (5,400 XP) suggests CR 6-7 monsters, but these are trivial for a level 15 character.

**Solution:** At levels 10+, prioritize CR relative to character level over XP budget. A level 15 character needs CR 12-15 for moderate challenge, even if XP exceeds budget.

### Pitfall 2: Multiple Weak Monsters
**Problem:** Level 5 character vs 4× Goblins (CR 1/4, 200 XP total) seems balanced, but goblins get 4 attacks while character gets 1.

**Solution:** Use single monsters or maximum 2 creatures for solo encounters.

### Pitfall 3: Ignoring Special Abilities
**Problem:** CR 7 Mind Flayer seems appropriate for level 7 character, but Mind Blast can stun entire party (or solo character).

**Solution:** Always review monster stat blocks for save-or-die or crowd control abilities. Ensure character has counter-play.

### Pitfall 4: CR 0 Monster Spam
**Problem:** Using lots of CR 0 creatures (rats, commoners) for XP padding.

**Solution:** CR 0 monsters give 0-10 XP and are designed to be non-threatening. Avoid using them except for flavor/roleplay.

### Pitfall 5: Same Monsters Repeatedly
**Problem:** Always picking the most "efficient" monster for each CR tier.

**Solution:** Use variety! The monster database has multiple options per CR. Rotate through different monster types for gameplay diversity.

## Quick Reference: Recommended Monsters by Level

### Levels 1-3 (Starting Tier)
- **CR 1/8:** Kobold, Bandit, Giant Rat
- **CR 1/4:** Goblin, Skeleton, Wolf
- **CR 1/2:** Orc, Hobgoblin, Shadow
- **CR 1:** Bugbear, Dire Wolf, Ghoul

### Levels 4-7 (Adventurer Tier)
- **CR 2:** Ogre, Griffon, Ankheg
- **CR 3:** Basilisk, Werewolf, Minotaur
- **CR 4:** Ettin, Ghost, Couatl
- **CR 5:** Troll, Air Elemental, Hill Giant

### Levels 8-12 (Hero Tier)
- **CR 6:** Chimera, Medusa, Wyvern
- **CR 7:** Mind Flayer, Stone Giant, Young Black Dragon
- **CR 8:** Tyrannosaurus Rex, Frost Giant, Hydra
- **CR 9:** Cloud Giant, Bone Devil, Young Blue Dragon
- **CR 10:** Stone Golem, Young Red Dragon, Aboleth

### Levels 13-16 (Champion Tier)
- **CR 11:** Djinni, Horned Devil, Remorhaz
- **CR 12:** Erinyes, Arcanaloth
- **CR 13:** Beholder, Rakshasa, Adult Brass Dragon
- **CR 14:** Adult Black Dragon, Ice Devil
- **CR 15:** Purple Worm, Adult Green Dragon

### Levels 17-20 (Epic Tier)
- **CR 16:** Marilith, Iron Golem, Adult Silver Dragon
- **CR 17:** Adult Gold Dragon, Death Knight, Dragon Turtle
- **CR 18:** Demilich
- **CR 19:** Balor
- **CR 20:** Pit Fiend, Ancient Brass Dragon
- **CR 21+:** Lich, Ancient Dragons, Solar, Tarrasque (boss only)

## Integration with Roguelike Progression

### Level-Based Monster Pool Selection

```
FUNCTION getMonsterPoolForLevel(characterLevel):
    // Get appropriate CR range for this level
    minCR = max(0, characterLevel - 2)
    maxCR = characterLevel + 1

    // Collect all monsters in this range
    pool = []
    FOR each CR from minCR to maxCR:
        pool.extend(monsters_by_cr[CR])

    RETURN pool
```

### Difficulty Progression Curve

Suggested difficulty distribution for roguelike progression:

```
Floor 1-3:    60% Low, 30% Moderate, 10% High
Floor 4-6:    40% Low, 40% Moderate, 20% High
Floor 7-10:   30% Low, 40% Moderate, 30% High
Floor 11-15:  20% Low, 40% Moderate, 40% High
Floor 16-20:  10% Low, 30% Moderate, 60% High
Boss Floors:  100% High or Epic (CR +2 or +3)
```

### Reward Scaling by Difficulty

Match loot quality to encounter difficulty:

- **Low Difficulty:**
  - Base gold = CR × 10
  - Standard consumables (healing potions)
  - Common magic items (5% chance)

- **Moderate Difficulty:**
  - Base gold = CR × 20
  - Enhanced consumables (greater healing, scrolls)
  - Uncommon magic items (15% chance)
  - Rare magic items (2% chance)

- **High Difficulty:**
  - Base gold = CR × 30
  - Premium consumables (superior healing, spell scrolls)
  - Uncommon magic items (30% chance)
  - Rare magic items (10% chance)
  - Very Rare magic items (1% chance)

- **Boss/Epic Difficulty:**
  - Base gold = CR × 50
  - Guaranteed magic item drop
  - Rare magic items (40% chance)
  - Very Rare magic items (15% chance)
  - Legendary magic items (2% chance)

## Fetching Monster Stat Blocks

When combat begins, you'll need the full monster stat block. Here's how:

### Using WebFetch to Get Stat Blocks

```javascript
// Example: Get full stats for a Goblin
const monster = {
    name: "Goblin",
    url: "https://www.aidedd.org/dnd/monstres.php?vo=goblin"
};

// Fetch full stat block
const statBlock = await fetchMonsterStats(monster.url);

// Returns:
{
    name: "Goblin",
    size: "Small",
    type: "Humanoid (goblinoid)",
    alignment: "Neutral Evil",
    ac: 15,
    hp: { average: 7, formula: "2d6" },
    speed: { walk: 30 },
    abilities: {
        str: 8, dex: 14, con: 10,
        int: 10, wis: 8, cha: 8
    },
    skills: { stealth: 6 },
    senses: "Darkvision 60 ft., passive Perception 9",
    languages: "Common, Goblin",
    cr: "1/4",
    xp: 50,
    special_abilities: [
        {
            name: "Nimble Escape",
            description: "Can Disengage or Hide as bonus action"
        }
    ],
    actions: [
        {
            name: "Scimitar",
            type: "melee",
            attack_bonus: 4,
            reach: 5,
            damage: { dice: "1d6+2", average: 5, type: "slashing" }
        },
        {
            name: "Shortbow",
            type: "ranged",
            attack_bonus: 4,
            range: "80/320",
            damage: { dice: "1d6+2", average: 5, type: "piercing" }
        }
    ]
}
```

### Stat Block Fields Explained

**Basic Info:**
- `name`: Monster name
- `size`: Tiny, Small, Medium, Large, Huge, Gargantuan
- `type`: Creature type (Beast, Dragon, Humanoid, etc.)
- `alignment`: Lawful/Neutral/Chaotic + Good/Neutral/Evil

**Combat Stats:**
- `ac`: Armor Class (target number to hit)
- `hp`: Hit points (use average or roll formula)
- `speed`: Movement rates in feet per turn

**Abilities:**
- `str`, `dex`, `con`, `int`, `wis`, `cha`: Ability scores (modifiers derived as: (score - 10) / 2, rounded down)

**Skills/Senses:**
- `skills`: Skill bonuses (Stealth, Perception, etc.)
- `senses`: Special senses and passive Perception
- `languages`: Languages the monster knows

**Combat Actions:**
- `special_abilities`: Passive or triggered abilities
- `actions`: Attacks and other actions (multiattack, spells, breath weapons, etc.)
- `legendary_actions`: Special actions for legendary creatures (if present)

## Summary: Key Takeaways for Implementation

1. **Use `monsters.json`** for monster pool organized by CR
2. **Use XP Budget Table** to determine encounter budget based on character level and desired difficulty
3. **Use CR to XP Table** to convert monster CR to XP value
4. **For Solo Play:** Prefer single monsters, avoid multiple weak enemies
5. **CR Guidelines:** Low = Level-2, Moderate = Level-1 to Level, High = Level to Level+1
6. **High Levels (10+):** Trust CR over XP budget
7. **Fetch full stat blocks** from monster URL when combat begins
8. **Scale rewards** based on difficulty (Low/Moderate/High)

## Additional Resources

- **Monster Database:** `monsters.json` (428 monsters, CR 0-30)
- **Encounter Guide:** `encounter-building-guide.md` (reference tables)
- **Stat Block Source:** https://www.aidedd.org/dnd-filters/monsters.php
- **D&D 2024 Rules:** Focus on XP Budget system, not 2014 multiplier system

---

**Last Updated:** 2025-10-02
**D&D Edition:** 2024 (compatible with 5e monster stats)
**Monster Count:** 428
**CR Range:** 0 to 30
