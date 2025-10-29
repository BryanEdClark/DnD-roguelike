# D&D Character Avatar System

## Current Avatars

The system currently has **81+ fantasy-style avatars** using improved DiceBear styles that are more appropriate for D&D characters:
- **9 species**: Human, Elf, Dwarf, Halfling, Dragonborn, Gnome, Half-Elf, Half-Orc, Tiefling
- **3 genders**: Male, Female, Other
- **3-4 variants** per species/gender combination

## Adding Custom Fantasy Artwork

### Option 1: Use the Helper Tool (Easiest)

Run the interactive tool to add custom artwork:

```bash
node add-custom-avatar.js
```

The tool will guide you through:
1. Selecting species and gender
2. Providing image URL or local file path
3. Automatically updating the avatar gallery

### Option 2: Manual Addition

1. **Find or create your artwork:**
   - Recommended size: 512x512px or larger (square format)
   - Supported formats: PNG, JPG, SVG, WebP
   - Transparent backgrounds work best

2. **Save the file:**
   - Location: `public/images/avatars/`
   - Naming: `{species}-{gender}-{variant}.{ext}`
   - Example: `elf-female-05.png`

3. **Update the config:**
   - Edit: `public/avatar-gallery.json`
   - Add entry to appropriate species/gender array:

```json
{
  "id": "05",
  "path": "/images/avatars/elf-female-05.png",
  "style": "custom",
  "description": "custom-artwork"
}
```

4. **Refresh browser** to see new avatar

## Free Fantasy Art Resources

### Character Portrait Generators
- **HeroForge**: heroforge.com (3D character creator)
- **Artbreeder**: artbreeder.com (AI-generated portraits)
- **Portrait Workshop**: portrait.works (D&D portraits)
- **NightCafe**: creator.nightcafe.studio (AI art generator)

### Art Communities
- **ArtStation**: artstation.com - Search "D&D character portrait"
- **DeviantArt**: deviantart.com - Fantasy character section
- **Pinterest**: pinterest.com - Create D&D character boards

### Token Makers
- **Roll20**: roll20.net/welcome - Token creator
- **Token Stamp**: rolladvantage.com/tokenstamp/

### AI Art Generators (Free Tier)
- **Stable Diffusion** via:
  - DreamStudio: beta.dreamstudio.ai
  - Playground AI: playgroundai.com
- **Bing Image Creator**: bing.com/create
- **Leonardo.ai**: leonardo.ai

### Prompt Examples for AI Generators

```
"Portrait of a [species] [class], fantasy art, D&D character, detailed face, [gender], RPG illustration"

Examples:
- "Portrait of an elf ranger, fantasy art, D&D character, detailed face, female, RPG illustration"
- "Portrait of a dwarf cleric, fantasy art, D&D character, detailed face, male, RPG illustration, beard"
- "Portrait of a tiefling warlock, fantasy art, D&D character, detailed face, horns, red skin, mystical"
```

## Batch Replacement

To replace all avatars at once:

1. Download your avatar set (108 images)
2. Name them using the pattern: `{species}-{gender}-{variant}.{ext}`
3. Place them in `public/images/avatars/`
4. Run: `node download-fantasy-avatars.js` to regenerate config
5. Or manually update `avatar-gallery.json`

## Tips for Best Results

✅ **Square images** (1:1 aspect ratio) display best
✅ **Centered faces** work better than full-body art
✅ **512x512px or higher** for crisp display
✅ **Transparent backgrounds** (PNG) blend seamlessly
✅ **Consistent art style** across species looks professional

## License Note

When using artwork from online sources:
- ✅ Use royalty-free or CC0 licensed art
- ✅ Give credit where required
- ✅ Use AI-generated art (you own the rights)
- ❌ Don't use copyrighted art without permission
