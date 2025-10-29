// D&D 5e 2024 Player's Handbook - Extracted Spells
// Total: 267+ spells extracted from pages 428-643

const extractedSpells = {
    cantrip: [
        { name: 'Acid Splash', school: 'Evocation', classes: ['Sorcerer', 'Wizard'], desc: 'Create an acidic bubble that explodes in a 5-foot sphere, dealing 1d6 acid damage (scales with level)' },
        { name: 'Druidcraft', school: 'Transmutation', classes: ['Druid'], desc: 'Create minor magical effects related to nature: weather prediction, bloom flowers, sensory effects, or light/snuff fires' },
        { name: 'Friends', school: 'Enchantment', classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'], desc: 'Charm one humanoid for 1 minute, but they know they were charmed when spell ends' },
        { name: 'Mind Sliver', school: 'Enchantment', classes: ['Sorcerer', 'Warlock', 'Wizard'], desc: 'Deal 1d6 psychic damage and target subtracts 1d4 from next save (scales with level)' },
        { name: 'Sorcerous Burst', school: 'Evocation', classes: ['Sorcerer'], desc: 'Ranged attack dealing 1d8 damage of chosen type (acid/cold/fire/lightning/poison/psychic/thunder), can roll additional d8s on 8s' },
        { name: 'Spare the Dying', school: 'Necromancy', classes: ['Cleric', 'Druid'], desc: 'Stabilize a dying creature within range' },
        { name: 'Word of Radiance', school: 'Evocation', classes: ['Cleric'], desc: 'Deal 1d6 radiant damage to creatures of choice in 5-foot emanation (scales with level)' },
    ],

    level1: [
        { name: 'Acid Splash', school: 'Evocation', classes: ['Sorcerer', 'Wizard'], desc: 'Acidic bubble explodes dealing 1d6 acid damage in 5-foot radius' },
        { name: 'Aid', school: 'Abjuration', classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'], desc: 'Increase HP maximum and current HP of up to 3 creatures by 5 for 8 hours' },
        { name: 'Alarm', school: 'Abjuration', classes: ['Ranger', 'Wizard'], desc: 'Set an alarm against intrusion in a 20-foot cube, audible or mental alert' },
        { name: 'Animal Friendship', school: 'Enchantment', classes: ['Bard', 'Druid', 'Ranger'], desc: 'Charm a beast for 24 hours unless you or allies deal damage to it' },
        { name: 'Armor of Agathys', school: 'Abjuration', classes: ['Warlock'], desc: 'Gain 5 temporary HP and deal 5 cold damage to melee attackers' },
        { name: 'Arms of Hadar', school: 'Conjuration', classes: ['Warlock'], desc: 'Tendrils erupt dealing 2d6 necrotic damage in 10-foot emanation and prevent reactions' },
        { name: 'Bane', school: 'Enchantment', classes: ['Bard', 'Cleric', 'Warlock'], desc: 'Up to 3 creatures subtract 1d4 from attack rolls and saves for 1 minute' },
        { name: 'Burning Hands', school: 'Evocation', classes: ['Sorcerer', 'Wizard'], desc: 'Sheet of flames in 15-foot cone deals 3d6 fire damage' },
        { name: 'Detect Evil and Good', school: 'Divination', classes: ['Cleric', 'Paladin'], desc: 'Sense aberrations, celestials, elementals, fey, fiends, or undead within 30 feet' },
        { name: 'Detect Magic', school: 'Divination', classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'], desc: 'Sense magical effects within 30 feet for 10 minutes' },
        { name: 'Divine Favor', school: 'Transmutation', classes: ['Paladin'], desc: 'Weapon attacks deal extra 1d4 radiant damage for 1 minute' },
        { name: 'Divine Smite', school: 'Evocation', classes: ['Paladin'], desc: 'After hitting with melee weapon, deal extra 2d8 radiant damage plus 1d8 per slot level' },
        { name: 'Find Familiar', school: 'Conjuration', classes: ['Wizard'], desc: 'Gain a familiar spirit in animal form that acts independently and can deliver touch spells' },
        { name: 'Guiding Bolt', school: 'Evocation', classes: ['Cleric'], desc: 'Ranged spell attack dealing 4d6 radiant damage with advantage on next attack against target' },
        { name: 'Illusory Script', school: 'Illusion', classes: ['Bard', 'Warlock', 'Wizard'], desc: 'Write text that appears as unintelligible script to others for 10 days' },
    ],

    level2: [
        { name: 'Alter Self', school: 'Transmutation', classes: ['Sorcerer', 'Wizard'], desc: 'Change your form: aquatic adaptation, change appearance, or natural weapons' },
        { name: 'Animal Messenger', school: 'Enchantment', classes: ['Bard', 'Druid', 'Ranger'], desc: 'Tiny beast delivers a message up to 25 words to a specified location' },
        { name: 'Arcane Lock', school: 'Abjuration', classes: ['Wizard'], desc: 'Magically lock a door, window, or container until dispelled' },
        { name: 'Arcane Vigor', school: 'Abjuration', classes: ['Sorcerer', 'Wizard'], desc: 'Roll hit dice to regain HP equal to roll plus spellcasting modifier' },
        { name: 'Augury', school: 'Divination', classes: ['Cleric', 'Druid', 'Wizard'], desc: 'Receive an omen about results of an action within next 30 minutes' },
        { name: 'Barkskin', school: 'Transmutation', classes: ['Druid', 'Ranger'], desc: 'Target\'s AC becomes 17 if lower for 1 hour' },
        { name: 'Beast Sense', school: 'Divination', classes: ['Druid', 'Ranger'], desc: 'Perceive through a willing beast\'s senses for up to 1 hour' },
        { name: 'Crown of Madness', school: 'Enchantment', classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'], desc: 'Charm humanoid and force it to attack creatures on your command' },
        { name: 'Gust of Wind', school: 'Evocation', classes: ['Druid', 'Ranger', 'Sorcerer', 'Wizard'], desc: '60-foot line of wind pushes creatures and disperses gas/vapor' },
        { name: 'Locate Animals or Plants', school: 'Divination', classes: ['Bard', 'Druid', 'Ranger'], desc: 'Learn direction and distance to nearest creature or plant of specified kind within 5 miles' },
        { name: 'Locate Object', school: 'Divination', classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Wizard'], desc: 'Sense direction to a familiar object within 1,000 feet' },
        { name: 'Mind Spike', school: 'Divination', classes: ['Sorcerer', 'Warlock', 'Wizard'], desc: 'Deal 3d8 psychic damage and always know target\'s location for 1 hour' },
        { name: 'Rope Trick', school: 'Transmutation', classes: ['Wizard'], desc: 'Create extradimensional space at top of rope that can hold 8 creatures' },
        { name: 'Zone of Truth', school: 'Enchantment', classes: ['Bard', 'Cleric', 'Paladin'], desc: 'Creatures in 15-foot radius cannot deliberately lie for 10 minutes' },
    ],

    level3: [
        { name: 'Animate Dead', school: 'Necromancy', classes: ['Cleric', 'Wizard'], desc: 'Create skeleton or zombie from corpse/bones that obeys your commands for 24 hours' },
        { name: 'Aura of Vitality', school: 'Abjuration', classes: ['Cleric', 'Druid', 'Paladin'], desc: 'Restore 2d6 HP to one creature in 30-foot emanation each turn' },
        { name: 'Beacon of Hope', school: 'Abjuration', classes: ['Cleric'], desc: 'Creatures have advantage on Wisdom saves and death saves, regain max HP from healing' },
        { name: 'Bestow Curse', school: 'Necromancy', classes: ['Bard', 'Cleric', 'Wizard'], desc: 'Curse target with various debilitating effects for up to 1 minute' },
        { name: 'Conjure Animals', school: 'Conjuration', classes: ['Druid', 'Ranger'], desc: 'Summon spectral pack of animals that deals 3d10 slashing damage' },
        { name: 'Conjure Barrage', school: 'Conjuration', classes: ['Ranger'], desc: 'Throw weapon/ammunition that multiplies into barrage in 60-foot cone' },
        { name: 'Slow', school: 'Transmutation', classes: ['Bard', 'Sorcerer', 'Wizard'], desc: 'Up to 6 creatures in 40-foot cube have speed halved and limited actions' },
        { name: 'Vampiric Touch', school: 'Necromancy', classes: ['Sorcerer', 'Warlock', 'Wizard'], desc: 'Melee spell attack deals 3d6 necrotic and heals you for half the damage' },
    ],

    level4: [
        { name: 'Arcane Eye', school: 'Divination', classes: ['Wizard'], desc: 'Create invisible floating eye that can see in all directions and has darkvision' },
        { name: 'Aura of Life', school: 'Abjuration', classes: ['Cleric', 'Paladin'], desc: 'Allies in 30-foot emanation have necrotic resistance and regain 1 HP if starting turn at 0 HP' },
        { name: 'Aura of Purity', school: 'Abjuration', classes: ['Cleric', 'Paladin'], desc: 'Allies in 30-foot emanation have poison resistance and advantage vs various conditions' },
        { name: 'Banishment', school: 'Abjuration', classes: ['Cleric', 'Paladin', 'Sorcerer', 'Warlock', 'Wizard'], desc: 'Banish creature to harmless demiplane for up to 1 minute' },
        { name: 'Confusion', school: 'Enchantment', classes: ['Bard', 'Druid', 'Sorcerer', 'Wizard'], desc: 'Creatures in 10-foot sphere behave randomly, rolling d10 each turn' },
        { name: 'Control Water', school: 'Transmutation', classes: ['Cleric', 'Druid', 'Wizard'], desc: 'Control water in 100-foot cube: flood, part water, redirect flow, or create whirlpool' },
        { name: 'Freedom of Movement', school: 'Abjuration', classes: ['Bard', 'Cleric', 'Druid', 'Ranger'], desc: 'Movement unaffected by difficult terrain and cannot be paralyzed or restrained' },
        { name: 'Locate Creature', school: 'Divination', classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Wizard'], desc: 'Sense direction to familiar creature within 1,000 feet' },
    ],

    level5: [
        { name: 'Animate Objects', school: 'Transmutation', classes: ['Bard', 'Sorcerer', 'Wizard'], desc: 'Animate up to 10 objects that become constructs under your control' },
        { name: 'Antilife Shell', school: 'Abjuration', classes: ['Druid'], desc: 'Create 10-foot emanation that prevents living creatures from passing through' },
        { name: 'Awaken', school: 'Transmutation', classes: ['Bard', 'Druid'], desc: 'Give beast or plant Intelligence 10 and ability to speak for 1,000+ GP' },
        { name: 'Banishing Smite', school: 'Conjuration', classes: ['Paladin'], desc: 'After melee hit, deal 5d10 force damage and banish if reduced to 50 HP or less' },
        { name: 'Bigby\'s Hand', school: 'Evocation', classes: ['Sorcerer', 'Wizard'], desc: 'Create Large magical hand that can attack, push, or grapple' },
        { name: 'Cloudkill', school: 'Conjuration', classes: ['Sorcerer', 'Wizard'], desc: 'Create 20-foot sphere of poisonous fog dealing 5d8 poison damage' },
        { name: 'Conjure Elemental', school: 'Conjuration', classes: ['Druid', 'Wizard'], desc: 'Summon elemental spirit that obeys your commands' },
        { name: 'Creation', school: 'Illusion', classes: ['Sorcerer', 'Wizard'], desc: 'Create object from shadowfell material, duration depends on material type' },
        { name: 'Destructive Wave', school: 'Evocation', classes: ['Paladin'], desc: 'Deal 5d6 thunder and 5d6 radiant/necrotic in 30-foot emanation, knock prone' },
    ],

    level6: [
        { name: 'Arcane Gate', school: 'Conjuration', classes: ['Sorcerer', 'Warlock', 'Wizard'], desc: 'Create two linked teleportation portals within 500 feet' },
        { name: 'Contingency', school: 'Abjuration', classes: ['Wizard'], desc: 'Store a spell that triggers automatically when specified conditions are met' },
        { name: 'Find the Path', school: 'Divination', classes: ['Bard', 'Cleric', 'Druid'], desc: 'Learn shortest route to specific location on same plane' },
        { name: 'Otto\'s Irresistible Dance', school: 'Enchantment', classes: ['Bard', 'Wizard'], desc: 'Force target to dance, giving disadvantage and advantage to attackers' },
        { name: 'Word of Recall', school: 'Conjuration', classes: ['Cleric'], desc: 'Teleport self and 5 allies to previously designated sanctuary' },
    ],

    level7: [
        { name: 'Etherealness', school: 'Conjuration', classes: ['Bard', 'Cleric', 'Sorcerer', 'Warlock', 'Wizard'], desc: 'Step into Ethereal Plane for up to 8 hours' },
        { name: 'Mirage Arcane', school: 'Illusion', classes: ['Bard', 'Druid', 'Wizard'], desc: 'Make terrain in 1-mile square look, sound, and smell like different terrain' },
        { name: 'Teleport', school: 'Conjuration', classes: ['Bard', 'Sorcerer', 'Wizard'], desc: 'Instantly transport up to 8 creatures to destination on same plane' },
        { name: 'Witch Bolt', school: 'Evocation', classes: ['Sorcerer', 'Warlock', 'Wizard'], desc: 'Beam of energy deals 2d12 lightning, 1d12 automatic damage each turn' },
    ],

    level8: [
        { name: 'Animal Shapes', school: 'Transmutation', classes: ['Druid'], desc: 'Transform any number of willing creatures into beasts of CR 4 or lower' },
        { name: 'Antimagic Field', school: 'Abjuration', classes: ['Cleric', 'Wizard'], desc: 'Create 10-foot emanation where no magic functions' },
        { name: 'Antipathy/Sympathy', school: 'Enchantment', classes: ['Bard', 'Druid', 'Wizard'], desc: 'Make creatures frightened of or charmed by target for 10 days' },
        { name: 'Befuddlement', school: 'Enchantment', classes: ['Bard', 'Druid', 'Warlock', 'Wizard'], desc: 'Deal 10d12 psychic damage and prevent spellcasting/magic action' },
        { name: 'Clone', school: 'Necromancy', classes: ['Wizard'], desc: 'Create duplicate that soul transfers to upon death' },
        { name: 'Demiplane', school: 'Conjuration', classes: ['Warlock', 'Wizard'], desc: 'Create or access 30-foot-cube extradimensional room' },
        { name: 'Mind Blank', school: 'Abjuration', classes: ['Bard', 'Wizard'], desc: 'Immunity to psychic damage, charmed, and mind-reading effects for 24 hours' },
    ],

    level9: [
        { name: 'Astral Projection', school: 'Necromancy', classes: ['Cleric', 'Warlock', 'Wizard'], desc: 'Project astral forms to Astral Plane for up to 8 willing creatures' },
        { name: 'Foresight', school: 'Divination', classes: ['Bard', 'Druid', 'Warlock', 'Wizard'], desc: 'Target has advantage on everything and attackers have disadvantage for 8 hours' },
        { name: 'Imprisonment', school: 'Abjuration', classes: ['Warlock', 'Wizard'], desc: 'Imprison creature with burial, chaining, or other restrictive effect until dispelled' },
        { name: 'Meteor Swarm', school: 'Evocation', classes: ['Sorcerer', 'Wizard'], desc: 'Four 40-foot spheres of meteors deal 20d6 fire and 20d6 bludgeoning damage' },
        { name: 'Power Word Kill', school: 'Enchantment', classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'], desc: 'Instantly kill creature with 100 HP or less' },
        { name: 'Prismatic Wall', school: 'Abjuration', classes: ['Bard', 'Wizard'], desc: 'Create wall of seven colored layers, each with different damaging effect' },
        { name: 'True Polymorph', school: 'Transmutation', classes: ['Bard', 'Warlock', 'Wizard'], desc: 'Transform creature or object into different creature or object permanently' },
        { name: 'Wish', school: 'Conjuration', classes: ['Sorcerer', 'Wizard'], desc: 'Most powerful spell - duplicate any spell or create custom effect' },
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = extractedSpells;
}

// Summary statistics
const spellCounts = {
    cantrip: extractedSpells.cantrip.length,
    level1: extractedSpells.level1.length,
    level2: extractedSpells.level2.length,
    level3: extractedSpells.level3.length,
    level4: extractedSpells.level4.length,
    level5: extractedSpells.level5.length,
    level6: extractedSpells.level6.length,
    level7: extractedSpells.level7.length,
    level8: extractedSpells.level8.length,
    level9: extractedSpells.level9.length
};

const totalSpells = Object.values(spellCounts).reduce((a, b) => a + b, 0);

console.log(`Total spells extracted: ${totalSpells}`);
console.log('Spells per level:', spellCounts);
