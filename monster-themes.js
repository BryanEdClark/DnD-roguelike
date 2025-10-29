// Monster theme tags for themed encounters
// Themes allow for atmospheric encounter generation

const MONSTER_THEMES = {
    // CR 0
    'awakened-shrub': ['forest', 'wilderness', 'fey', 'nature'],
    'baboon': ['forest', 'wilderness', 'jungle', 'ruins'],
    'badger': ['forest', 'wilderness', 'nature'],
    'bat': ['cavern', 'dungeon', 'ruins', 'haunted'],
    'cat': ['urban', 'manor', 'ruins'],
    'commoner': ['urban', 'village', 'anywhere'],
    'crab': ['aquatic', 'coast', 'beach'],
    'deer': ['forest', 'wilderness', 'plains', 'nature'],
    'eagle': ['mountain', 'wilderness', 'aerial', 'plains'],
    'frog': ['swamp', 'aquatic', 'forest'],
    'giant-fire-beetle': ['cavern', 'dungeon', 'underdark'],
    'goat': ['mountain', 'wilderness', 'plains'],
    'hawk': ['wilderness', 'aerial', 'plains', 'mountain'],
    'homunculus': ['laboratory', 'urban', 'manor', 'arcane'],
    'hyena': ['desert', 'plains', 'wilderness'],
    'jackal': ['desert', 'ruins', 'wilderness'],
    'lemure': ['infernal', 'hell', 'dungeon'],
    'lizard': ['desert', 'swamp', 'wilderness'],
    'octopus': ['aquatic', 'underwater', 'coast'],
    'owl': ['forest', 'wilderness', 'haunted', 'night'],
    'quipper': ['aquatic', 'underwater', 'swamp'],
    'rat': ['urban', 'dungeon', 'sewer', 'ruins'],
    'raven': ['haunted', 'ruins', 'wilderness', 'ominous'],
    'scorpion': ['desert', 'dungeon', 'ruins'],
    'sea-horse': ['aquatic', 'underwater', 'coast'],
    'shrieker': ['cavern', 'dungeon', 'underdark', 'fungal'],
    'spider': ['cavern', 'dungeon', 'forest', 'ruins'],
    'vulture': ['desert', 'plains', 'ruins', 'wasteland'],
    'weasel': ['forest', 'wilderness', 'plains'],

    // CR 1
    'animated-armor': ['dungeon', 'castle', 'manor', 'arcane', 'construct'],
    'brass-dragon-wyrmling': ['desert', 'mountain', 'dragon'],
    'brown-bear': ['forest', 'wilderness', 'mountain', 'nature'],
    'bugbear': ['dungeon', 'forest', 'ruins', 'goblinoid'],
    'copper-dragon-wyrmling': ['mountain', 'hills', 'dragon'],
    'death-dog': ['wasteland', 'plains', 'infernal', 'dungeon'],
    'dire-wolf': ['forest', 'wilderness', 'mountain', 'arctic'],
    'dryad': ['forest', 'fey', 'nature', 'woodland'],
    'duergar': ['underdark', 'dungeon', 'mountain', 'forge'],
    'ghoul': ['haunted', 'undead', 'dungeon', 'ruins', 'graveyard'],
    'giant-eagle': ['mountain', 'wilderness', 'aerial', 'nature'],
    'giant-hyena': ['desert', 'plains', 'wasteland'],
    'giant-octopus': ['aquatic', 'underwater', 'deep-sea'],
    'giant-spider': ['cavern', 'dungeon', 'forest', 'underdark'],
    'giant-toad': ['swamp', 'aquatic', 'forest', 'dungeon'],
    'giant-vulture': ['desert', 'plains', 'wasteland', 'mountain'],
    'harpy': ['mountain', 'ruins', 'coast', 'aerial'],
    'hippogriff': ['mountain', 'wilderness', 'aerial', 'nature'],
    'imp': ['infernal', 'hell', 'dungeon', 'urban', 'arcane'],
    'lion': ['plains', 'wilderness', 'savanna'],
    'quasit': ['abyssal', 'chaos', 'dungeon', 'arcane'],
    'specter': ['haunted', 'undead', 'ruins', 'dungeon', 'ethereal'],
    'spy': ['urban', 'intrigue', 'anywhere'],
    'swarm-of-quippers': ['aquatic', 'underwater', 'swamp'],
    'tiger': ['jungle', 'forest', 'wilderness'],

    // CR 2
    'ankheg': ['desert', 'plains', 'forest', 'underground'],
    'awakened-tree': ['forest', 'fey', 'nature', 'woodland'],
    'azer': ['elemental', 'fire', 'forge', 'volcanic'],
    'bandit-captain': ['wilderness', 'urban', 'ruins', 'forest'],
    'berserker': ['wilderness', 'tribal', 'arctic', 'plains'],
    'black-dragon-wyrmling': ['swamp', 'ruins', 'dragon'],
    'bronze-dragon-wyrmling': ['coast', 'aquatic', 'dragon'],
    'centaur': ['plains', 'forest', 'wilderness', 'nature'],
    'cult-fanatic': ['urban', 'dungeon', 'temple', 'cult'],
    'druid': ['forest', 'wilderness', 'nature', 'anywhere'],
    'ettercap': ['forest', 'cavern', 'underdark', 'spider'],
    'gargoyle': ['urban', 'castle', 'ruins', 'aerial', 'construct'],
    'gelatinous-cube': ['dungeon', 'underdark', 'ooze'],
    'ghast': ['haunted', 'undead', 'dungeon', 'ruins', 'graveyard'],
    'giant-boar': ['forest', 'wilderness', 'plains'],
    'giant-constrictor-snake': ['jungle', 'swamp', 'ruins', 'forest'],
    'giant-elk': ['forest', 'wilderness', 'arctic', 'nature'],
    'gibbering-mouther': ['eldritch', 'underdark', 'dungeon', 'aberration'],
    'green-dragon-wyrmling': ['forest', 'jungle', 'dragon'],
    'grick': ['underdark', 'cavern', 'dungeon', 'aberration'],
    'griffon': ['mountain', 'wilderness', 'aerial', 'nature'],
    'hunter-shark': ['aquatic', 'underwater', 'deep-sea'],
    'merrow': ['aquatic', 'coast', 'swamp', 'underwater'],
    'mimic': ['dungeon', 'urban', 'ruins', 'anywhere'],
    'minotaur-skeleton': ['dungeon', 'labyrinth', 'undead', 'ruins'],
    'ochre-jelly': ['dungeon', 'cavern', 'underdark', 'ooze'],
    'ogre': ['wilderness', 'mountain', 'dungeon', 'ruins'],
    'ogre-zombie': ['haunted', 'undead', 'ruins', 'dungeon'],
    'pegasus': ['mountain', 'plains', 'celestial', 'aerial', 'fey'],
    'plesiosaurus': ['aquatic', 'underwater', 'prehistoric'],
    'polar-bear': ['arctic', 'wilderness', 'nature'],
    'priest': ['urban', 'temple', 'anywhere'],
    'rhinoceros': ['plains', 'wilderness', 'savanna'],
    'rug-of-smothering': ['manor', 'urban', 'dungeon', 'construct', 'arcane'],
    'saber-toothed-tiger': ['arctic', 'wilderness', 'mountain', 'prehistoric'],
    'sea-hag': ['aquatic', 'swamp', 'coast', 'haunted', 'fey'],
    'silver-dragon-wyrmling': ['mountain', 'arctic', 'dragon'],
    'swarm-of-poisonous-snakes': ['swamp', 'jungle', 'ruins', 'desert'],
    'wererat-human': ['urban', 'sewer', 'ruins', 'lycanthrope'],
    'wererat-hybrid': ['urban', 'sewer', 'ruins', 'lycanthrope'],
    'wererat-rat': ['urban', 'sewer', 'ruins', 'lycanthrope'],
    'white-dragon-wyrmling': ['arctic', 'mountain', 'dragon'],
    'will-o-wisp': ['swamp', 'haunted', 'undead', 'ethereal', 'night'],

    // CR 3
    'basilisk': ['dungeon', 'cavern', 'ruins', 'desert'],
    'bearded-devil': ['infernal', 'hell', 'dungeon', 'fortress'],
    'blue-dragon-wyrmling': ['desert', 'mountain', 'dragon'],
    'doppelganger': ['urban', 'intrigue', 'anywhere'],
    'giant-scorpion': ['desert', 'dungeon', 'underdark'],
    'gold-dragon-wyrmling': ['mountain', 'dragon', 'celestial'],
    'green-hag': ['swamp', 'forest', 'fey', 'haunted'],
    'hell-hound': ['infernal', 'hell', 'volcanic', 'fortress'],
    'killer-whale': ['aquatic', 'underwater', 'arctic'],
    'knight': ['urban', 'castle', 'fortress', 'anywhere'],
    'manticore': ['wilderness', 'mountain', 'desert', 'ruins'],
    'minotaur': ['dungeon', 'labyrinth', 'ruins', 'maze'],
    'mummy': ['desert', 'ruins', 'tomb', 'undead', 'haunted'],
    'nightmare': ['infernal', 'hell', 'ethereal', 'night'],
    'owlbear': ['forest', 'wilderness', 'cavern', 'nature'],
    'phase-spider': ['ethereal', 'forest', 'underdark', 'eldritch'],
    'veteran': ['urban', 'fortress', 'anywhere'],
    'werewolf-human': ['forest', 'wilderness', 'urban', 'lycanthrope'],
    'werewolf-hybrid': ['forest', 'wilderness', 'urban', 'lycanthrope'],
    'werewolf-wolf': ['forest', 'wilderness', 'urban', 'lycanthrope'],
    'wight': ['haunted', 'undead', 'ruins', 'dungeon', 'tomb'],
    'winter-wolf': ['arctic', 'wilderness', 'mountain', 'nature'],

    // CR 4
    'black-pudding': ['dungeon', 'underdark', 'sewer', 'ooze'],
    'chuul': ['aquatic', 'swamp', 'underdark', 'aberration'],
    'couatl': ['jungle', 'temple', 'celestial', 'ruins'],
    'elephant': ['plains', 'jungle', 'wilderness', 'savanna'],
    'ettin': ['mountain', 'wilderness', 'hills', 'giant'],
    'ghost': ['haunted', 'manor', 'ruins', 'undead', 'ethereal'],
    'lamia': ['desert', 'ruins', 'dungeon'],
    'red-dragon-wyrmling': ['mountain', 'volcanic', 'dragon'],
    'succubus-incubus': ['infernal', 'urban', 'anywhere', 'intrigue'],
    'wereboar-boar': ['forest', 'wilderness', 'lycanthrope'],
    'wereboar-human': ['forest', 'wilderness', 'urban', 'lycanthrope'],
    'wereboar-hybrid': ['forest', 'wilderness', 'lycanthrope'],
    'weretiger-human': ['jungle', 'urban', 'lycanthrope'],
    'weretiger-hybrid': ['jungle', 'wilderness', 'lycanthrope'],
    'weretiger-tiger': ['jungle', 'wilderness', 'lycanthrope'],

    // CR 5
    'air-elemental': ['elemental', 'aerial', 'mountain', 'storm'],
    'barbed-devil': ['infernal', 'hell', 'fortress', 'dungeon'],
    'bulette': ['plains', 'desert', 'underground', 'wilderness'],
    'earth-elemental': ['elemental', 'mountain', 'dungeon', 'underground'],
    'fire-elemental': ['elemental', 'volcanic', 'desert', 'infernal'],
    'flesh-golem': ['laboratory', 'urban', 'dungeon', 'construct', 'arcane'],
    'giant-crocodile': ['swamp', 'aquatic', 'jungle'],
    'giant-shark': ['aquatic', 'underwater', 'deep-sea'],
    'gladiator': ['urban', 'arena', 'fortress'],
    'gorgon': ['mountain', 'dungeon', 'ruins', 'wilderness'],
    'half-red-dragon-veteran': ['anywhere', 'dragon', 'fortress'],
    'hill-giant': ['hills', 'mountain', 'wilderness', 'giant'],
    'night-hag': ['haunted', 'ethereal', 'nightmare', 'infernal'],
    'otyugh': ['sewer', 'dungeon', 'underdark', 'ruins'],
    'roper': ['cavern', 'underdark', 'dungeon', 'aberration'],
    'salamander': ['elemental', 'fire', 'volcanic', 'forge'],
    'shambling-mound': ['swamp', 'forest', 'jungle', 'nature'],
    'triceratops': ['plains', 'jungle', 'wilderness', 'prehistoric'],
    'troll': ['swamp', 'mountain', 'forest', 'wilderness', 'giant'],
    'unicorn': ['forest', 'fey', 'celestial', 'nature', 'woodland'],
    'vampire-spawn': ['haunted', 'undead', 'urban', 'castle', 'manor'],
    'water-elemental': ['elemental', 'aquatic', 'underwater', 'coast'],
    'werebear-bear': ['forest', 'mountain', 'wilderness', 'lycanthrope'],
    'werebear-human': ['forest', 'mountain', 'wilderness', 'lycanthrope'],
    'werebear-hybrid': ['forest', 'mountain', 'wilderness', 'lycanthrope'],
    'wraith': ['haunted', 'undead', 'ethereal', 'ruins', 'tomb'],
    'xorn': ['elemental', 'earth', 'underdark', 'mountain'],

    // CR 6
    'chimera': ['mountain', 'wilderness', 'ruins', 'hybrid'],
    'drider': ['underdark', 'dungeon', 'cavern', 'spider'],
    'invisible-stalker': ['elemental', 'air', 'anywhere', 'arcane'],
    'mage': ['urban', 'laboratory', 'anywhere', 'arcane'],
    'mammoth': ['arctic', 'plains', 'wilderness', 'prehistoric'],
    'medusa': ['ruins', 'dungeon', 'temple', 'underground'],
    'vrock': ['abyssal', 'chaos', 'wasteland', 'ruins'],
    'wyvern': ['mountain', 'wilderness', 'aerial', 'dragon'],
    'young-brass-dragon': ['desert', 'mountain', 'dragon'],
    'young-white-dragon': ['arctic', 'mountain', 'dragon'],

    // CR 7
    'giant-ape': ['jungle', 'forest', 'wilderness', 'ruins'],
    'oni': ['mountain', 'wilderness', 'urban', 'giant', 'evil'],
    'shield-guardian': ['urban', 'laboratory', 'fortress', 'construct', 'arcane'],
    'stone-giant': ['mountain', 'cavern', 'hills', 'giant'],
    'young-black-dragon': ['swamp', 'ruins', 'dragon'],
    'young-copper-dragon': ['mountain', 'hills', 'dragon'],

    // CR 8
    'assassin': ['urban', 'intrigue', 'anywhere'],
    'chain-devil': ['infernal', 'hell', 'fortress', 'dungeon'],
    'cloaker': ['underdark', 'cavern', 'dungeon', 'aberration'],
    'frost-giant': ['arctic', 'mountain', 'giant', 'fortress'],
    'hezrou': ['abyssal', 'chaos', 'swamp', 'dungeon'],
    'hydra': ['swamp', 'aquatic', 'forest', 'wilderness'],
    'spirit-naga': ['ruins', 'temple', 'jungle', 'underground'],
    'tyrannosaurus-rex': ['jungle', 'plains', 'wilderness', 'prehistoric'],
    'young-bronze-dragon': ['coast', 'aquatic', 'dragon'],
    'young-green-dragon': ['forest', 'jungle', 'dragon'],

    // CR 9
    'bone-devil': ['infernal', 'hell', 'fortress', 'dungeon'],
    'clay-golem': ['temple', 'ruins', 'dungeon', 'construct', 'arcane'],
    'cloud-giant': ['mountain', 'aerial', 'castle', 'giant'],
    'fire-giant': ['volcanic', 'mountain', 'fortress', 'giant'],
    'glabrezu': ['abyssal', 'chaos', 'dungeon', 'ruins'],
    'treant': ['forest', 'nature', 'woodland', 'fey'],
    'young-blue-dragon': ['desert', 'mountain', 'dragon'],
    'young-silver-dragon': ['mountain', 'arctic', 'dragon'],

    // CR 10
    'aboleth': ['aquatic', 'underwater', 'underdark', 'eldritch', 'aberration'],
    'deva': ['celestial', 'temple', 'holy', 'anywhere'],
    'guardian-naga': ['ruins', 'temple', 'jungle', 'underground'],
    'stone-golem': ['ruins', 'fortress', 'mountain', 'construct', 'arcane'],
    'young-gold-dragon': ['mountain', 'dragon', 'celestial'],
    'young-red-dragon': ['mountain', 'volcanic', 'dragon'],

    // CR 11
    'behir': ['mountain', 'desert', 'cavern', 'wilderness'],
    'djinni': ['elemental', 'air', 'desert', 'aerial'],
    'efreeti': ['elemental', 'fire', 'volcanic', 'desert'],
    'gynosphinx': ['desert', 'ruins', 'temple', 'guardian'],
    'horned-devil': ['infernal', 'hell', 'fortress', 'dungeon'],
    'remorhaz': ['arctic', 'underground', 'cavern'],
    'roc': ['mountain', 'aerial', 'wilderness', 'desert'],

    // CR 12
    'archmage': ['urban', 'laboratory', 'tower', 'anywhere', 'arcane'],
    'erinyes': ['infernal', 'hell', 'aerial', 'fortress'],

    // CR 13
    'adult-brass-dragon': ['desert', 'mountain', 'dragon'],
    'adult-white-dragon': ['arctic', 'mountain', 'dragon'],
    'nalfeshnee': ['abyssal', 'chaos', 'dungeon', 'fortress'],
    'rakshasa': ['urban', 'intrigue', 'temple', 'jungle'],
    'storm-giant': ['mountain', 'coast', 'storm', 'giant', 'castle'],
    'vampire-bat': ['haunted', 'undead', 'urban', 'castle', 'manor'],
    'vampire-mist': ['haunted', 'undead', 'urban', 'castle', 'manor'],
    'vampire-vampire': ['haunted', 'undead', 'urban', 'castle', 'manor'],

    // CR 14
    'adult-black-dragon': ['swamp', 'ruins', 'dragon'],
    'adult-copper-dragon': ['mountain', 'hills', 'dragon'],
    'ice-devil': ['infernal', 'hell', 'arctic', 'fortress'],

    // CR 15
    'adult-bronze-dragon': ['coast', 'aquatic', 'dragon'],
    'adult-green-dragon': ['forest', 'jungle', 'dragon'],
    'mummy-lord': ['desert', 'ruins', 'tomb', 'undead', 'haunted'],
    'purple-worm': ['desert', 'underdark', 'underground', 'wasteland'],

    // CR 16
    'adult-blue-dragon': ['desert', 'mountain', 'dragon'],
    'adult-silver-dragon': ['mountain', 'arctic', 'dragon'],
    'iron-golem': ['fortress', 'laboratory', 'construct', 'arcane'],
    'marilith': ['abyssal', 'chaos', 'dungeon', 'fortress'],
    'planetar': ['celestial', 'temple', 'holy', 'aerial'],

    // CR 17
    'adult-gold-dragon': ['mountain', 'dragon', 'celestial'],
    'adult-red-dragon': ['mountain', 'volcanic', 'dragon'],
    'androsphinx': ['desert', 'ruins', 'temple', 'guardian'],
    'dragon-turtle': ['aquatic', 'underwater', 'coast', 'dragon'],

    // CR 19
    'balor': ['abyssal', 'chaos', 'volcanic', 'fortress'],

    // CR 20
    'ancient-brass-dragon': ['desert', 'mountain', 'dragon'],
    'ancient-white-dragon': ['arctic', 'mountain', 'dragon'],
    'pit-fiend': ['infernal', 'hell', 'fortress', 'dungeon'],

    // CR 21
    'ancient-black-dragon': ['swamp', 'ruins', 'dragon'],
    'ancient-copper-dragon': ['mountain', 'hills', 'dragon'],
    'lich': ['undead', 'haunted', 'ruins', 'dungeon', 'arcane', 'tower'],
    'solar': ['celestial', 'temple', 'holy', 'aerial'],

    // CR 22
    'ancient-bronze-dragon': ['coast', 'aquatic', 'dragon'],
    'ancient-green-dragon': ['forest', 'jungle', 'dragon'],

    // CR 23
    'ancient-blue-dragon': ['desert', 'mountain', 'dragon'],
    'ancient-silver-dragon': ['mountain', 'arctic', 'dragon'],
    'kraken': ['aquatic', 'underwater', 'deep-sea', 'eldritch'],

    // CR 24
    'ancient-gold-dragon': ['mountain', 'dragon', 'celestial'],
    'ancient-red-dragon': ['mountain', 'volcanic', 'dragon'],

    // CR 30
    'tarrasque': ['wasteland', 'apocalyptic', 'anywhere'],

    // CR 0.25
    'acolyte': ['urban', 'temple', 'anywhere'],
    'axe-beak': ['plains', 'wilderness', 'savanna'],
    'blink-dog': ['forest', 'wilderness', 'fey', 'nature'],
    'boar': ['forest', 'wilderness', 'plains'],
    'constrictor-snake': ['jungle', 'swamp', 'ruins', 'forest'],
    'draft-horse': ['urban', 'plains', 'anywhere'],
    'dretch': ['abyssal', 'chaos', 'dungeon', 'sewer'],
    'drow': ['underdark', 'cavern', 'ruins', 'dungeon'],
    'elk': ['forest', 'wilderness', 'plains', 'nature'],
    'flying-sword': ['dungeon', 'castle', 'ruins', 'construct', 'arcane'],
    'giant-badger': ['forest', 'wilderness', 'underground'],
    'giant-bat': ['cavern', 'dungeon', 'underdark', 'ruins'],
    'giant-centipede': ['jungle', 'swamp', 'cavern', 'dungeon'],
    'giant-frog': ['swamp', 'aquatic', 'forest'],
    'giant-lizard': ['desert', 'swamp', 'jungle'],
    'giant-owl': ['forest', 'wilderness', 'night', 'nature'],
    'giant-poisonous-snake': ['jungle', 'swamp', 'ruins', 'desert'],
    'giant-wolf-spider': ['forest', 'cavern', 'dungeon'],
    'goblin': ['dungeon', 'forest', 'ruins', 'cave', 'goblinoid'],
    'grimlock': ['underdark', 'cavern', 'dungeon'],
    'panther': ['jungle', 'forest', 'wilderness'],
    'pseudodragon': ['forest', 'wilderness', 'fey', 'dragon'],
    'riding-horse': ['urban', 'plains', 'anywhere'],
    'skeleton': ['haunted', 'undead', 'dungeon', 'ruins', 'tomb'],
    'sprite': ['forest', 'fey', 'woodland', 'nature'],
    'steam-mephit': ['elemental', 'volcanic', 'forge', 'laboratory'],
    'swarm-of-bats': ['cavern', 'dungeon', 'haunted', 'ruins'],
    'swarm-of-rats': ['urban', 'sewer', 'dungeon', 'ruins'],
    'swarm-of-ravens': ['haunted', 'ruins', 'ominous', 'night'],
    'violet-fungus': ['cavern', 'dungeon', 'underdark', 'fungal'],
    'wolf': ['forest', 'wilderness', 'mountain', 'arctic'],
    'zombie': ['haunted', 'undead', 'dungeon', 'ruins', 'graveyard'],

    // CR 0.5
    'ape': ['jungle', 'forest', 'wilderness'],
    'black-bear': ['forest', 'wilderness', 'mountain', 'nature'],
    'cockatrice': ['plains', 'wilderness', 'ruins'],
    'crocodile': ['swamp', 'aquatic', 'jungle'],
    'darkmantle': ['cavern', 'underdark', 'dungeon'],
    'deep-gnome-svirfneblin': ['underdark', 'cavern', 'mountain'],
    'dust-mephit': ['elemental', 'desert', 'ruins', 'dungeon'],
    'giant-goat': ['mountain', 'hills', 'wilderness'],
    'giant-sea-horse': ['aquatic', 'underwater', 'coast'],
    'giant-wasp': ['forest', 'wilderness', 'jungle', 'ruins'],
    'gnoll': ['plains', 'desert', 'wilderness', 'ruins'],
    'gray-ooze': ['dungeon', 'sewer', 'underdark', 'ooze'],
    'hobgoblin': ['fortress', 'dungeon', 'wilderness', 'goblinoid'],
    'ice-mephit': ['elemental', 'arctic', 'mountain'],
    'lizardfolk': ['swamp', 'jungle', 'aquatic'],
    'magma-mephit': ['elemental', 'volcanic', 'fire', 'underdark'],
    'magmin': ['elemental', 'volcanic', 'fire', 'forge'],
    'orc': ['wilderness', 'mountain', 'fortress', 'ruins'],
    'reef-shark': ['aquatic', 'underwater', 'coast'],
    'rust-monster': ['dungeon', 'underdark', 'ruins'],
    'sahuagin': ['aquatic', 'underwater', 'coast'],
    'satyr': ['forest', 'fey', 'woodland', 'nature'],
    'scout': ['wilderness', 'forest', 'anywhere'],
    'shadow': ['haunted', 'undead', 'ethereal', 'dungeon', 'ruins'],
    'swarm-of-beetles': ['forest', 'dungeon', 'ruins', 'jungle'],
    'swarm-of-centipedes': ['jungle', 'swamp', 'dungeon', 'ruins'],
    'swarm-of-insects': ['swamp', 'jungle', 'forest', 'ruins'],
    'swarm-of-spiders': ['forest', 'cavern', 'dungeon', 'ruins'],
    'swarm-of-wasps': ['forest', 'wilderness', 'jungle'],
    'thug': ['urban', 'ruins', 'anywhere'],
    'warhorse': ['urban', 'plains', 'fortress'],
    'warhorse-skeleton': ['haunted', 'undead', 'ruins', 'dungeon'],
    'worg': ['forest', 'wilderness', 'mountain', 'goblinoid'],

    // CR 0.125
    'bandit': ['wilderness', 'forest', 'ruins', 'urban'],
    'blood-hawk': ['plains', 'wilderness', 'mountain'],
    'camel': ['desert', 'plains'],
    'cultist': ['urban', 'dungeon', 'temple', 'ruins', 'cult'],
    'flying-snake': ['jungle', 'forest', 'ruins'],
    'giant-crab': ['aquatic', 'coast', 'beach'],
    'giant-rat': ['urban', 'sewer', 'dungeon', 'ruins'],
    'giant-rat-diseased': ['urban', 'sewer', 'dungeon', 'ruins'],
    'giant-weasel': ['forest', 'wilderness', 'arctic'],
    'guard': ['urban', 'fortress', 'anywhere'],
    'kobold': ['dungeon', 'cavern', 'ruins', 'dragon'],
    'mastiff': ['urban', 'wilderness', 'anywhere'],
    'merfolk': ['aquatic', 'underwater', 'coast'],
    'mule': ['urban', 'wilderness', 'anywhere'],
    'noble': ['urban', 'castle', 'manor'],
    'poisonous-snake': ['jungle', 'swamp', 'desert', 'ruins'],
    'pony': ['urban', 'plains', 'anywhere'],
    'stirge': ['swamp', 'cavern', 'ruins', 'dungeon'],
    'tribal-warrior': ['wilderness', 'forest', 'jungle', 'plains']
};

// Thematic encounter presets
const ENCOUNTER_THEMES = {
    'Haunted Manor': {
        tags: ['haunted', 'undead', 'manor', 'ethereal'],
        description: 'Ghostly encounters in an abandoned estate',
        environments: ['manor', 'urban', 'ruins']
    },
    'Foggy Mountains': {
        tags: ['mountain', 'aerial', 'wilderness'],
        description: 'Treacherous encounters in misty peaks',
        environments: ['mountain', 'hills', 'cavern']
    },
    'Dark Dungeon': {
        tags: ['dungeon', 'undead', 'construct', 'ooze'],
        description: 'Classic dungeon crawl encounters',
        environments: ['dungeon', 'ruins', 'underground']
    },
    'Enchanted Forest': {
        tags: ['forest', 'fey', 'nature', 'woodland'],
        description: 'Magical forest encounters',
        environments: ['forest', 'wilderness', 'jungle']
    },
    'Burning Wasteland': {
        tags: ['volcanic', 'fire', 'infernal', 'desert'],
        description: 'Fiery hellscape encounters',
        environments: ['volcanic', 'desert', 'wasteland']
    },
    'Frozen Tundra': {
        tags: ['arctic', 'wilderness', 'mountain'],
        description: 'Icy wilderness encounters',
        environments: ['arctic', 'mountain', 'wilderness']
    },
    'Fetid Swamp': {
        tags: ['swamp', 'aquatic', 'undead'],
        description: 'Murky swampland encounters',
        environments: ['swamp', 'jungle', 'aquatic']
    },
    'Cursed Graveyard': {
        tags: ['haunted', 'undead', 'tomb', 'graveyard'],
        description: 'Undead rising from their graves',
        environments: ['graveyard', 'ruins', 'haunted']
    },
    'Underwater Depths': {
        tags: ['aquatic', 'underwater', 'deep-sea'],
        description: 'Deep ocean encounters',
        environments: ['aquatic', 'underwater', 'coast']
    },
    'Abyssal Portal': {
        tags: ['abyssal', 'chaos', 'infernal'],
        description: 'Demonic incursions from the Abyss',
        environments: ['dungeon', 'wasteland', 'ruins']
    },
    'Infernal Citadel': {
        tags: ['infernal', 'hell', 'fortress'],
        description: 'Devilish encounters in a hellish fortress',
        environments: ['fortress', 'dungeon', 'castle']
    },
    'Ancient Ruins': {
        tags: ['ruins', 'undead', 'construct'],
        description: 'Forgotten places filled with guardians',
        environments: ['ruins', 'desert', 'jungle']
    },
    'Goblin Caves': {
        tags: ['goblinoid', 'cavern', 'dungeon'],
        description: 'Goblinoid lairs and cave systems',
        environments: ['cavern', 'dungeon', 'underground']
    },
    "Dragon's Lair": {
        tags: ['dragon', 'mountain', 'volcanic'],
        description: 'Draconic encounters and hoards',
        environments: ['mountain', 'cavern', 'volcanic']
    },
    'Underdark Expedition': {
        tags: ['underdark', 'aberration', 'drow'],
        description: 'Deep underground horrors',
        environments: ['underdark', 'cavern', 'fungal']
    },
    'Celestial Temple': {
        tags: ['celestial', 'temple', 'holy'],
        description: 'Divine and holy encounters',
        environments: ['temple', 'ruins', 'mountain']
    },
    "Wizard's Tower": {
        tags: ['arcane', 'laboratory', 'construct'],
        description: 'Magical experiments and constructs',
        environments: ['laboratory', 'tower', 'urban']
    },
    'Savage Wilderness': {
        tags: ['wilderness', 'nature', 'beast'],
        description: 'Natural predators and beasts',
        environments: ['wilderness', 'forest', 'plains']
    },
    'Coastal Voyage': {
        tags: ['coast', 'aquatic', 'aerial'],
        description: 'Seaside and sailing encounters',
        environments: ['coast', 'aquatic', 'beach']
    },
    'Eldritch Nightmare': {
        tags: ['eldritch', 'aberration', 'ethereal'],
        description: 'Mind-bending cosmic horrors',
        environments: ['underdark', 'dungeon', 'underwater']
    }
};

module.exports = { MONSTER_THEMES, ENCOUNTER_THEMES };
