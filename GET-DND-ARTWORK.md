# Get REAL D&D Character Artwork

## Problem
The current avatars are generic. You need **actual D&D species artwork** that looks like proper elves, dwarves, tieflings, etc.

## Solution: Free D&D Character Portrait Packs

---

## 🎯 BEST OPTIONS (Proper D&D Art)

### 1. **2-Minute Tokens by Tom Cartos** (FREE)
**Download**: https://2minutetabletop.com/product-category/tokens/character-tokens/

- ✅ Professional D&D-style artwork
- ✅ Includes: Humans, Elves, Dwarves, Tieflings, Dragonborn, etc.
- ✅ Top-down tokens perfect for our use
- ✅ Free with attribution

**How to use:**
1. Download the token packs (they're free)
2. Extract the images
3. Rename to our format: `{species}-{gender}-01.png`
4. Place in `public/images/avatars/`
5. Update config with: `node add-custom-avatar.js`

### 2. **Forgotten Adventures** (FREE Patreon)
**URL**: https://www.forgotten-adventures.net/

- ✅ Massive library of D&D character tokens
- ✅ Organized by species and class
- ✅ High-quality fantasy art style
- ✅ Free tier available

### 3. **Devin Night Tokens** (Some Free)
**URL**: https://immortalnights.com/tokensite/

- ✅ Professional D&D tokens
- ✅ Character packs by species
- ✅ Top-down view perfect for battle maps

---

## 🤖 AI Art: Proper D&D Species Prompts

If you want to generate your own with AI, use these **VERY SPECIFIC** prompts:

### **Bing Image Creator** (Free, No Login)
URL: https://www.bing.com/create

#### Elf Prompts:
```
"High elf wizard portrait, pointed ears, elegant features, silver hair, arcane robes, D&D 5e official art style, detailed fantasy portrait, digital painting"

"Wood elf ranger portrait, pointed ears, forest camouflage, bow, green eyes, D&D 5e official art style, detailed fantasy portrait, digital painting"
```

#### Dwarf Prompts:
```
"Male dwarf cleric portrait, braided red beard, chainmail armor, holy symbol, stout build, D&D 5e official art style, detailed fantasy portrait, digital painting"

"Female dwarf fighter portrait, braided beard, plate armor, battle axe, D&D 5e official art style, detailed fantasy portrait, digital painting"
```

#### Tiefling Prompts:
```
"Tiefling warlock portrait, red skin, curved horns, glowing eyes, dark robes, infernal ancestry, D&D 5e official art style, detailed fantasy portrait, digital painting"

"Female tiefling rogue portrait, purple skin, small horns, leather armor, cunning expression, D&D 5e official art style, detailed fantasy portrait"
```

#### Dragonborn Prompts:
```
"Red dragonborn paladin portrait, dragon scales, horned head, plate armor, noble expression, D&D 5e official art style, detailed fantasy portrait"

"Blue dragonborn sorcerer portrait, blue scales, draconic features, lightning magic, D&D 5e official art style, detailed fantasy portrait"
```

#### Human Prompts:
```
"Human fighter portrait, medieval armor, determined expression, D&D 5e official art style, detailed fantasy portrait, digital painting"

"Human wizard portrait, robes, spellbook, wise expression, D&D 5e official art style, detailed fantasy portrait, digital painting"
```

#### Halfling Prompts:
```
"Halfling rogue portrait, small stature, curly hair, leather armor, mischievous grin, D&D 5e official art style, detailed fantasy portrait"

"Halfling bard portrait, small person, musical instrument, colorful clothes, D&D 5e official art style, detailed fantasy portrait"
```

#### Gnome Prompts:
```
"Forest gnome druid portrait, small stature, nature magic, pointed hat, D&D 5e official art style, detailed fantasy portrait"

"Rock gnome artificer portrait, small person, goggles, mechanical devices, D&D 5e official art style, detailed fantasy portrait"
```

#### Half-Orc Prompts:
```
"Half-orc barbarian portrait, green-grey skin, tusks, muscular build, fierce expression, D&D 5e official art style, detailed fantasy portrait"

"Female half-orc fighter portrait, green skin, small tusks, armor, strong features, D&D 5e official art style, detailed fantasy portrait"
```

#### Half-Elf Prompts:
```
"Half-elf bard portrait, slightly pointed ears, charming features, musical instrument, D&D 5e official art style, detailed fantasy portrait"

"Half-elf ranger portrait, mixed heritage features, leather armor, bow, D&D 5e official art style, detailed fantasy portrait"
```

---

## 📦 Pre-Made Token Collections

### **Dungeondraft Asset Packs**
Many free community packs include character tokens:
- Search "Dungeondraft free tokens" on Reddit r/dungeondraft
- Download community asset packs
- Extract character tokens

### **Roll20 Marketplace** (Filter: Free)
URL: https://marketplace.roll20.net/browse/search/?keywords=character+token&price=free

- Lots of free character token packs
- Download and extract
- Rename and use

---

## 🎨 Step-by-Step: Generate Full Set (30 mins)

1. **Open Bing Image Creator**
2. **Copy a prompt** from above (e.g., "High elf wizard portrait...")
3. **Generate 4 variations** (click generate 4 times)
4. **Download all 4** images
5. **Rename them:**
   - `elf-male-01.png`
   - `elf-male-02.png`
   - `elf-male-03.png`
   - `elf-male-04.png`
6. **Repeat for each species/gender combination**
7. **Place all in** `public/images/avatars/`
8. **Run:** `node add-custom-avatar.js` for each, or manually update config

---

## ⚡ Quick Fix (Right Now)

I'll create a script that uses better prompts to generate more D&D-appropriate artwork. But for the absolute best results:

1. Go to **2-Minute Tabletop** (link above)
2. Download their **free character token packs**
3. These are professional D&D-style tokens
4. Extract and place in `public/images/avatars/`
5. Update the config

**These will be proper D&D artwork, not generic avatars.**

Want me to create a script that helps you batch process downloaded token packs?
