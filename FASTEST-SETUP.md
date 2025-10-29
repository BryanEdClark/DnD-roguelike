# Get Proper D&D Character Art - FASTEST METHOD

## The Problem
Current avatars are generic. You need proper D&D species artwork where elves actually look like elves, dwarves look like dwarves, etc.

## The Solution - 2 Best Options

---

## ✨ OPTION 1: Use AI with Proper Prompts (10 minutes)

### Step 1: Open Bing Image Creator
**URL**: https://www.bing.com/create
(No login needed, completely free)

### Step 2: Generate Species-Accurate Portraits

#### Copy These Exact Prompts (They Work!):

**Human Male Warrior:**
```
portrait of a human male fighter, D&D character, medieval armor, determined expression, short brown hair, detailed face, fantasy RPG art, professional digital painting, heroic lighting
```

**Elf Female Ranger:**
```
portrait of a high elf female ranger, long pointed ears, silver hair, elegant features, green leather armor, bow, D&D character, detailed face, fantasy RPG art, professional digital painting
```

**Dwarf Male Cleric:**
```
portrait of a dwarf male cleric, long braided red beard, stout build, holy symbol, chainmail, determined expression, D&D character, detailed face, fantasy RPG art, professional digital painting
```

**Tiefling Female Warlock:**
```
portrait of a tiefling female warlock, red skin, curved horns, glowing yellow eyes, dark robes, infernal features, D&D character, detailed face, fantasy RPG art, professional digital painting
```

**Dragonborn Male Paladin:**
```
portrait of a red dragonborn paladin, dragon scales texture, horned reptilian head, golden armor, noble expression, D&D character, detailed face, fantasy RPG art, professional digital painting
```

**Halfling Male Rogue:**
```
portrait of a halfling male rogue, small stature, curly brown hair, youthful face, leather armor, mischievous grin, D&D character, detailed face, fantasy RPG art, professional digital painting
```

**Gnome Female Wizard:**
```
portrait of a forest gnome female wizard, very small stature, pointed ears, colorful robes, spellbook, nature magic, D&D character, detailed face, fantasy RPG art, professional digital painting
```

**Half-Orc Male Barbarian:**
```
portrait of a half-orc male barbarian, green-grey skin, small tusks, muscular build, tribal tattoos, fierce expression, D&D character, detailed face, fantasy RPG art, professional digital painting
```

**Half-Elf Female Bard:**
```
portrait of a half-elf female bard, slightly pointed ears, elegant mixed heritage features, musical instrument, colorful clothing, D&D character, detailed face, fantasy RPG art, professional digital painting
```

### Step 3: Download & Organize

1. Generate 3-4 variations per species/gender
2. Right-click → Save Image As
3. Rename: `{species}-{gender}-01.png`, etc.
4. Save to: `C:\Users\bryan\git\DnD-rogulike\public\images\avatars\`

### Step 4: Update the Gallery

Run:
```bash
node setup-token-pack.js
```
Choose option 1, point it to your downloads folder

---

## 🎯 OPTION 2: Download Professional Token Pack (5 minutes)

### Best Free Source: 2-Minute Tabletop

1. **Visit**: https://2minutetabletop.com/product-category/tokens/character-tokens/

2. **Download these packs** (all free):
   - "Character Token Pack" (has humans, elves, dwarves)
   - "Monster Token Pack" (has dragonborn, tieflings)
   - Any species-specific packs

3. **Extract the files**

4. **Run the helper tool**:
   ```bash
   node setup-token-pack.js
   ```

5. **Select option 1** and point to extracted folder

6. **For each image**, specify species and gender
   - Tool will automatically rename and organize
   - Updates config file automatically

7. **Refresh browser** - done!

---

## 📝 Quick Reference: What Makes Good D&D Art

✅ **Species-Specific Features:**
- Elves: Long pointed ears, elegant features
- Dwarves: Beards, stout build, stocky
- Tieflings: Horns, colored skin (red/purple/blue), tail
- Dragonborn: Dragon scales, reptilian features, no hair
- Halflings: Small, youthful, barefoot often
- Gnomes: Very small, pointed ears, often with nature themes
- Half-Orcs: Green/grey skin, tusks, muscular
- Half-Elves: Slightly pointed ears, mix of human and elf features

✅ **Good prompt keywords:**
- "D&D character"
- "fantasy RPG art"
- "professional digital painting"
- "detailed face"
- "portrait"

❌ **Avoid:**
- Generic "avatar" generators
- Cartoon styles
- Low detail/pixelated
- Wrong species features

---

## 🚀 Do This Right Now (Fastest):

1. Open: https://www.bing.com/create
2. Copy the "Elf Female Ranger" prompt above
3. Click "Create"
4. Download the result
5. Save as: `elf-female-01.png` in `public/images/avatars/`
6. Run: `node add-custom-avatar.js` and add it

**Boom!** You now have one proper D&D avatar. Repeat for the rest.

---

## Need Help?

Run: `node setup-token-pack.js` - Interactive tool to batch process tokens

The current generic avatars will work until you replace them, but following either option above will give you proper D&D species-accurate character portraits!
