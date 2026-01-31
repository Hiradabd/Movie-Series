// استفاده از داده‌های سریال (fallback وقتی series-data.js خالی است)
const FALLBACK_SERIES = [
    { title: "Game of Thrones", imdbCode: "tt0944947", titleType: "tvSeries", imdbVotes: "2,507,283", imdbRates: "9.2", genre: "فانتزی", softSub: { seasons: [{ name: "season 1", links: [{ quality: "1080p BluRay", url: "https://dls4.iran-gamecenter-host.com/DonyayeSerial/series2/tt0944947/SoftSub/S01/1080p.BluRay" }] }] }, dubbed: { seasons: [] } },
    { title: "Breaking Bad", imdbCode: "tt0903747", titleType: "tvSeries", imdbVotes: "2,436,286", imdbRates: "9.5", genre: "جنایی", softSub: { seasons: [{ name: "season 1", links: [{ quality: "1080p BluRay", url: "https://dls7.iran-gamecenter-host.com/DonyayeSerial/series2/tt0903747/SoftSub/S01/1080p.BluRay" }] }] }, dubbed: { seasons: [] } },
    { title: "Stranger Things", imdbCode: "tt4574334", titleType: "tvSeries", imdbVotes: "1,528,592", imdbRates: "8.6", genre: "علمی-تخیلی", softSub: { seasons: [{ name: "season 1", links: [{ quality: "1080p BluRay", url: "https://dls2.iran-gamecenter-host.com/DonyayeSerial/series/Stranger.Things/Soft.Sub/S01/1080p.BluRay" }] }] }, dubbed: { seasons: [] } },
    { title: "Friends", imdbCode: "tt0108778", titleType: "tvSeries", imdbVotes: "1,171,748", imdbRates: "8.9", genre: "کمدی", softSub: { seasons: [{ name: "season 1", links: [{ quality: "1080p BluRay", url: "https://dls2.iran-gamecenter-host.com/DonyayeSerial/series2/tt0108778/SoftSub/S01/1080p.BluRay" }] }] }, dubbed: { seasons: [] } },
    { title: "The Walking Dead", imdbCode: "tt1520211", titleType: "tvSeries", imdbVotes: "1,170,569", imdbRates: "8.1", genre: "ترسناک", softSub: { seasons: [{ name: "season 1", links: [{ quality: "1080p BluRay", url: "https://dls7.iran-gamecenter-host.com/DonyayeSerial/series2/tt1520211/SoftSub/S01/1080p.BluRay" }] }] }, dubbed: { seasons: [] } },
    { title: "Sherlock", imdbCode: "tt1475582", titleType: "tvSeries", imdbVotes: "1,071,001", imdbRates: "9.0", genre: "جنایی", softSub: { seasons: [{ name: "season 1", links: [{ quality: "1080p BluRay", url: "https://dls2.iran-gamecenter-host.com/DonyayeSerial/series/Sherlock/Soft.Sub/S01/720p.BluRay" }] }] }, dubbed: { seasons: [] } }
];
const seriesData = (typeof SERIES_DATA !== 'undefined' && SERIES_DATA.length > 0) ? SERIES_DATA : FALLBACK_SERIES;
const genres = typeof GENRES !== 'undefined' ? GENRES : ['همه', 'دراما', 'کمدی', 'جنایی', 'علمی-تخیلی', 'فانتزی', 'اکشن', 'ترسناک', 'انیمه'];

let currentGenre = 'همه';
let searchQuery = '';

// رندر تب‌های ژانر
function renderGenreTabs() {
    const container = document.getElementById('genre-tabs');
    if (!container) return;

    container.innerHTML = genres.map(genre => `
        <button class="genre-tab ${genre === currentGenre ? 'active' : ''}" data-genre="${genre}">
            ${genre}
        </button>
    `).join('');

    container.querySelectorAll('.genre-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentGenre = tab.dataset.genre;
            document.querySelectorAll('.genre-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderSeries();
        });
    });
}

// فیلتر سریال‌ها
function getFilteredSeries() {
    return seriesData.filter(series => {
        const matchGenre = currentGenre === 'همه' || series.genre === currentGenre;
        const matchSearch = !searchQuery || series.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchGenre && matchSearch;
    });
}

// رندر کارت سریال
function createSeriesCard(series) {
    const hasSoftSub = series.softSub?.seasons?.length > 0;
    const hasDubbed = series.dubbed?.seasons?.length > 0;
    const safeId = series.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');

    return `
        <article class="series-card" data-series-id="${safeId}">
            <div class="card-poster">
                <div class="poster-placeholder">
                    <span class="poster-initial">${series.title.charAt(0)}</span>
                    <div class="imdb-badge">
                        <span class="imdb-star">★</span>
                        <span>${series.imdbRates}</span>
                    </div>
                </div>
                <div class="card-overlay">
                    <button class="btn-details" data-series-id="${safeId}">
                        مشاهده لینک‌ها
                    </button>
                </div>
            </div>
            <div class="card-info">
                <h3 class="card-title">${series.title}</h3>
                <div class="card-meta">
                    <span class="meta-genre">${series.genre}</span>
                    <span class="meta-dot">•</span>
                    <span class="meta-votes">${series.imdbVotes} رأی</span>
                </div>
                <div class="card-badges">
                    ${hasSoftSub ? '<span class="badge badge-sub">زیرنویس</span>' : ''}
                    ${hasDubbed ? '<span class="badge badge-dub">دوبله</span>' : ''}
                </div>
            </div>
        </article>
    `;
}

// رندر مودال جزئیات
function renderSeriesModal(series) {
    const content = document.getElementById('modal-content');
    if (!content) return;

    const softSubHTML = (series.softSub?.seasons || []).map(season => `
        <div class="season-block">
            <h4>${season.name}</h4>
            <div class="quality-links">
                ${(season.links || []).map(link => `
                    <a href="${link.url}" target="_blank" rel="noopener" class="quality-link">${link.quality}</a>
                `).join('')}
            </div>
        </div>
    `).join('');

    const dubbedHTML = (series.dubbed?.seasons || []).map(season => `
        <div class="season-block">
            <h4>${season.name}</h4>
            <div class="quality-links">
                ${(season.links || []).map(link => `
                    <a href="${link.url}" target="_blank" rel="noopener" class="quality-link dubbed">${link.quality}</a>
                `).join('')}
            </div>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="modal-header">
            <h2>${series.title}</h2>
            <div class="modal-meta">
                <span class="imdb-badge-large">★ ${series.imdbRates}</span>
                <span>${series.imdbVotes} رأی</span>
                <span>${series.genre}</span>
            </div>
        </div>
        <div class="modal-body">
            ${softSubHTML ? `
            <section class="modal-section">
                <h3 class="section-title softsub">زیرنویس (SoftSub)</h3>
                ${softSubHTML}
            </section>
            ` : ''}
            ${dubbedHTML ? `
            <section class="modal-section">
                <h3 class="section-title dubbed">دوبله (Dubbed)</h3>
                ${dubbedHTML}
            </section>
            ` : ''}
        </div>
    `;
}

// رندر لیست سریال‌ها
function renderSeries() {
    const listEl = document.getElementById('series-list');
    const countEl = document.getElementById('series-count');
    const noResultsEl = document.getElementById('no-results');

    if (!listEl) return;

    const filtered = getFilteredSeries();

    if (countEl) {
        countEl.textContent = `${filtered.length} سریال`;
    }

    if (filtered.length === 0) {
        listEl.innerHTML = '';
        if (noResultsEl) noResultsEl.style.display = 'flex';
        return;
    }

    if (noResultsEl) noResultsEl.style.display = 'none';

    listEl.innerHTML = filtered.map(createSeriesCard).join('');

    listEl.querySelectorAll('.btn-details, .series-card').forEach(el => {
        el.addEventListener('click', (e) => {
            if (el.classList.contains('btn-details') || el.classList.contains('series-card')) {
                const card = el.closest('.series-card') || el;
                const id = card.dataset.seriesId;
                if (!id) return;
                const series = filtered.find(s => s.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') === id);
                if (series) {
                    openModal(series);
                }
            }
        });
    });
}

// باز کردن مودال
function openModal(series) {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('series-modal');
    if (overlay && modal) {
        renderSeriesModal(series);
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
}

// بستن مودال
function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }
}

// پخش آنلاین
document.getElementById('watchOnlineButton')?.addEventListener('click', function() {
    const url = prompt('لطفاً URL فیلم یا سریال را وارد کنید:');
    if (url) {
        window.open(`play.html?url=${encodeURIComponent(url)}`, '_blank');
    } else {
        alert('لطفاً یک URL معتبر وارد کنید.');
    }
});

// جستجو
document.getElementById('search')?.addEventListener('input', function() {
    searchQuery = this.value.trim();
    renderSeries();
});

// بستن مودال
document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('modal-overlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// جلوگیری از بستن مودال با کلیک روی محتوا
document.getElementById('series-modal')?.addEventListener('click', function(e) {
    e.stopPropagation();
});

// بارگذاری اولیه
document.addEventListener('DOMContentLoaded', function() {
    renderGenreTabs();
    renderSeries();
});
