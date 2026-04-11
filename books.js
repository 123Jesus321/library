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
        updatedAt: "2025-08-12"
    },
    {
        id: "Зеронтар-_1_",
        title: "Зеронтар",
        author: "Конфетки Миллер",
        pdf: "Зеронтар-_1_.pdf",
        seriesId: "miller-azantir",
        seriesTitle: "Хроники Террианы",
        seriesOrder: 1,
        updatedAt: "2026-03-16"
    },
    {
        id: "Азантир-и-его-устройство-_2_",
        title: "Азантир и его устройство",
        author: "Конфетки Миллер",
        pdf: "Азантир-и-его-устройство-_2_.pdf",
        seriesId: "miller-azantir",
        seriesTitle: "Хроники Террианы",
        seriesOrder: 2,
        updatedAt: "2026-03-15"
    },
    {
        id: "Битва-за-Азантир-_1_",
        title: "Битва за Азантир",
        author: "Конфетки Миллер",
        pdf: "Битва-за-Азантир-_1_.pdf",
        seriesId: "miller-azantir",
        seriesTitle: "Хроники Террианы",
        seriesOrder: 3,
        updatedAt: "2026-03-19"
    },
    {
        id: "Сотворение",
        title: "Сотворение",
        author: "Конфетки Миллер",
        pdf: "Сотворение.pdf",
        seriesId: "miller-azantir",
        seriesTitle: "Хроники Террианы",
        seriesOrder: 4,
        updatedAt: "2026-03-22"
    },
    {
        id: "Cetus",
        title: "Cetus",
        author: "SomeBadHum",
        pdf: "Cetus.pdf",
        seriesId: "somebadhum-prose",
        seriesTitle: "Проза SomeBadHum",
        seriesOrder: 1,
        updatedAt: "2025-11-05"
    },
    {
        id: "Алая-вспышка",
        title: "Алая-вспышка",
        author: "Hedvik",
        pdf: "Алая-вспышка.pdf",
        seriesId: null,
        seriesTitle: null,
        seriesOrder: null,
        updatedAt: "2026-01-10"
    },
    {
        id: "Сборник Стихотворений",
        title: "Сборник Стихотворений",
        author: "SomeBadHum",
        pdf: "Сборник-Стихов.pdf",
        seriesId: "somebadhum-prose",
        seriesTitle: "Проза SomeBadHum",
        seriesOrder: 2,
        updatedAt: "2025-12-22"
    }
];

const BG_THEME_STORAGE_KEY = "knigi-bg-theme-v1";

const BG_THEMES = [
    { id: "crimson-violet", label: "Красно-фиолетовый" },
    { id: "blue-violet", label: "Сине-фиолетовый" },
    { id: "gold-crimson", label: "Золотисто-красный" },
    { id: "red-black", label: "Красно-чёрный" },
    { id: "emerald-abyss", label: "Изумрудная ночь" },
    { id: "sunset-orchid", label: "Закат и орхидея" },
    { id: "arctic-plum", label: "Ледяная слива" }
];

function applyBgTheme(themeId) {
    const valid = BG_THEMES.some((t) => t.id === themeId);
    const id = valid ? themeId : "crimson-violet";
    document.body.dataset.bgTheme = id;
    try {
        localStorage.setItem(BG_THEME_STORAGE_KEY, id);
    } catch {
        /* ignore */
    }
    const sel = document.getElementById("bg-theme-select");
    if (sel) {
        sel.value = id;
    }
}

function initBgThemeSwitcher() {
    let saved = null;
    try {
        saved = localStorage.getItem(BG_THEME_STORAGE_KEY);
    } catch {
        saved = null;
    }
    const initial = saved && BG_THEMES.some((t) => t.id === saved) ? saved : "crimson-violet";

    const sel = document.getElementById("bg-theme-select");
    if (sel) {
        BG_THEMES.forEach((t) => {
            const o = document.createElement("option");
            o.value = t.id;
            o.textContent = t.label;
            sel.appendChild(o);
        });
        sel.addEventListener("change", () => applyBgTheme(sel.value));
    }
    applyBgTheme(initial);
}

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/** На ПК страница PDF визуально уже (окно просмотра без изменений), текст мельче */
const DESKTOP_PDF_WIDTH_FACTOR = 0.72;
const MOBILE_LAYOUT_MAX = 640;

const RATING_STORAGE_KEY = "knigi-book-ratings-v1";

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
    const sortEl = document.getElementById("filter-sort");
    return {
        q: (qEl && qEl.value ? qEl.value : "").trim(),
        author: authorEl ? authorEl.value : "",
        series: seriesEl ? seriesEl.value : "",
        sort: sortEl && sortEl.value ? sortEl.value : "updated-desc"
    };
}

function getFilteredBooks() {
    let list = books.slice();
    const { q, author, series, sort } = getFilterState();
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
    if (!authorSel || !seriesSel) {
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
}

let libraryFiltersBound = false;

function bindLibraryFilters() {
    const q = document.getElementById("filter-q");
    const author = document.getElementById("filter-author");
    const series = document.getElementById("filter-series");
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
    [q, author, series, sort].forEach((el) => {
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

function loadRatings() {
    try {
        const raw = localStorage.getItem(RATING_STORAGE_KEY);
        if (!raw) {
            return {};
        }
        const o = JSON.parse(raw);
        return typeof o === "object" && o !== null ? o : {};
    } catch {
        return {};
    }
}

function saveRatings(obj) {
    try {
        localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(obj));
    } catch {
        /* ignore */
    }
}

function getBookRating(bookId) {
    const n = Number(loadRatings()[bookId]);
    if (n >= 1 && n <= 5) {
        return n;
    }
    return 0;
}

function setBookRating(bookId, stars) {
    const all = loadRatings();
    all[bookId] = Math.max(1, Math.min(5, Math.round(Number(stars))));
    saveRatings(all);
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

let libraryRatingGridBound = false;

function bindLibraryRatingGrid() {
    const grid = document.getElementById("book-grid");
    if (!grid || libraryRatingGridBound) {
        return;
    }
    libraryRatingGridBound = true;
    grid.addEventListener("click", (e) => {
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
            const href = `reader.html?book=${encodeURIComponent(book.id)}`;
            const prefix = `lib-${idx}`;
            const seriesChip = book.seriesTitle
                ? `<span class="book-series-chip">${escapeHtml(book.seriesTitle)}</span>`
                : "";
            return `
            <article class="book-tile" data-book-id="${escapeAttr(book.id)}">
                <a class="book-card" href="${href}">
                    <div class="book-cover">
                        <span>${escapeHtml(book.title)}<br>${escapeHtml(book.author)}</span>
                    </div>
                    <div class="book-info">
                        <h2>${escapeHtml(book.title)}</h2>
                        <p>${escapeHtml(book.author)}</p>
                        <div class="book-meta-line">
                            <span class="book-updated">${escapeHtml(formatDateRu(book.updatedAt))}</span>
                            ${seriesChip}
                        </div>
                    </div>
                </a>
                <div class="book-rating-bar">
                    <span>Оценка:</span>
                    <div class="star-rating" role="group" aria-label="Оценка книги «${escapeHtml(
                        book.title
                    )}»">
                        ${renderStarButtons(book.id, rating, prefix)}
                    </div>
                </div>
            </article>
        `;
        })
        .join("");

    bindLibraryRatingGrid();
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

    const paint = () => {
        const r = getBookRating(readerState.book.id);
        container.innerHTML = renderStarButtons(readerState.book.id, r, "reader");
        container.querySelectorAll(".star-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const v = Number(btn.dataset.value);
                setBookRating(readerState.book.id, v);
                paint();
                const grid = document.getElementById("book-grid");
                if (grid) {
                    renderLibrary();
                }
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
            closeBtn.hidden = !isPseudoFullscreen();
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

// ==================== ЧАТ ====================
function initChat() {
    const toggleBtn = document.getElementById('library-chat-toggle');
    const chatPanel = document.getElementById('library-chat-panel');
    
    if (!toggleBtn || !chatPanel) return;
    
    // Загрузка сохранённого состояния чата
    let isChatOpen = false;
    try {
        const saved = localStorage.getItem('library-chat-open');
        if (saved === 'true') {
            isChatOpen = true;
        }
    } catch(e) {}
    
    function setChatState(open) {
        isChatOpen = open;
        chatPanel.hidden = !open;
        toggleBtn.setAttribute('aria-expanded', String(open));
        
        // Сохраняем состояние
        try {
            localStorage.setItem('library-chat-open', String(open));
        } catch(e) {}
        
        // Если чат открыт, скроллим вниз
        if (open) {
            const messagesContainer = document.getElementById('library-chat-messages');
            if (messagesContainer) {
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);
            }
        }
    }
    
    // Обработчик клика по кнопке
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setChatState(!isChatOpen);
    });
    
    // Устанавливаем начальное состояние
    setChatState(isChatOpen);
    
    // Обработчик для отправки сообщений
    const chatForm = document.getElementById('library-chat-form');
    if (chatForm && !chatForm.hasAttribute('data-chat-initialized')) {
        chatForm.setAttribute('data-chat-initialized', 'true');
        
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nickInput = document.getElementById('library-chat-nick');
            const messageInput = document.getElementById('library-chat-input');
            const sendBtn = chatForm.querySelector('.library-chat-send');
            const statusEl = document.getElementById('library-chat-status');
            
            const nick = nickInput?.value.trim() || 'Гость';
            const message = messageInput?.value.trim();
            
            if (!message) return;
            
            // Блокируем кнопку
            if (sendBtn) sendBtn.disabled = true;
            
            try {
                // Отправка в Supabase
                const { url, anonKey, table } = window.LIBRARY_CHAT_SUPABASE;
                
                const response = await fetch(`${url}/rest/v1/${table}`, {
                    method: 'POST',
                    headers: {
                        'apikey': anonKey,
                        'Authorization': `Bearer ${anonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        nick: nick,
                        body: message
                    })
                });
                
                if (!response.ok) throw new Error('Ошибка отправки');
                
                // Очищаем поле ввода
                if (messageInput) messageInput.value = '';
                
                // Показываем статус
                if (statusEl) {
                    statusEl.textContent = '✓ Отправлено';
                    statusEl.classList.remove('library-chat-status--error');
                    statusEl.hidden = false;
                    setTimeout(() => {
                        statusEl.hidden = true;
                    }, 2000);
                }
                
                // Обновляем список сообщений
                loadMessages();
                
            } catch (err) {
                console.error('Chat send error:', err);
                if (statusEl) {
                    statusEl.textContent = '❌ Ошибка отправки';
                    statusEl.classList.add('library-chat-status--error');
                    statusEl.hidden = false;
                    setTimeout(() => {
                        statusEl.hidden = true;
                        statusEl.classList.remove('library-chat-status--error');
                    }, 3000);
                }
            } finally {
                if (sendBtn) sendBtn.disabled = false;
                if (messageInput) messageInput.focus();
            }
        });
    }
    
    // Функция загрузки сообщений
    async function loadMessages() {
        const messagesContainer = document.getElementById('library-chat-messages');
        if (!messagesContainer) return;
        
        try {
            const { url, anonKey, table } = window.LIBRARY_CHAT_SUPABASE;
            
            const response = await fetch(
                `${url}/rest/v1/${table}?select=*&order=created_at.desc&limit=50`,
                {
                    headers: {
                        'apikey': anonKey,
                        'Authorization': `Bearer ${anonKey}`
                    }
                }
            );
            
            if (!response.ok) throw new Error('Ошибка загрузки');
            
            const messages = await response.json();
            
            // Очищаем контейнер
            messagesContainer.innerHTML = '';
            
            // Отображаем в обратном порядке (старые сверху)
            messages.reverse().forEach(msg => {
                const date = new Date(msg.created_at);
                const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
                
                const msgElement = document.createElement('li');
                msgElement.className = 'library-chat-msg';
                msgElement.innerHTML = `
                    <div class="library-chat-msg-meta">
                        <strong>${escapeHtml(msg.nick || 'Гость')}</strong> · ${dateStr} ${timeStr}
                    </div>
                    <div class="library-chat-msg-body">${escapeHtml(msg.body)}</div>
                `;
                messagesContainer.appendChild(msgElement);
            });
            
            // Скроллим вниз
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
        } catch (err) {
            console.error('Load messages error:', err);
            messagesContainer.innerHTML = '<li class="library-chat-msg" style="color: #fca5a5;">❌ Ошибка загрузки сообщений</li>';
        }
    }
    
    // Загружаем сообщения при открытии чата
    loadMessages();
    
    // Обновляем сообщения каждые 5 секунд
    setInterval(() => {
        const chatPanel = document.getElementById('library-chat-panel');
        if (chatPanel && !chatPanel.hidden) {
            loadMessages();
        }
    }, 5000);
}

// Запуск всех инициализаций
initBgThemeSwitcher();
bindLibraryFilters();
renderLibrary();
renderReader();
initChat();