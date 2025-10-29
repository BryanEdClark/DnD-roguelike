# Quick Guide: Get Better Fantasy Character Art (5 Minutes)

## 🎨 Fastest Method: AI Art Generators (Free)

### 1. Bing Image Creator (No Account Needed)
**URL**: https://www.bing.com/create

1. Visit the link
2. Use these prompts:

```
Elf Ranger Portrait:
"fantasy portrait of an elf ranger, detailed face, pointed ears, green cloak, forest background, digital art, RPG character illustration, dungeons and dragons style"

Dwarf Cleric Portrait:
"fantasy portrait of a dwarf cleric, detailed face, braided beard, holy symbol, armor, digital art, RPG character illustration, dungeons and dragons style"

Human Wizard Portrait:
"fantasy portrait of a human wizard, detailed face, mystical robes, spellbook, magical aura, digital art, RPG character illustration, dungeons and dragons style"

Tiefling Warlock Portrait:
"fantasy portrait of a tiefling warlock, detailed face, horns, red skin, dark robes, eldritch magic, digital art, RPG character illustration, dungeons and dragons style"
```

3. Download the 512x512 version
4. Save with naming: `{species}-{gender}-01.png`
5. Place in `public/images/avatars/`
6. Run: `node add-custom-avatar.js` OR manually update config

### 2. Leonardo.ai (Free Account - 150 images/day)
**URL**: https://leonardo.ai

1. Sign up for free
2. Select "DreamShaper v7" model
3. Use similar prompts as above
4. Download and add to avatar folder

### 3. NightCafe Studio (Free Credits Daily)
**URL**: https://creator.nightcafe.studio

1. Sign up for free
2. Choose "Stable" algorithm
3. Use portrait prompts
4. Download results

---

## 📚 Pre-Made Token Collections

### Roll20 Tokens (Free)
1. Visit: https://marketplace.roll20.net/browse/search/?keywords=token&type=all
2. Filter by "Free"
3. Download token packs
4. Extract and rename files

### Dungeon Scrawl Tokens
**URL**: https://dungeonscrawl.com/
- Free token maker with D&D style characters

---

## 🖼️ Find Existing Fantasy Art

### ArtStation (High Quality, Free for Personal Use)
1. Go to: https://www.artstation.com/
2. Search: "D&D character portrait elf" (or any species)
3. Filter: "Free Assets" or look for CC0 licensed work
4. Download and crop to square format

### Useful ArtStation Searches:
- "dnd character portrait human"
- "fantasy character portrait dwarf"
- "rpg character art elf"
- "dungeons and dragons tiefling"

---

## 🎯 Pro Tips for Quick Setup

### Batch Generation (30 minutes for all 108 avatars):

1. **Open Bing Image Creator** in multiple tabs
2. **Generate all 9 species** with 3 genders each (27 prompts)
3. **Download 4 variations** per combination
4. **Bulk rename** using a file renamer tool
5. **Drop into avatars folder**
6. **Update config** with helper script

### Template Prompts by Species:

```javascript
const prompts = {
  human: "fantasy portrait of a human {class}, detailed face, {gender}, medieval fantasy, digital art",
  elf: "fantasy portrait of an elf {class}, detailed face, pointed ears, {gender}, ethereal, digital art",
  dwarf: "fantasy portrait of a dwarf {class}, detailed face, beard, {gender}, stout, digital art",
  halfling: "fantasy portrait of a halfling {class}, detailed face, young appearance, {gender}, digital art",
  dragonborn: "fantasy portrait of a dragonborn {class}, detailed face, dragon scales, {gender}, digital art",
  gnome: "fantasy portrait of a gnome {class}, detailed face, small, {gender}, whimsical, digital art",
  "half-elf": "fantasy portrait of a half-elf {class}, detailed face, slightly pointed ears, {gender}, digital art",
  "half-orc": "fantasy portrait of a half-orc {class}, detailed face, tusks, {gender}, strong, digital art",
  tiefling: "fantasy portrait of a tiefling {class}, detailed face, horns, {gender}, infernal, digital art"
};
```

---

## ⚡ Super Quick Option (1 Minute)

Already have the improved avatars! The `download-fantasy-avatars.js` script created better fantasy-themed avatars. They're ready to use!

To see them:
1. Refresh your browser
2. Go to Player Tools → Character Sheet
3. Select a species and gender
4. Choose from the gallery

Want even better? Follow the guides above to replace them with AI-generated or custom artwork!

---

## 📝 Remember

✅ Save as: `{species}-{gender}-{variant}.png` (e.g., `elf-female-01.png`)
✅ Place in: `public/images/avatars/`
✅ Update config with: `node add-custom-avatar.js`
✅ Refresh browser to see changes

**Having fun? Generate unique avatars for each of your characters!**
