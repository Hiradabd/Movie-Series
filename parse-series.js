/**
 * Parser script - استخراج سریال‌ها از فایل HTML
 * 
 * نحوه استفاده:
 * 1. محتوای خام سریال‌ها را (قسمت‌هایی که با <h3>1. نام سریال</h3> شروع می‌شوند)
 *    در فایل series-raw.html قرار دهید
 * 2. دستور زیر را اجرا کنید: node parse-series.js
 * 3. خروجی در series-data.js ذخیره می‌شود
 * 
 * اگر series-raw.html وجود نداشته باشد، از index.html استفاده می‌کند.
 */
const fs = require('fs');
const path = require('path');

// اولویت: series.txt > series-raw.html > index.html
const seriesTxtPath = path.join(__dirname, 'series.txt');
const rawPath = path.join(__dirname, 'series-raw.html');
const indexPath = path.join(__dirname, 'index.html');
const htmlPath = fs.existsSync(seriesTxtPath) ? seriesTxtPath : (fs.existsSync(rawPath) ? rawPath : indexPath);
const html = fs.readFileSync(htmlPath, 'utf-8');

// Genre mapping for known series (based on IMDb/common knowledge)
const genreMap = {
    'Game of Thrones': 'فانتزی',
    'Breaking Bad': 'جنایی',
    'Stranger Things': 'علمی-تخیلی',
    'Friends': 'کمدی',
    'The Walking Dead': 'ترسناک',
    'Sherlock': 'جنایی',
    'Chernobyl': 'دراما',
    'The Big Bang Theory': 'کمدی',
    'Dexter': 'جنایی',
    'The Boys': 'اکشن',
    'The Office': 'کمدی',
    'Better Call Saul': 'جنایی',
    'How I Met Your Mother': 'کمدی',
    'Peaky Blinders': 'دراما',
    'True Detective': 'جنایی',
    'Squid Game': 'دراما',
    'Black Mirror': 'علمی-تخیلی',
    'The Last of Us': 'علمی-تخیلی',
    'Rick and Morty': 'کمدی',
    'Attack on Titan': 'انیمه',
    'Lost': 'علمی-تخیلی',
    'Prison Break': 'اکشن',
    'The Queen\'s Gambit': 'دراما',
    'The Mandalorian': 'علمی-تخیلی',
    'Vikings': 'دراما',
    'The Witcher': 'فانتزی',
    'Money Heist': 'اکشن',
    'Band of Brothers': 'دراما',
    'House': 'دراما',
    'The Sopranos': 'جنایی',
    'House of Cards': 'دراما',
    'Westworld': 'علمی-تخیلی',
    'Modern Family': 'کمدی',
    'Suits': 'دراما',
    'Supernatural': 'فانتزی',
    'Daredevil': 'اکشن',
    'Dark': 'علمی-تخیلی',
    'Narcos': 'جنایی',
    'House of the Dragon': 'فانتزی',
    'Wednesday': 'کمدی',
    'The Simpsons': 'کمدی',
    'Loki': 'علمی-تخیلی',
    'Arrow': 'اکشن',
    'Fargo': 'جنایی',
    'Mr. Robot': 'دراما',
    'Death Note': 'انیمه',
    'South Park': 'کمدی',
    'The Lord of the Rings: The Rings of Power': 'فانتزی',
    'Avatar: The Last Airbender': 'انیمه',
    'Ted Lasso': 'کمدی',
    'Arcane': 'انیمه',
    'The Wire': 'جنایی',
    'WandaVision': 'علمی-تخیلی',
    'Brooklyn Nine-Nine': 'کمدی',
    'Sex Education': 'کمدی',
    'Mindhunter': 'جنایی',
    'Lucifer': 'فانتزی',
    'Family Guy': 'کمدی',
    'Ozark': 'جنایی',
    'The Flash': 'اکشن',
    'Seinfeld': 'کمدی',
    'The Vampire Diaries': 'فانتزی',
    'Homeland': 'دراما',
    'Grey\'s Anatomy': 'دراما',
    'American Horror Story': 'ترسناک',
    'Severance': 'علمی-تخیلی',
    'You': 'دراما',
    'Sons of Anarchy': 'دراما',
    'Fallout': 'علمی-تخیلی',
    'Arrested Development': 'کمدی',
    'Succession': 'دراما',
    '13 Reasons Why': 'دراما',
    'One Piece': 'انیمه',
    'Orange Is the New Black': 'دراما',
    'Shameless': 'کمدی',
    'The Haunting of Hill House': 'ترسناک',
    'The Umbrella Academy': 'علمی-تخیلی',
    'Parks and Recreation': 'کمدی',
    'Community': 'کمدی',
    'The White Lotus': 'دراما',
    'Moon Knight': 'اکشن',
    'Hannibal': 'جنایی',
    'The 100': 'علمی-تخیلی',
    'Firefly': 'علمی-تخیلی',
    'The Bear': 'کمدی',
    'The Blacklist': 'جنایی'
};

// Keywords for genre detection
const genreKeywords = {
    'انیمه': ['anime', 'one piece', 'naruto', 'death note', 'attack on titan', 'avatar', 'arcane', 'demon slayer', 'jujutsu', 'dragon ball'],
    'کمدی': ['comedy', 'family', 'office', 'friends', 'big bang', 'how i met', 'parks and', 'community', 'brooklyn', 'ted lasso', 'seinfeld', 'simpsons', 'south park', 'shameless', 'arrested', 'bear'],
    'جنایی': ['breaking bad', 'sherlock', 'dexter', 'sopranos', 'narcos', 'mindhunter', 'wire', 'ozark', 'better call saul', 'fargo', 'hannibal', 'blacklist'],
    'علمی-تخیلی': ['stranger', 'black mirror', 'westworld', 'dark', 'mandalorian', 'lost', 'witcher', '100', 'firefly', 'fallout', 'severance', 'umbrella academy', 'loki', 'wandavision'],
    'فانتزی': ['game of thrones', 'house of the dragon', 'supernatural', 'vampire', 'lucifer', 'lord of the rings', 'witcher'],
    'اکشن': ['boys', 'prison break', 'money heist', 'daredevil', 'arrow', 'flash', 'shield'],
    'دراما': ['chernobyl', 'peaky', 'true detective', 'squid game', 'queen\'s gambit', 'house', 'suits', 'homeland', 'grey', 'succession', 'you', 'sons of anarchy', 'orange is', 'white lotus', 'mr. robot', 'band of brothers'],
    'ترسناک': ['walking dead', 'american horror', 'haunting', 'horror']
};

function getGenre(title) {
    const t = title.toLowerCase();
    if (genreMap[title]) return genreMap[title];
    for (const [genre, keywords] of Object.entries(genreKeywords)) {
        if (keywords.some(kw => t.includes(kw))) return genre;
    }
    return 'سایر';
}

function parseLinks(html) {
    const links = [];
    const linkRegex = /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let m;
    while ((m = linkRegex.exec(html)) !== null) {
        links.push({ quality: m[2].trim(), url: m[1] });
    }
    return links;
}

function parseSeasons(html, startMarker) {
    const seasons = [];
    const parts = html.split(startMarker);
    if (parts.length < 2) return seasons;
    
    const content = parts[1].split(/<p style="color:#339966|<p style="color:#ff0000|<\/body>|<\/html>/)[0];
    const seasonRegex = /<p>season\s+(\d+)<\/p>\s*<p>([\s\S]*?)<\/p>/gi;
    let m;
    while ((m = seasonRegex.exec(content)) !== null) {
        const links = parseLinks(m[2]);
        if (links.length > 0) {
            seasons.push({
                name: `season ${m[1]}`,
                links: links
            });
        }
    }
    // Alternative pattern for some series
    const altParts = content.split(/<p>season\s+(\d+)<\/p>/gi);
    for (let i = 1; i < altParts.length; i += 2) {
        const seasonNum = altParts[i].trim();
        const linkHtml = altParts[i + 1] || '';
        const links = parseLinks(linkHtml);
        if (links.length > 0 && !seasons.some(s => s.name === `season ${seasonNum}`)) {
            seasons.push({ name: `season ${seasonNum}`, links });
        }
    }
    return seasons;
}

// Split by series blocks
const seriesBlocks = html.split(/(?=<h3>\d+\.)/).filter(b => b.includes('<h3>'));

const allSeries = [];

for (const block of seriesBlocks) {
    const titleMatch = block.match(/<h3>\d+\.\s*(.+?)<\/h3>/);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();
    const imdbMatch = block.match(/IMDb Code:<\/b>\s*([^<\s]+)/);
    const titleTypeMatch = block.match(/Title Type:<\/b>\s*([^<\s]+)/);
    const votesMatch = block.match(/IMDb Votes:<\/b>\s*([\d,]+)/);
    const ratesMatch = block.match(/IMDb Rates:<\/b>\s*([\d.]+)/);

    const imdbCode = imdbMatch ? imdbMatch[1].replace(/<\/?[^>]+>/g, '') : '';
    const titleType = (titleTypeMatch ? titleTypeMatch[1] : 'tvSeries').replace(/<\/?[^>]+>/g, '');
    const imdbVotes = votesMatch ? votesMatch[1] : '0';
    const imdbRates = ratesMatch ? ratesMatch[1] : '0';

    // Parse SoftSub
    let softSubSeasons = [];
    const softSubMatch = block.match(/<p[^>]*color:#ff0000[^>]*>[\s\S]*?<b>SoftSub<\/b><\/p>([\s\S]*?)(?=<p[^>]*color:#339966|<p[^>]*color:#ff0000|$)/i);
    if (softSubMatch) {
        const softContent = softSubMatch[1];
        const seasonMatches = softContent.matchAll(/<p>season\s+(\d+)<\/p>\s*<p>([\s\S]*?)<\/p>/gi);
        for (const sm of seasonMatches) {
            const links = parseLinks(sm[2]);
            if (links.length > 0) {
                softSubSeasons.push({ name: `season ${sm[1]}`, links });
            }
        }
    }

    // Parse Dubbed
    let dubbedSeasons = [];
    const dubbedMatch = block.match(/<p[^>]*color:#339966[^>]*>[\s\S]*?<b>Dubbed<\/b><\/p>([\s\S]*?)(?=<hr>|<h3>|$)/i);
    if (dubbedMatch) {
        const dubContent = dubbedMatch[1];
        const seasonMatches = dubContent.matchAll(/<p>season\s+(\d+)<\/p>\s*<p>([\s\S]*?)<\/p>/gi);
        for (const sm of seasonMatches) {
            const links = parseLinks(sm[2]);
            if (links.length > 0) {
                dubbedSeasons.push({ name: `season ${sm[1]}`, links });
            }
        }
    }

    // Ensure we have at least empty arrays
    if (softSubSeasons.length === 0 && dubbedSeasons.length === 0) continue;

    const genre = getGenre(title);

    allSeries.push({
        title,
        imdbCode,
        titleType,
        imdbVotes,
        imdbRates,
        genre,
        softSub: { seasons: softSubSeasons },
        dubbed: { seasons: dubbedSeasons }
    });
}

console.log(`Parsed ${allSeries.length} series`);

// Write to series-data.js
const output = `// Auto-generated series data - ${allSeries.length} series
// Generated by parse-series.js

const SERIES_DATA = ${JSON.stringify(allSeries, null, 0)};

// Genre categories for UI
const GENRES = ["همه", "دراما", "کمدی", "جنایی", "علمی-تخیلی", "فانتزی", "اکشن", "ترسناک", "انیمه", "سایر"];
`;

fs.writeFileSync(path.join(__dirname, 'series-data.js'), output, 'utf-8');
console.log('Saved to series-data.js');
