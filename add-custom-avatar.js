// Helper script to add custom fantasy artwork to the avatar gallery
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const AVATARS_DIR = path.join(__dirname, 'public', 'images', 'avatars');
const CONFIG_PATH = path.join(__dirname, 'public', 'avatar-gallery.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

// Download file from URL
function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);

        protocol.get(url, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                fs.unlinkSync(filepath);
                return downloadFile(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
            }

            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                fs.unlink(filepath, () => {});
                reject(new Error(`Failed to download: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

async function addCustomAvatar() {
    console.log('\n🎨 Custom Fantasy Character Avatar Tool\n');
    console.log('📚 Free Fantasy Art Resources:');
    console.log('   • ArtStation (artstation.com) - Search "D&D character portrait"');
    console.log('   • Pinterest - Fantasy character art collections');
    console.log('   • DeviantArt - Fantasy portraits');
    console.log('   • Free D&D Token Makers: roll20.net/welcome');
    console.log('');

    const species = await question('Species (human/elf/dwarf/halfling/dragonborn/gnome/half-elf/half-orc/tiefling): ');
    const gender = await question('Gender (male/female/other): ');
    const variant = await question('Variant number (01-04): ');

    console.log('\nImage source options:');
    console.log('1. Enter URL to download image');
    console.log('2. Use local file path');

    const sourceType = await question('\nChoice (1 or 2): ');

    const filename = `${species}-${gender}-${variant}.png`;
    const filepath = path.join(AVATARS_DIR, filename);

    try {
        if (sourceType === '1') {
            const url = await question('Enter image URL: ');
            console.log('\n📥 Downloading image...');
            await downloadFile(url, filepath);
        } else {
            const localPath = await question('Enter local file path: ');
            console.log('\n📄 Copying image...');
            fs.copyFileSync(localPath, filepath);
        }

        // Update config
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

        if (!config[species]) {
            console.error(`❌ Species "${species}" not found in config`);
            rl.close();
            return;
        }

        if (!config[species].genders[gender]) {
            config[species].genders[gender] = [];
        }

        // Find and update or add the variant
        const existingIndex = config[species].genders[gender].findIndex(a => a.id === variant);
        const avatarEntry = {
            id: variant,
            path: `/images/avatars/${filename}`,
            style: 'custom',
            description: 'custom-artwork'
        };

        if (existingIndex >= 0) {
            config[species].genders[gender][existingIndex] = avatarEntry;
            console.log('✅ Updated existing avatar entry');
        } else {
            config[species].genders[gender].push(avatarEntry);
            console.log('✅ Added new avatar entry');
        }

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

        console.log('\n✨ Custom avatar added successfully!');
        console.log(`   Species: ${config[species].name}`);
        console.log(`   Gender: ${gender}`);
        console.log(`   File: ${filename}`);
        console.log('\n💡 Refresh your browser to see the new avatar!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }

    rl.close();
}

// Run the tool
addCustomAvatar();
