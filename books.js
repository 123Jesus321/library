const books = [    
    {        
        id: "Бредни-Сумасшедшего",
        title: "Бредни Сумасшедшего",
        author: "Сумасшедший",
        pdf: "Бредни-Сумасшедшего.pdf"
    },
    {
        id: "Зеронтар-_1_",
        title: "Зеронтар",
        author: "Конфетки Миллер",
        pdf: "Зеронтар-_1_.pdf"
    },
    {
        id: "Азантир-и-его-устройство-_2_",
        title: "Азантир и его устройство",
        author: "Конфетки Миллер",
        pdf: "Азантир-и-его-устройство-_2_.pdf"
    },
    {
        id: "Битва-за-Азантир-_1_",
        title: "Битва за Азантир",
        author: "Конфетки Миллер",
        pdf: "Битва-за-Азантир-_1_.pdf"
    },
    {
        id: "Сотворение",
        title: "Сотворение",
        author: "Конфетки Миллер",
        pdf: "Сотворение.pdf"
    },
    {
        id: "Cetus",
        title: "Cetus",
        author: "SomeBadHum",
        pdf: "Cetus.pdf"
    },
    {
        id: "Алая-вспышка",
        title: "Алая-вспышка",
        author: "Hedvik",
        pdf: "Алая-вспышка.pdf"
    },
    {
        id: "Сборник Стихотворений",
        title: "Сборник Стихотворений",
        author: "SomeBadHum",
        pdf: "Сборник-Стихов.pdf"
    }];

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function renderLibrary() {
    const grid = document.getElementById("book-grid");
    if (!grid) return;

    grid.innerHTML = books
        .map(
            (book) => `
            <a class="book-card" href="reader.html?book=${encodeURIComponent(book.id)}">
                <div class="book-cover">
                    <span>${book.title}<br>${book.author}</span>
                </div>
                <div class="book-info">
                    <h2>${book.title}</h2>
                    <p>${book.author}</p>
                </div>
            </a>
        `
        )
        .join("");
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
    keyBound: false
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
    const cssW = Math.max(1, vpEl.clientWidth - 16);
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

function renderReader() {
    const { title } = getReaderEls();
    if (!title) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("book");
    readerState.book = books.find((b) => b.id === bookId) || books[0];

    applyReaderLayout();

    window.addEventListener("resize", onReaderViewportChange);
    window.addEventListener("orientationchange", onReaderViewportChange);
}

renderLibrary();
renderReader();
