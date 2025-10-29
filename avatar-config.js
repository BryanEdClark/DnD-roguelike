// Avatar configuration for D&D character species and genders
// Using DiceBear Avatars API for placeholder images
// These can be replaced with custom artwork later

const AVATAR_BASE_URL = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

const SPECIES = {
    'human': { name: 'Human', colors: ['#f4a460', '#deb887', '#8b7355'] },
    'elf': { name: 'Elf', colors: ['#ffe4b5', '#f5deb3', '#d2b48c'] },
    'dwarf': { name: 'Dwarf', colors: ['#cd853f', '#a0522d', '#8b4513'] },
    'halfling': { name: 'Halfling', colors: ['#f4a460', '#daa520', '#b8860b'] },
    'dragonborn': { name: 'Dragonborn', colors: ['#cd5c5c', '#4682b4', '#32cd32'] },
    'gnome': { name: 'Gnome', colors: ['#ff69b4', '#dda0dd', '#ba55d3'] },
    'half-elf': { name: 'Half-Elf', colors: ['#f5deb3', '#d2b48c', '#bc8f8f'] },
    'half-orc': { name: 'Half-Orc', colors: ['#9acd32', '#808000', '#6b8e23'] },
    'tiefling': { name: 'Tiefling', colors: ['#dc143c', '#8b0000', '#ff6347'] }
};

const GENDERS = ['male', 'female', 'other'];

// Generate avatar configurations
const AVATARS = {};

Object.keys(SPECIES).forEach(species => {
    AVATARS[species] = {};
    GENDERS.forEach(gender => {
        const seed = `${species}-${gender}`;
        AVATARS[species][gender] = {
            url: `${AVATAR_BASE_URL}${seed}&backgroundColor=transparent`,
            fallbackColor: SPECIES[species].colors[0]
        };
    });
});

// Export for use in both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AVATARS, SPECIES, GENDERS };
}
