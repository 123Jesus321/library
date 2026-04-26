/** seriesId: общий id для книг одной серии; seriesOrder — порядок в серии; updatedAt — ISO для сортировки */
const books = [
    {
        id: "Бредни-Сумасшедшего",
        title: "Бредни Сумасшедшего",
        author: "Сумасшедший",
        pdf: "Бредни-Сумасшедшего.pdf",
        seriesId: null,
        seriesTitle: null,
        seriesOrder: null,
        updatedAt: "2025-08-12",
        tags: ["рассказы", "юмор"],
        coverImage: "Symashedsuy.jpg"
    },
    {
        id: "Зеронтар-_1_",
        title: "Зеронтар",
        author: "Конфетки Миллер",
        pdf: "Зеронтар-_1_.pdf",
        seriesId: "miller-azantir",
        seriesTitle: "Хроники Террианы",
        seriesOrder: 1,
        updatedAt: "2026-03-16",
        tags: ["фэнтези", "Терриана"],
        coverImage: null
    },
    {
        id: "Азантир-и-его-устройство-_2_",
        title: "Азантир и его устройство",
        author: "Конфетки Миллер",
        pdf: "Азантир-и-его-устройство-_2_.pdf",
        seriesId: "miller-azantir",
        seriesTitle: "Хроники Террианы",
        seriesOrder: 2,
        updatedAt: "2026-03-15",
        tags: ["фэнтези", "Терриана"],
        coverImage: null
    },
    {
        id: "Битва-за-Азантир-_1_",
        title: "Битва за Азантир",
        author: "Конфетки Миллер",
        pdf: "Битва-за-Азантир-_1_.pdf",
        seriesId: "miller-azantir",
        seriesTitle: "Хроники Террианы",
        seriesOrder: 3,
        updatedAt: "2026-03-19",
        tags: ["фэнтези", "Терриана", "битва"],
        coverImage: null
    },
    {
        id: "Сотворение",
        title: "Сотворение",
        author: "Конфетки Миллер",
        pdf: "Сотворение.pdf",
        seriesId: "miller-azantir",
        seriesTitle: "Хроники Террианы",
        seriesOrder: 4,
        updatedAt: "2026-03-22",
        tags: ["фэнтези", "Терриана"],
        coverImage: null
    },
    {
        id: "Cetus",
        title: "Cetus",
        author: "SomeBadHum",
        pdf: "Cetus.pdf",
        seriesId: "somebadhum-prose",
        seriesTitle: "Проза SomeBadHum",
        seriesOrder: 1,
        updatedAt: "2025-11-05",
        tags: ["проза", "sci-fi"],
        coverImage: null
    },
    {
        id: "Алая-вспышка",
        title: "Алая-вспышка",
        author: "Hedvik",
        pdf: "Алая-вспышка.pdf",
        seriesId: null,
        seriesTitle: null,
        seriesOrder: null,
        updatedAt: "2026-01-10",
        tags: ["проза", "драма"],
        coverImage: null
    },
    {
        id: "Виртуаль. Мир Хранителей",
        title: "Виртуаль. Мир Хранителей",
        author: "Вистериона",
        pdf: "VirtualWorldOfGuard.pdf",
        seriesId: "Virtual-ras",
        seriesTitle: 'Виртуаль',
        seriesOrder: 1,
        updatedAt: "26-04-25",
        tags: ["рассказы", "юмор"],
        coverImage: null
    },
    {
        id: "Сборник Стихотворений",
        title: "Сборник Стихотворений",
        author: "SomeBadHum",
        pdf: "Сборник-Стихов.pdf",
        seriesId: "somebadhum-prose",
        seriesTitle: "Проза SomeBadHum",
        seriesOrder: 2,
        updatedAt: "2025-12-22",
        tags: ["стихи", "проза"],
        coverImage: null
    }
];

/**
 * true — «общий» слой оценок: ключ RATING_GLOBAL_STORAGE_KEY + старт из BOOK_RATINGS_DEFAULT.
 * false — только личные оценки (RATING_STORAGE_KEY).
 * Одинаковые оценки у всех в интернете без сервера невозможны; задавайте BOOK_RATINGS_DEFAULT и перезаливайте сайт.
 */
const USE_GLOBAL_BOOK_RATINGS = true;

/** При USE_GLOBAL_BOOK_RATINGS: стартовые значения 1–5; 0 — нет оценки (правьте здесь «витринные» общие звёзды). */
const BOOK_RATINGS_DEFAULT = {
    "Бредни-Сумасшедшего": 4,
    "Зеронтар-_1_": 5,
    "Азантир-и-его-устройство-_2_": 4,
    "Битва-за-Азантир-_1_": 5,
    Сотворение: 4,
    Cetus: 4,
    "Алая-вспышка": 3,
    "Сборник Стихотворений": 4
};

/** Кнопка загрузки обложки (data URL в localStorage). */
const ALLOW_LOCAL_COVER_UPLOAD = true;

const MAX_COVER_FILE_BYTES = 2.5 * 1024 * 1024;

const BG_THEME_STORAGE_KEY = "knigi-bg-theme-v1";

const BG_THEMES = [
    { id: "crimson-violet", label: "Рубиновая туманность" },
    { id: "blue-violet", label: "Полночный сапфир" },
    { id: "gold-crimson", label: "Янтарный закат" },
    { id: "red-black", label: "Киноварь и ночь" },
    { id: "emerald-abyss", label: "Изумрудная бездна" },
    { id: "sunset-orchid", label: "Орхидея на закате" },
    { id: "arctic-plum", label: "Ледяная слива" },
    { id: "noir-teal", label: "Нуар и бирюза" },
    { id: "wine-midnight", label: "Вино и полночь" },
    { id: "obsidian-dawn", label: "Обсидиан и заря" },
    { id: "taiga-night", label: "Тайга в ночи" },
    { id: "aurora-void", label: "Северное сияние" },
    { id: "graphite-fuchsia", label: "Графит и фуксия" },
    { id: "copper-eclipse", label: "Медное затмение" }
];

/** Только применяет тему к странице; сохранение — в settings-ui.js (единый объект настроек). */
function applyBgTheme(themeId) {
    const valid = BG_THEMES.some((t) => t.id === themeId);
    const id = valid ? themeId : "crimson-violet";
    document.body.dataset.bgTheme = id;
    const sel = document.getElementById("settings-bg-theme");
    if (sel) {
        sel.value = id;
    }
}

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/** На ПК страница PDF визуально уже (окно просмотра без изменений), текст мельче */
const DESKTOP_PDF_WIDTH_FACTOR = 0.72;
const MOBILE_LAYOUT_MAX = 640;

const RATING_STORAGE_KEY = "knigi-book-ratings-v1";
const RATING_GLOBAL_STORAGE_KEY = "knigi-book-ratings-global-v1";
const RATING_MIGRATE_DONE_KEY = "knigi-ratings-migrated-personal-to-global-v1";

/** Один раз переносит оценки из личного ключа в общий, если общий пуст (после включения USE_GLOBAL_BOOK_RATINGS). */
function migratePersonalRatingsToGlobalOnce() {
    if (!USE_GLOBAL_BOOK_RATINGS) {
        return;
    }
    try {
        if (localStorage.getItem(RATING_MIGRATE_DONE_KEY)) {
            return;
        }
        const rawG = localStorage.getItem(RATING_GLOBAL_STORAGE_KEY);
        if (rawG && rawG !== "{}" && rawG.trim() !== "") {
            try {
                const o = JSON.parse(rawG);
                if (o && typeof o === "object" && Object.keys(o).length > 0) {
                    localStorage.setItem(RATING_MIGRATE_DONE_KEY, "1");
                    return;
                }
            } catch {
                /* continue */
            }
        }
        const rawP = localStorage.getItem(RATING_STORAGE_KEY);
        if (rawP && rawP !== "{}") {
            localStorage.setItem(RATING_GLOBAL_STORAGE_KEY, rawP);
        }
        localStorage.setItem(RATING_MIGRATE_DONE_KEY, "1");
    } catch {
        /* ignore */
    }
}
const COVER_STORAGE_KEY = "knigi-book-covers-v1";

function isDesktopReader() {
    return window.matchMedia(`(min-width: ${MOBILE_LAYOUT_MAX + 1}px)`).matches;
}

function isMobileReader() {
    return window.matchMedia(`(max-width: ${MOBILE_LAYOUT_MAX}px)`).matches;
}

function formatDateRu(iso) {
    if (!iso) {
        return "—";
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return String(iso);
    }
    return d.toLocaleDateString("ru-RU", { year: "numeric", month: "short", day: "numeric" });
}

function getFilterState() {
    const qEl = document.getElementById("filter-q");
    const authorEl = document.getElementById("filter-author");
    const seriesEl = document.getElementById("filter-series");
    const tagEl = document.getElementById("filter-tag");
    const sortEl = document.getElementById("filter-sort");
    return {
        q: (qEl && qEl.value ? qEl.value : "").trim(),
        author: authorEl ? authorEl.value : "",
        series: seriesEl ? seriesEl.value : "",
        tag: tagEl ? tagEl.value : "",
        sort: sortEl && sortEl.value ? sortEl.value : "updated-desc"
    };
}

function getBookTags(book) {
    const t = book.tags;
    if (!Array.isArray(t)) {
        return [];
    }
    return t
        .map((x) => String(x).trim())
        .filter(Boolean)
        .slice(0, 7);
}

function getFilteredBooks() {
    let list = books.slice();
    const { q, author, series, tag, sort } = getFilterState();
    const ql = q.toLowerCase();
    if (ql) {
        list = list.filter((b) => b.title.toLowerCase().includes(ql));
    }
    if (author) {
        list = list.filter((b) => b.author === author);
    }
    if (series === "__none__") {
        list = list.filter((b) => !b.seriesId);
    } else if (series) {
        list = list.filter((b) => b.seriesId === series);
    }
    if (tag === "__none__") {
        list = list.filter((b) => getBookTags(b).length === 0);
    } else if (tag) {
        list = list.filter((b) => getBookTags(b).includes(tag));
    }

    const dateMs = (b) => {
        const t = Date.parse(b.updatedAt || "");
        return Number.isNaN(t) ? 0 : t;
    };

    switch (sort) {
        case "updated-asc":
            list.sort((a, b) => dateMs(a) - dateMs(b));
            break;
        case "title-asc":
            list.sort((a, b) => a.title.localeCompare(b.title, "ru"));
            break;
        case "title-desc":
            list.sort((a, b) => b.title.localeCompare(a.title, "ru"));
            break;
        case "author-asc":
            list.sort(
                (a, b) => a.author.localeCompare(b.author, "ru") || a.title.localeCompare(b.title, "ru")
            );
            break;
        case "updated-desc":
        default:
            list.sort((a, b) => dateMs(b) - dateMs(a));
    }
    return list;
}

function populateFilterOptions() {
    const authorSel = document.getElementById("filter-author");
    const seriesSel = document.getElementById("filter-series");
    const tagSel = document.getElementById("filter-tag");
    if (!authorSel || !seriesSel || !tagSel) {
        return;
    }

    const authors = [...new Set(books.map((b) => b.author))].sort((a, b) => a.localeCompare(b, "ru"));
    const savedAuthor = authorSel.value;
    authorSel.innerHTML =
        `<option value="">Все авторы</option>` +
        authors.map((a) => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`).join("");
    if (authors.includes(savedAuthor)) {
        authorSel.value = savedAuthor;
    }

    const seriesMap = new Map();
    books.forEach((b) => {
        if (b.seriesId && b.seriesTitle) {
            seriesMap.set(b.seriesId, b.seriesTitle);
        }
    });
    const savedSeries = seriesSel.value;
    let seriesHtml = `<option value="">Все книги</option><option value="__none__">Без серии</option>`;
    [...seriesMap.entries()]
        .sort((x, y) => x[1].localeCompare(y[1], "ru"))
        .forEach(([id, title]) => {
            seriesHtml += `<option value="${escapeAttr(id)}">${escapeHtml(title)}</option>`;
        });
    seriesSel.innerHTML = seriesHtml;
    const allowed = new Set(["", "__none__", ...seriesMap.keys()]);
    if (allowed.has(savedSeries)) {
        seriesSel.value = savedSeries;
    }

    const tagSet = new Set();
    books.forEach((b) => {
        getBookTags(b).forEach((t) => tagSet.add(t));
    });
    const savedTag = tagSel.value;
    let tagHtml = `<option value="">Все теги</option><option value="__none__">Без тегов</option>`;
    [...tagSet].sort((a, b) => a.localeCompare(b, "ru")).forEach((t) => {
        tagHtml += `<option value="${escapeAttr(t)}">${escapeHtml(t)}</option>`;
    });
    tagSel.innerHTML = tagHtml;
    const tagAllowed = new Set(["", "__none__", ...tagSet]);
    if (tagAllowed.has(savedTag)) {
        tagSel.value = savedTag;
    }
}

let libraryFiltersBound = false;

function bindLibraryFilters() {
    const q = document.getElementById("filter-q");
    const author = document.getElementById("filter-author");
    const series = document.getElementById("filter-series");
    const tag = document.getElementById("filter-tag");
    const sort = document.getElementById("filter-sort");
    if (!q && !author) {
        return;
    }
    populateFilterOptions();
    if (libraryFiltersBound) {
        return;
    }
    libraryFiltersBound = true;

    const rerender = () => renderLibrary();
    [q, author, series, tag, sort].forEach((el) => {
        if (!el) {
            return;
        }
        el.addEventListener("change", rerender);
        if (el === q) {
            el.addEventListener("input", rerender);
        }
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function getRatingStorageKey() {
    return USE_GLOBAL_BOOK_RATINGS ? RATING_GLOBAL_STORAGE_KEY : RATING_STORAGE_KEY;
}

function loadRatingsMap(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) {
            return {};
        }
        const o = JSON.parse(raw);
        return typeof o === "object" && o !== null ? o : {};
    } catch {
        return {};
    }
}

function saveRatingsMap(key, obj) {
    try {
        localStorage.setItem(key, JSON.stringify(obj));
    } catch {
        /* ignore */
    }
}

function getBookRating(bookId) {
    let map;
    if (USE_GLOBAL_BOOK_RATINGS) {
        map = { ...BOOK_RATINGS_DEFAULT, ...loadRatingsMap(getRatingStorageKey()) };
    } else {
        map = loadRatingsMap(RATING_STORAGE_KEY);
    }
    const n = Number(map[bookId]);
    if (n >= 1 && n <= 5) {
        return n;
    }
    return 0;
}

const RATINGS_TABLE = "library_book_ratings";
const DEVICE_ID_KEY = "knigi-device-id-v1";
let ratingsServerAvg = {};
let ratingsReady = false;
let ratingsFetchPromise = null;
let ratingsInited = false;

function getSupabaseCfg() {
    return window.LIBRARY_CHAT_SUPABASE || null;
}

function ensureDeviceId() {
    try {
        let id = localStorage.getItem(DEVICE_ID_KEY);
        if (id) {
            return id;
        }
        id =
            (window.crypto && window.crypto.randomUUID && window.crypto.randomUUID()) ||
            `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem(DEVICE_ID_KEY, id);
        return id;
    } catch {
        return `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
}

function getBookRatingSummary(bookId) {
    if (ratingsReady && ratingsServerAvg[bookId]) {
        const r = ratingsServerAvg[bookId];
        return {
            avg: r.avg,
            votes: r.votes
        };
    }
    const own = getBookRating(bookId);
    return {
        avg: own,
        votes: own > 0 ? 1 : 0
    };
}

async function fetchRatingsFromServer() {
    const cfg = getSupabaseCfg();
    if (!cfg || !cfg.url || !cfg.anonKey) {
        ratingsReady = false;
        return;
    }
    const baseUrl = String(cfg.url).replace(/\/$/, "");
    const q = `${baseUrl}/rest/v1/${RATINGS_TABLE}?select=book_id,rating`;
    const res = await fetch(q, {
        headers: {
            apikey: cfg.anonKey,
            Authorization: `Bearer ${cfg.anonKey}`,
            Accept: "application/json"
        }
    });
    if (!res.ok) {
        throw new Error(`ratings ${res.status}`);
    }
    const rows = await res.json();
    const agg = {};
    if (Array.isArray(rows)) {
        rows.forEach((row) => {
            const id = String(row.book_id || "");
            const n = Number(row.rating);
            if (!id || !(n >= 1 && n <= 5)) {
                return;
            }
            if (!agg[id]) {
                agg[id] = { sum: 0, votes: 0 };
            }
            agg[id].sum += n;
            agg[id].votes += 1;
        });
    }
    const map = {};
    Object.keys(agg).forEach((id) => {
        map[id] = {
            avg: Math.round((agg[id].sum / agg[id].votes) * 10) / 10,
            votes: agg[id].votes
        };
    });
    ratingsServerAvg = map;
    ratingsReady = true;
}

function ensureRatingsLoaded() {
    if (ratingsFetchPromise) {
        return ratingsFetchPromise;
    }
    ratingsFetchPromise = fetchRatingsFromServer()
        .catch(() => {
            ratingsReady = false;
        })
        .finally(() => {
            ratingsFetchPromise = null;
        });
    return ratingsFetchPromise;
}

async function pushRatingToServer(bookId, stars) {
    const cfg = getSupabaseCfg();
    if (!cfg || !cfg.url || !cfg.anonKey) {
        return;
    }
    const baseUrl = String(cfg.url).replace(/\/$/, "");
    const deviceId = ensureDeviceId();
    const payload = [
        {
            book_id: String(bookId),
            rating: Math.max(1, Math.min(5, Math.round(Number(stars)))),
            device_id: deviceId
        }
    ];
    const res = await fetch(
        `${baseUrl}/rest/v1/${RATINGS_TABLE}?on_conflict=book_id,device_id`,
        {
            method: "POST",
            headers: {
                apikey: cfg.anonKey,
                Authorization: `Bearer ${cfg.anonKey}`,
                "Content-Type": "application/json",
                Prefer: "resolution=merge-duplicates,return=minimal"
            },
            body: JSON.stringify(payload)
        }
    );
    if (!res.ok) {
        throw new Error(`vote ${res.status}`);
    }
}

function setBookRating(bookId, stars) {
    const val = Math.max(1, Math.min(5, Math.round(Number(stars))));
    const key = getRatingStorageKey();
    const cur = loadRatingsMap(key);
    cur[bookId] = val;
    saveRatingsMap(key, cur);
}

function loadCoverMap() {
    try {
        const raw = localStorage.getItem(COVER_STORAGE_KEY);
        if (!raw) {
            return {};
        }
        const o = JSON.parse(raw);
        return typeof o === "object" && o !== null ? o : {};
    } catch {
        return {};
    }
}

function saveCoverMap(obj) {
    try {
        localStorage.setItem(COVER_STORAGE_KEY, JSON.stringify(obj));
    } catch {
        /* ignore */
    }
}

function getBookCoverUrl(book) {
    const map = loadCoverMap();
    const fromStore = map[book.id];
    if (typeof fromStore === "string" && fromStore.startsWith("data:")) {
        return fromStore;
    }
    if (book.coverImage && String(book.coverImage).trim()) {
        return String(book.coverImage).trim();
    }
    return "";
}

function coverSrcForHtml(url) {
    if (!url) {
        return "";
    }
    if (url.startsWith("data:")) {
        return url;
    }
    return escapeAttr(url);
}

function renderBookCoverBlock(book) {
    const url = getBookCoverUrl(book);
    const hasImg = Boolean(url);
    const imgTag = hasImg
        ? `<img src="${coverSrcForHtml(url)}" alt="" loading="lazy" decoding="async">`
        : "";
    const uploadBlock = ALLOW_LOCAL_COVER_UPLOAD
        ? `<div class="book-cover-upload-wrap">
            <button type="button" class="book-cover-upload-btn" data-cover-action="pick" aria-label="Загрузить изображение обложки">Обложка</button>
            <input type="file" class="book-cover-file" accept="image/*" tabindex="-1" aria-hidden="true">
        </div>`
        : "";
    return `<div class="book-cover${hasImg ? " has-image" : ""}">
            ${imgTag}
            <span class="book-cover-fallback">${escapeHtml(book.title)}<br>${escapeHtml(book.author)}</span>
            ${uploadBlock}
        </div>`;
}

function renderStarButtons(bookId, current, idPrefix) {
    let html = "";
    for (let v = 1; v <= 5; v += 1) {
        const on = v <= current ? " is-on" : "";
        html += `<button type="button" class="star-btn${on}" data-book-id="${escapeAttr(
            bookId
        )}" data-value="${v}" aria-label="${v} из 5" id="${idPrefix}-star-${v}">★</button>`;
    }
    return html;
}

let libraryGridUiBound = false;

function bindLibraryGridUi() {
    const grid = document.getElementById("book-grid");
    if (!grid || libraryGridUiBound) {
        return;
    }
    libraryGridUiBound = true;
    grid.addEventListener("click", (e) => {
        const pickBtn = e.target.closest(".book-cover-upload-btn");
        if (pickBtn && grid.contains(pickBtn)) {
            e.preventDefault();
            e.stopPropagation();
            const wrap = pickBtn.closest(".book-cover-upload-wrap");
            const input = wrap && wrap.querySelector(".book-cover-file");
            if (input) {
                input.click();
            }
            return;
        }
        const btn = e.target.closest(".star-btn");
        if (!btn || !grid.contains(btn)) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const bookId = btn.getAttribute("data-book-id");
        const value = Number(btn.dataset.value);
        if (!bookId || value < 1 || value > 5) {
            return;
        }
        setBookRating(bookId, value);
        renderLibrary();
        pushRatingToServer(bookId, value)
            .then(() => ensureRatingsLoaded())
            .then(() => renderLibrary())
            .catch(() => {});
    });
    grid.addEventListener("change", (e) => {
        const input = e.target.closest(".book-cover-file");
        if (!input || !grid.contains(input)) {
            return;
        }
        const tile = input.closest(".book-tile");
        const bookId = tile && tile.getAttribute("data-book-id");
        const file = input.files && input.files[0];
        input.value = "";
        if (!bookId || !file || !file.type.startsWith("image/")) {
            return;
        }
        if (file.size > MAX_COVER_FILE_BYTES) {
            window.alert(`Файл слишком большой (макс. ${Math.round(MAX_COVER_FILE_BYTES / 1024 / 1024)} МБ).`);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = typeof reader.result === "string" ? reader.result : "";
            if (!dataUrl.startsWith("data:")) {
                return;
            }
            const map = loadCoverMap();
            map[bookId] = dataUrl;
            saveCoverMap(map);
            renderLibrary();
        };
        reader.readAsDataURL(file);
    });
}

function renderLibrary() {
    const grid = document.getElementById("book-grid");
    if (!grid) {
        return;
    }

    const list = getFilteredBooks();
    const emptyEl = document.getElementById("library-empty");
    if (emptyEl) {
        emptyEl.hidden = list.length > 0;
    }

    grid.innerHTML = list
        .map((book, idx) => {
            const rating = getBookRating(book.id);
            const summary = getBookRatingSummary(book.id);
            const href = `reader.html?book=${encodeURIComponent(book.id)}`;
            const prefix = `lib-${idx}`;
            const seriesChip = book.seriesTitle
                ? `<span class="book-series-chip">${escapeHtml(book.seriesTitle)}</span>`
                : "";
            const tagList = getBookTags(book);
            const tagsRow =
                tagList.length > 0
                    ? `<div class="book-tags-row">${tagList
                          .map((t) => `<span class="book-tag-chip">${escapeHtml(t)}</span>`)
                          .join("")}</div>`
                    : "";
            return `
            <article class="book-tile" data-book-id="${escapeAttr(book.id)}">
                <a class="book-card" href="${href}">
                    ${renderBookCoverBlock(book)}
                    <div class="book-info">
                        <h2>${escapeHtml(book.title)}</h2>
                        <p>${escapeHtml(book.author)}</p>
                        ${tagsRow}
                        <div class="book-meta-line">
                            <span class="book-updated">${escapeHtml(formatDateRu(book.updatedAt))}</span>
                            ${seriesChip}
                        </div>
                    </div>
                </a>
                <div class="book-rating-bar">
                    <span>${USE_GLOBAL_BOOK_RATINGS ? "Общая оценка:" : "Оценка:"}</span>
                    <div class="star-rating" role="group" aria-label="${USE_GLOBAL_BOOK_RATINGS ? "Общая оценка" : "Оценка"} книги «${escapeHtml(
                        book.title
                    )}»">
                        ${renderStarButtons(book.id, rating, prefix)}
                    </div>
                    <span>${summary.avg > 0 ? `${summary.avg} (${summary.votes})` : "—"}</span>
                </div>
            </article>
        `;
        })
        .join("");

    bindLibraryGridUi();
}

function isPdfFile(url) {
    return /\.pdf$/i.test(url || "");
}

let pdfJsPromise = null;
function ensurePdfJs() {
    if (window.pdfjsLib) {
        return Promise.resolve();
    }
    if (pdfJsPromise) {
        return pdfJsPromise;
    }
    pdfJsPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = PDFJS_CDN;
        s.async = true;
        s.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
            resolve();
        };
        s.onerror = () => reject(new Error("Не удалось загрузить PDF.js"));
        document.head.appendChild(s);
    });
    return pdfJsPromise;
}

let readerState = {
    book: null,
    pdfDoc: null,
    pageNum: 1,
    renderTask: null,
    loadToken: 0,
    swipeX: null,
    pagerBound: false,
    resizeTimer: null,
    keyBound: false,
    fullscreenBound: false,
    readerRatingBound: false
};

function getReaderEls() {
    return {
        frame: document.getElementById("reader-frame"),
        title: document.getElementById("reader-title"),
        wrap: document.getElementById("reader-frame-wrap"),
        pdfView: document.getElementById("pdf-view"),
        viewport: document.getElementById("pdf-viewport"),
        canvas: document.getElementById("pdf-canvas"),
        err: document.getElementById("pdf-error"),
        prev: document.getElementById("pdf-prev"),
        next: document.getElementById("pdf-next"),
        label: document.getElementById("pdf-page-label")
    };
}

function cleanupPdfDocAndTask() {
    if (readerState.renderTask && readerState.renderTask.cancel) {
        try {
            readerState.renderTask.cancel();
        } catch (_) {
            /* ignore */
        }
    }
    readerState.renderTask = null;
    if (readerState.pdfDoc && readerState.pdfDoc.destroy) {
        readerState.pdfDoc.destroy().catch(() => {});
    }
    readerState.pdfDoc = null;
    readerState.pageNum = 1;
}

/** Новая генерация загрузки — отменяет все await в прошлой сессии */
function abortPdfSession() {
    readerState.loadToken += 1;
    cleanupPdfDocAndTask();
}

function setPdfError(message) {
    const { err, canvas } = getReaderEls();
    if (err) {
        err.textContent = message;
        err.hidden = false;
    }
    if (canvas) {
        canvas.style.visibility = "hidden";
    }
}

function clearPdfError() {
    const { err, canvas } = getReaderEls();
    if (err) {
        err.hidden = true;
        err.textContent = "";
    }
    if (canvas) {
        canvas.style.visibility = "visible";
    }
}

function updatePagerUi() {
    const { prev, next, label } = getReaderEls();
    const doc = readerState.pdfDoc;
    const n = readerState.pageNum;
    const total = doc ? doc.numPages : 0;
    if (label) {
        label.textContent = doc ? `${n} / ${total}` : "—";
    }
    if (prev) {
        prev.disabled = !doc || n <= 1;
    }
    if (next) {
        next.disabled = !doc || n >= total;
    }
}

async function renderPdfPage() {
    const { viewport: vpEl, canvas } = getReaderEls();
    const doc = readerState.pdfDoc;
    if (!doc || !vpEl || !canvas) {
        return;
    }

    clearPdfError();
    const page = await doc.getPage(readerState.pageNum);
    const ctx = canvas.getContext("2d", { alpha: false });
    const usableW = Math.max(1, vpEl.clientWidth - 16);
    const cssW = isDesktopReader()
        ? Math.max(1, Math.floor(usableW * DESKTOP_PDF_WIDTH_FACTOR))
        : usableW;
    const base = page.getViewport({ scale: 1 });
    const scale = cssW / base.width;
    const viewport = page.getViewport({ scale });
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

    if (readerState.renderTask && readerState.renderTask.cancel) {
        try {
            readerState.renderTask.cancel();
        } catch (_) {
            /* ignore */
        }
    }

    const task = page.render({
        canvasContext: ctx,
        viewport,
        transform
    });
    readerState.renderTask = task;

    try {
        await task.promise;
    } catch (e) {
        if (e && e.name === "RenderingCancelledException") {
            return;
        }
        throw e;
    } finally {
        if (readerState.renderTask === task) {
            readerState.renderTask = null;
        }
    }

    updatePagerUi();
}

function goPdfPage(delta) {
    const doc = readerState.pdfDoc;
    if (!doc) {
        return;
    }
    const next = readerState.pageNum + delta;
    if (next < 1 || next > doc.numPages) {
        return;
    }
    readerState.pageNum = next;
    renderPdfPage().catch((e) => {
        setPdfError(e.message || "Ошибка отрисовки страницы");
    });
    const { viewport } = getReaderEls();
    if (viewport) {
        viewport.scrollTop = 0;
    }
}

function bindPdfPagerOnce() {
    if (readerState.pagerBound) {
        return;
    }
    const { prev, next, viewport } = getReaderEls();
    if (prev) {
        prev.addEventListener("click", () => goPdfPage(-1));
    }
    if (next) {
        next.addEventListener("click", () => goPdfPage(1));
    }
    if (viewport) {
        viewport.addEventListener(
            "touchstart",
            (e) => {
                if (e.changedTouches.length) {
                    readerState.swipeX = e.changedTouches[0].screenX;
                }
            },
            { passive: true }
        );
        viewport.addEventListener(
            "touchend",
            (e) => {
                if (readerState.swipeX == null || !e.changedTouches.length) {
                    return;
                }
                const dx = e.changedTouches[0].screenX - readerState.swipeX;
                readerState.swipeX = null;
                if (dx < -48) {
                    goPdfPage(1);
                } else if (dx > 48) {
                    goPdfPage(-1);
                }
            },
            { passive: true }
        );
    }
    if (!readerState.keyBound) {
        window.addEventListener("keydown", (e) => {
            if (!readerState.pdfDoc) {
                return;
            }
            if (e.key === "ArrowLeft" || e.key === "PageUp") {
                e.preventDefault();
                goPdfPage(-1);
            } else if (e.key === "ArrowRight" || e.key === "PageDown") {
                e.preventDefault();
                goPdfPage(1);
            }
        });
        readerState.keyBound = true;
    }
    readerState.pagerBound = true;
}

async function startPdfWithJs(url) {
    const token = ++readerState.loadToken;
    bindPdfPagerOnce();
    clearPdfError();
    updatePagerUi();

    try {
        await ensurePdfJs();
    } catch (e) {
        if (token !== readerState.loadToken) {
            return;
        }
        setPdfError("Нет сети или заблокирован скрипт PDF. Откройте страницу через локальный сервер или проверьте интернет.");
        throw e;
    }

    if (token !== readerState.loadToken) {
        return;
    }

    cleanupPdfDocAndTask();
    readerState.pageNum = 1;

    const loadingTask = window.pdfjsLib.getDocument({ url });
    let doc;
    try {
        doc = await loadingTask.promise;
    } catch (e) {
        if (token !== readerState.loadToken) {
            return;
        }
        const msg =
            e && e.message
                ? e.message
                : "Не удалось открыть PDF (часто из‑за открытия файла с диска — используйте простой локальный сервер).";
        setPdfError(msg);
        updatePagerUi();
        return;
    }

    if (token !== readerState.loadToken) {
        doc.destroy().catch(() => {});
        return;
    }

    readerState.pdfDoc = doc;
    readerState.pageNum = 1;
    await renderPdfPage();
}

function applyIframeMode(url) {
    const { frame, pdfView, wrap } = getReaderEls();
    abortPdfSession();
    if (pdfView) {
        pdfView.hidden = true;
    }
    if (frame) {
        frame.style.display = "";
        frame.src = url;
    }
    if (wrap) {
        wrap.classList.remove("reader-frame-wrap--canvas");
    }
}

/** PDF через canvas на всех устройствах: iframe на ПК часто пустой (file://, политики браузера). */
function applyPdfCanvasMode(url) {
    const { frame, pdfView, wrap } = getReaderEls();
    if (frame) {
        frame.style.display = "none";
        frame.removeAttribute("src");
    }
    if (pdfView) {
        pdfView.hidden = false;
    }
    if (wrap) {
        wrap.classList.add("reader-frame-wrap--canvas");
    }
    startPdfWithJs(url).catch(() => {
        applyIframeMode(url);
    });
}

function applyReaderLayout() {
    const { title } = getReaderEls();
    const book = readerState.book;
    if (!book || !title) {
        return;
    }

    title.textContent = `${book.title} — ${book.author}`;
    const url = book.pdf;

    if (isPdfFile(url)) {
        applyPdfCanvasMode(url);
    } else {
        applyIframeMode(url);
    }
}

function scheduleResizeRerender() {
    if (!readerState.book || !readerState.pdfDoc || !isPdfFile(readerState.book.pdf)) {
        return;
    }
    clearTimeout(readerState.resizeTimer);
    readerState.resizeTimer = setTimeout(() => {
        renderPdfPage().catch(() => {});
    }, 150);
}

function onReaderViewportChange() {
    if (!readerState.book) {
        return;
    }
    scheduleResizeRerender();
}

function initReaderRatingUi() {
    const row = document.getElementById("reader-rating-row");
    const container = document.getElementById("reader-star-rating");
    if (!row || !container || !readerState.book || readerState.readerRatingBound) {
        return;
    }
    readerState.readerRatingBound = true;

    const labelEl = row.querySelector(".reader-rating-label");
    if (labelEl) {
        labelEl.textContent = USE_GLOBAL_BOOK_RATINGS ? "Общая оценка:" : "Ваша оценка:";
    }

    const paint = () => {
        const r = getBookRating(readerState.book.id);
        const summary = getBookRatingSummary(readerState.book.id);
        container.innerHTML = renderStarButtons(readerState.book.id, r, "reader");
        if (labelEl) {
            labelEl.textContent =
                summary.avg > 0
                    ? `Общая оценка: ${summary.avg} (${summary.votes})`
                    : USE_GLOBAL_BOOK_RATINGS
                      ? "Общая оценка:"
                      : "Ваша оценка:";
        }
        container.querySelectorAll(".star-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const v = Number(btn.dataset.value);
                setBookRating(readerState.book.id, v);
                paint();
                const grid = document.getElementById("book-grid");
                if (grid) {
                    renderLibrary();
                }
                pushRatingToServer(readerState.book.id, v)
                    .then(() => ensureRatingsLoaded())
                    .then(() => {
                        paint();
                        if (grid) {
                            renderLibrary();
                        }
                    })
                    .catch(() => {});
            });
        });
    };

    row.hidden = false;
    paint();
}

function bindFullscreenControls() {
    const btn = document.getElementById("reader-fullscreen-btn");
    const wrap = document.getElementById("reader-frame-wrap");
    const closeBtn = document.getElementById("reader-pseudo-fs-close");
    const settingsFab = document.getElementById("settings-fab");
    if (!btn || !wrap || readerState.fullscreenBound) {
        return;
    }
    readerState.fullscreenBound = true;

    const isApiFullscreen = () =>
        !!(document.fullscreenElement || document.webkitFullscreenElement);
    const isPseudoFullscreen = () => wrap.classList.contains("reader-frame-wrap--pseudo-fs");
    const isAnyFullscreen = () => isApiFullscreen() || isPseudoFullscreen();

    function exitPseudoFullscreen() {
        wrap.classList.remove("reader-frame-wrap--pseudo-fs");
        document.body.classList.remove("reader-fs-pseudo-active");
        if (closeBtn) {
            closeBtn.hidden = true;
        }
    }

    function enterPseudoFullscreen() {
        wrap.classList.add("reader-frame-wrap--pseudo-fs");
        document.body.classList.add("reader-fs-pseudo-active");
        if (closeBtn) {
            closeBtn.hidden = false;
        }
    }

    async function exitApiFullscreen() {
        if (document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    const syncLabel = () => {
        const on = isAnyFullscreen();
        document.body.classList.toggle("reader-fs-active", on);
        if (on) {
            btn.textContent = "⛶ Выйти из полного экрана";
            btn.title = "Выйти из полноэкранного режима";
        } else {
            btn.textContent = "⛶ Полный экран";
            btn.title = isMobileReader()
                ? "На весь экран (без ограничений Safari)"
                : "Развернуть область чтения";
        }
        if (closeBtn) {
            closeBtn.hidden = !isAnyFullscreen();
        }
        if (settingsFab) {
            settingsFab.hidden = isAnyFullscreen();
        }
    };

    btn.addEventListener("click", async () => {
        if (isAnyFullscreen()) {
            await exitApiFullscreen();
            exitPseudoFullscreen();
            syncLabel();
            scheduleResizeRerender();
            return;
        }

        if (isMobileReader() || !wrap.requestFullscreen) {
            enterPseudoFullscreen();
            syncLabel();
            scheduleResizeRerender();
            return;
        }

        try {
            if (wrap.requestFullscreen) {
                await wrap.requestFullscreen();
            } else if (wrap.webkitRequestFullscreen) {
                wrap.webkitRequestFullscreen();
            } else {
                throw new Error("no-fs");
            }
        } catch {
            enterPseudoFullscreen();
        }
        syncLabel();
        scheduleResizeRerender();
    });

    closeBtn?.addEventListener("click", () => {
        exitPseudoFullscreen();
        exitApiFullscreen().catch(() => {});
        syncLabel();
        scheduleResizeRerender();
    });

    document.addEventListener("fullscreenchange", () => {
        syncLabel();
        scheduleResizeRerender();
    });
    document.addEventListener("webkitfullscreenchange", () => {
        syncLabel();
        scheduleResizeRerender();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") {
            return;
        }
        if (!isAnyFullscreen()) {
            return;
        }
        exitApiFullscreen().catch(() => {});
        exitPseudoFullscreen();
        syncLabel();
        scheduleResizeRerender();
    });

    syncLabel();
}

function initReaderSeriesNav() {
    const nav = document.getElementById("reader-series-bar");
    if (!nav || !readerState.book) {
        return;
    }
    const sid = readerState.book.seriesId;
    if (!sid) {
        nav.hidden = true;
        nav.innerHTML = "";
        return;
    }
    const siblings = books
        .filter((b) => b.seriesId === sid)
        .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
    if (siblings.length < 2) {
        nav.hidden = true;
        nav.innerHTML = "";
        return;
    }
    const st = readerState.book.seriesTitle || "Серия";
    const items = siblings
        .map((b) => {
            const active = b.id === readerState.book.id;
            const href = `reader.html?book=${encodeURIComponent(b.id)}`;
            return `<li${active ? ' class="is-current"' : ""}><a href="${href}">${escapeHtml(
                b.title
            )}</a></li>`;
        })
        .join("");
    nav.innerHTML = `<p class="reader-series-title">${escapeHtml(st)}</p><ul class="reader-series-list">${items}</ul>`;
    nav.hidden = false;
}

function renderReader() {
    const { title } = getReaderEls();
    if (!title) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("book");
    readerState.book = books.find((b) => b.id === bookId) || books[0];

    applyReaderLayout();
    initReaderRatingUi();
    initReaderSeriesNav();
    bindFullscreenControls();

    window.addEventListener("resize", onReaderViewportChange);
    window.addEventListener("orientationchange", onReaderViewportChange);
}

window.applyKnigiBgTheme = applyBgTheme;
window.KnigiBG_THEMES = BG_THEMES;

migratePersonalRatingsToGlobalOnce();
if (!ratingsInited) {
    ratingsInited = true;
    ensureRatingsLoaded()
        .then(() => {
            renderLibrary();
            if (readerState.book) {
                initReaderRatingUi();
            }
        })
        .catch(() => {});
}
bindLibraryFilters();
renderLibrary();
renderReader();
