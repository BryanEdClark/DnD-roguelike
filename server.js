const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { MONSTER_THEMES, ENCOUNTER_THEMES } = require('./monster-themes');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8347;
const SRD_API_BASE = 'https://www.dnd5eapi.co/api';
const CACHE_DIR = path.join(__dirname, 'cache');
const MONSTERS_CACHE_FILE = path.join(CACHE_DIR, 'monsters-full.json');
const IMAGES_DIR = path.join(__dirname, 'public', 'images', 'monsters');
const AVATARS_DIR = path.join(__dirname, 'public', 'images', 'avatars');
const ACCOUNTS_FILE = path.join(CACHE_DIR, 'accounts.json');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, AVATARS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/cache', express.static('cache'));

// In-memory cache
let monstersCache = null;

// Combat map sessions (rooms)
const mapSessions = new Map(); // sessionId -> { tiles, walls, users: Set }

// Generate unique session ID
function generateSessionId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Add theme tags to a monster
function addMonsterTags(monster) {
    const tags = MONSTER_THEMES[monster.index] || [];
    return { ...monster, tags };
}

// Enrich all monsters with tags
function enrichMonstersWithTags(monstersData) {
    const enrichedMonsters = {};
    for (const [index, monster] of Object.entries(monstersData.monsters)) {
        enrichedMonsters[index] = addMonsterTags(monster);
    }
    return {
        ...monstersData,
        monsters: enrichedMonsters
    };
}

// Download image from URL and save locally
async function downloadImage(imageUrl, filename) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imagePath = path.join(IMAGES_DIR, filename);
        await fs.writeFile(imagePath, response.data);
        return `/images/monsters/${filename}`;
    } catch (error) {
        console.error(`  ⚠️  Failed to download image ${filename}:`, error.message);
        return null;
    }
}

// Load or fetch all monster data with caching
async function loadMonstersCache() {
    try {
        // Try to load from cache file first
        try {
            const cacheData = await fs.readFile(MONSTERS_CACHE_FILE, 'utf-8');
            monstersCache = JSON.parse(cacheData);
            // Enrich with tags
            monstersCache = enrichMonstersWithTags(monstersCache);
            console.log(`✅ Loaded ${Object.keys(monstersCache.monsters).length} monsters from cache`);
            return;
        } catch (error) {
            console.log('📦 Cache not found, fetching from API...');
        }

        // Fetch monster list from API
        console.log('📡 Fetching monster list from D&D 5e SRD API...');
        const listResponse = await axios.get(`${SRD_API_BASE}/monsters`);
        const monsterList = listResponse.data.results;

        console.log(`📥 Fetching full data for ${monsterList.length} monsters...`);

        // Fetch all monster details
        const monsters = {};
        let count = 0;

        for (const m of monsterList) {
            try {
                const response = await axios.get(`${SRD_API_BASE}/monsters/${m.index}`);
                const monsterData = response.data;

                // Download and cache image if it exists
                if (monsterData.image) {
                    const imageExtension = path.extname(monsterData.image) || '.png';
                    const imageFilename = `${m.index}${imageExtension}`;
                    const imageUrl = `https://www.dnd5eapi.co${monsterData.image}`;

                    const localImagePath = await downloadImage(imageUrl, imageFilename);
                    if (localImagePath) {
                        monsterData.imageUrl = localImagePath;
                    }
                }

                monsters[m.index] = addMonsterTags(monsterData);
                count++;

                if (count % 50 === 0) {
                    console.log(`  ... ${count}/${monsterList.length} monsters cached`);
                }
            } catch (error) {
                console.error(`  ❌ Failed to fetch ${m.name}:`, error.message);
            }
        }

        monstersCache = {
            monsters,
            metadata: {
                cached_at: new Date().toISOString(),
                total_monsters: count,
                source: 'D&D 5e SRD API (dnd5eapi.co)',
                license: 'Open Gaming License'
            }
        };

        // Save to cache file
        await fs.writeFile(MONSTERS_CACHE_FILE, JSON.stringify(monstersCache, null, 2));
        console.log(`✅ Cached ${count} monsters to ${MONSTERS_CACHE_FILE}`);

    } catch (error) {
        console.error('❌ Error loading monsters:', error.message);
        throw error;
    }
}

// Get monster from cache
function getCachedMonster(indexOrName) {
    const input = indexOrName.toLowerCase();

    // Try by index first
    if (monstersCache.monsters[input]) {
        return monstersCache.monsters[input];
    }

    // Try by name
    const monsterEntry = Object.values(monstersCache.monsters).find(m =>
        m.name.toLowerCase() === input
    );

    return monsterEntry || null;
}

// Calculate ability modifier
function getModifier(score) {
    return Math.floor((score - 10) / 2);
}

// Format modifier with + or -
function formatModifier(score) {
    const mod = getModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

// API endpoint to get monster data
app.get('/api/monster/:indexOrName', async (req, res) => {
    try {
        const monsterData = getCachedMonster(req.params.indexOrName);

        if (!monsterData) {
            return res.status(404).json({ error: 'Monster not found' });
        }

        res.json(monsterData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get all monsters list with CR grouping
app.get('/api/monsters', async (req, res) => {
    try {
        const allMonsters = Object.values(monstersCache.monsters);

        // Extract summary data and group by CR
        const monstersByCR = {};

        allMonsters.forEach(monster => {
            const cr = monster.challenge_rating.toString();
            if (!monstersByCR[cr]) {
                monstersByCR[cr] = [];
            }
            monstersByCR[cr].push({
                name: monster.name,
                index: monster.index,
                cr: monster.challenge_rating,
                type: monster.type,
                size: monster.size,
                imageUrl: monster.imageUrl,
                tags: monster.tags || []
            });
        });

        res.json({
            monsters_by_cr: monstersByCR,
            metadata: monstersCache.metadata
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get encounter themes
app.get('/api/encounter-themes', (req, res) => {
    res.json(ENCOUNTER_THEMES);
});

// Account Management API Endpoints

// Load accounts from file
async function loadAccounts() {
    try {
        const data = await fs.readFile(ACCOUNTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // File doesn't exist yet, return empty array
        return [];
    }
}

// Save accounts to file
async function saveAccounts(accounts) {
    await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}

// Get all accounts
app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await loadAccounts();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new account
app.post('/api/accounts', async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Account name is required' });
        }

        const accounts = await loadAccounts();

        // Check if account exists
        if (accounts.some(acc => acc.name === name)) {
            return res.status(409).json({ error: 'Account already exists' });
        }

        const newAccount = {
            name,
            hasPassword: password && password.length > 0,
            password: password || '',
            data: {
                character: {},
                counters: [],
                feats: []
            }
        };

        accounts.push(newAccount);
        await saveAccounts(accounts);

        res.status(201).json(newAccount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single account
app.get('/api/accounts/:name', async (req, res) => {
    try {
        const accounts = await loadAccounts();
        const account = accounts.find(acc => acc.name === req.params.name);

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update account data
app.put('/api/accounts/:name', async (req, res) => {
    try {
        const accounts = await loadAccounts();
        const accountIndex = accounts.findIndex(acc => acc.name === req.params.name);

        if (accountIndex === -1) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Update account data
        accounts[accountIndex].data = req.body.data;
        await saveAccounts(accounts);

        res.json(accounts[accountIndex]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete account
app.delete('/api/accounts/:name', async (req, res) => {
    try {
        const accounts = await loadAccounts();
        const filteredAccounts = accounts.filter(acc => acc.name !== req.params.name);

        if (accounts.length === filteredAccounts.length) {
            return res.status(404).json({ error: 'Account not found' });
        }

        await saveAccounts(filteredAccounts);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save dice configurations
app.post('/api/save-dice-configs', async (req, res) => {
    try {
        const { accountName, diceConfigs } = req.body;

        if (!accountName) {
            return res.status(400).json({ error: 'Account name is required' });
        }

        const accounts = await loadAccounts();
        const account = accounts.find(acc => acc.name === accountName);

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Save dice configurations to account data
        if (!account.data) {
            account.data = {};
        }
        account.data.diceConfigs = diceConfigs;

        await saveAccounts(accounts);
        res.json({ message: 'Dice configurations saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get dice configurations
app.get('/api/get-dice-configs', async (req, res) => {
    try {
        const { accountName } = req.query;

        if (!accountName) {
            return res.status(400).json({ error: 'Account name is required' });
        }

        const accounts = await loadAccounts();
        const account = accounts.find(acc => acc.name === accountName);

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const diceConfigs = account.data?.diceConfigs || [];
        res.json({ diceConfigs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save encounters
app.post('/api/save-encounters', async (req, res) => {
    try {
        const { accountName, encounters } = req.body;

        if (!accountName) {
            return res.status(400).json({ error: 'Account name is required' });
        }

        const accounts = await loadAccounts();
        const account = accounts.find(acc => acc.name === accountName);

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Save encounters to account data
        if (!account.data) {
            account.data = {};
        }
        account.data.encounters = encounters;

        await saveAccounts(accounts);
        res.json({ message: 'Encounters saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get encounters
app.get('/api/get-encounters', async (req, res) => {
    try {
        const { accountName } = req.query;

        if (!accountName) {
            return res.status(400).json({ error: 'Account name is required' });
        }

        const accounts = await loadAccounts();
        const account = accounts.find(acc => acc.name === accountName);

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const encounters = account.data?.encounters || [];
        res.json({ encounters });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload avatar image
app.post('/api/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const avatarPath = `/images/avatars/${req.file.filename}`;
        res.json({
            success: true,
            avatarUrl: avatarPath,
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get list of monster images
app.get('/api/monster-images', async (req, res) => {
    try {
        const files = await fs.readdir(IMAGES_DIR);
        const imageFiles = files.filter(file =>
            /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
        );
        res.json({ images: imageFiles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get list of avatar images
app.get('/api/avatar-images', async (req, res) => {
    try {
        const files = await fs.readdir(AVATARS_DIR);
        const imageFiles = files.filter(file =>
            /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
        );
        res.json({ images: imageFiles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ensure Admin account exists
async function ensureAdminAccount() {
    try {
        const accounts = await loadAccounts();

        // Check if Admin account exists
        if (!accounts.some(acc => acc.name === 'Admin')) {
            // Create Admin account
            const adminAccount = {
                name: 'Admin',
                hasPassword: false,
                password: '',
                data: {
                    character: {},
                    counters: [],
                    feats: [],
                    equipment: [],
                    savedEncounters: [],
                    monsterLibrary: [],
                    spells: [],
                    customCharacters: []
                }
            };

            accounts.push(adminAccount);
            await saveAccounts(accounts);
            console.log('✅ Admin account created');
        }
    } catch (error) {
        console.error('Error ensuring Admin account:', error);
    }
}

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    let currentSession = null;

    // Create new map session
    socket.on('createSession', (callback) => {
        const sessionId = generateSessionId();
        mapSessions.set(sessionId, {
            tiles: [],
            walls: [],
            users: new Set([socket.id])
        });
        currentSession = sessionId;
        socket.join(sessionId);
        console.log(`Session created: ${sessionId}`);
        callback({ sessionId });
    });

    // Join existing map session
    socket.on('joinSession', (sessionId, callback) => {
        const session = mapSessions.get(sessionId);
        if (session) {
            session.users.add(socket.id);
            currentSession = sessionId;
            socket.join(sessionId);
            console.log(`User ${socket.id} joined session: ${sessionId}`);
            callback({
                success: true,
                tiles: session.tiles,
                walls: session.walls
            });
            // Notify others that someone joined
            socket.to(sessionId).emit('userJoined', { userId: socket.id });
        } else {
            callback({ success: false, error: 'Session not found' });
        }
    });

    // Sync tile placement
    socket.on('addTile', (data) => {
        if (currentSession) {
            const session = mapSessions.get(currentSession);
            if (session) {
                session.tiles.push(data.tile);
                socket.to(currentSession).emit('tileAdded', data);
            }
        }
    });

    // Sync tile removal
    socket.on('removeTile', (data) => {
        if (currentSession) {
            const session = mapSessions.get(currentSession);
            if (session) {
                session.tiles = session.tiles.filter(t => t.id !== data.tileId);
                socket.to(currentSession).emit('tileRemoved', data);
            }
        }
    });

    // Sync tile update
    socket.on('updateTile', (data) => {
        if (currentSession) {
            const session = mapSessions.get(currentSession);
            if (session) {
                const index = session.tiles.findIndex(t => t.id === data.tile.id);
                if (index !== -1) {
                    session.tiles[index] = data.tile;
                }
                socket.to(currentSession).emit('tileUpdated', data);
            }
        }
    });

    // Sync walls
    socket.on('addWall', (data) => {
        if (currentSession) {
            const session = mapSessions.get(currentSession);
            if (session) {
                if (!session.walls.includes(data.wallKey)) {
                    session.walls.push(data.wallKey);
                }
                socket.to(currentSession).emit('wallAdded', data);
            }
        }
    });

    socket.on('removeWall', (data) => {
        if (currentSession) {
            const session = mapSessions.get(currentSession);
            if (session) {
                session.walls = session.walls.filter(w => w !== data.wallKey);
                socket.to(currentSession).emit('wallRemoved', data);
            }
        }
    });

    socket.on('clearWalls', () => {
        if (currentSession) {
            const session = mapSessions.get(currentSession);
            if (session) {
                session.walls = [];
                socket.to(currentSession).emit('wallsCleared');
            }
        }
    });

    socket.on('clearTiles', () => {
        if (currentSession) {
            const session = mapSessions.get(currentSession);
            if (session) {
                session.tiles = [];
                socket.to(currentSession).emit('tilesCleared');
            }
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        if (currentSession) {
            const session = mapSessions.get(currentSession);
            if (session) {
                session.users.delete(socket.id);
                // Clean up empty sessions
                if (session.users.size === 0) {
                    mapSessions.delete(currentSession);
                    console.log(`Session ${currentSession} deleted (no users)`);
                } else {
                    socket.to(currentSession).emit('userLeft', { userId: socket.id });
                }
            }
        }
    });
});

// Start server
async function startServer() {
    await loadMonstersCache();
    await ensureAdminAccount();
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🐉 D&D Monster Viewer running at http://localhost:${PORT}`);
        console.log(`📚 Cached ${monstersCache.metadata.total_monsters} monsters`);
        console.log(`📜 License: ${monstersCache.metadata.license}`);
        console.log(`🌐 WebSocket server ready for multiplayer maps\n`);
    });
}

startServer();
