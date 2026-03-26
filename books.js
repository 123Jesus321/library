const books = [    {        id: "Бредни-Сумасшедшего",        title: "Бредни Сумасшедшего",        author: "Pierrot<3",        pdf: "Бредни-Сумасшедшего.pdf"    },    {        id: "Зеронтар-_1",        title: "Зеронтар",        author: "Конфетки Миллер",        pdf: "Зеронтар-_1.pdf"    },    {        id: "Азантир-и-его-устройство-2",        title: "Азантир и его устройство",        author: "Конфетки Миллер",        pdf: "Азантир-и-его-устройство-2.pdf"    },    {        id: "Битва-за-Азантир-1",        title: "Битва за Азантир",        author: "Конфетки Миллер",        pdf: "Битва-за-Азантир-1.pdf"    },    {        id: "Сотворение",        title: "Сотворение",        author: "Конфетки Миллер",        pdf: "Сотворение.pdf"    }];

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

function renderReader() {
    const frame = document.getElementById("reader-frame");
    const title = document.getElementById("reader-title");
    if (!frame || !title) return;

    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("book");
    const selectedBook = books.find((book) => book.id === bookId) || books[0];

    title.textContent = `${selectedBook.title} — ${selectedBook.author}`;
    frame.src = selectedBook.pdf;
}

const ratings = {
    "Бредни-Сумасшедшего": [],
    "Зеронтар-_1": [],
    "Азантир-и-его-устройство-_2_": [],
    "Битва-за-Азантир-_1_": [],
    "Сотворение": []
};

// Функция для расчёта средней оценки
function getAverageRating(bookId) {
    const arr = ratings[bookId] || [];
    if (arr.length === 0) return "—";
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    return avg.toFixed(1);
}

// Функция для отображения рейтинга
function renderRating(bookId) {
    return `<span class="book-rating">★ ${getAverageRating(bookId)}</span>`;
}

// Функция для отображения выпадающего списка глав (только для сборника)
function renderChapterSelect(chapters) {
    return `
        <select class="chapter-select">
            ${chapters.map(ch => `<option value="${ch.id}">${ch.title}</option>`).join('')}
        </select>
    `;
}

// Массив глав для сборника "Конфетки Миллер"
const millerChapters = books.filter(b => b.author === "Конфетки Миллер");

// Добавляем сборник в начало массива (если его ещё нет)
if (!books.some(b => b.author === "Конфетки Миллер" && b.title === "Сборник: Конфетки Миллер")) {
    books.unshift({
        id: "Сборник-Конфетки-Миллер",
        title: "Сборник: Конфетки Миллер",
        author: "Конфетки Миллер",
        pdf: "", // не используем напрямую
        isCollection: true,
        chapters: millerChapters.map(ch => ({ id: ch.id, title: ch.title }))
    });
}

// Обновляем renderLibrary
function renderLibrary() {
    const grid = document.getElementById("book-grid");
    if (!grid) return;

    grid.innerHTML = books.map(book => {
        const isCollection = book.isCollection;
        const chapters = book.chapters || [];

        return `
            <a class="book-card" href="reader.html?book=${encodeURIComponent(book.id)}">
                <div class="book-cover">
                    <span>${book.title}<br>${book.author}</span>
                    ${isCollection ? renderChapterSelect(chapters) : ''}
                </div>
                <div class="book-info">
                    <h2>${book.title}</h2>
                    <p>${book.author}</p>
                    <p>${renderRating(book.id)}</p>
                </div>
            </a>
        `;
    }).join("");
}

// Обновляем renderReader
function renderReader() {
    const frame = document.getElementById("reader-frame");
    const title = document.getElementById("reader-title");
    const ratingBlock = document.getElementById("reader-rating");
    const ratingForm = document.getElementById("rating-form");
    const ratingInput = document.getElementById("rating-input");

    if (!frame || !title || !ratingBlock || !ratingForm || !ratingInput) return;

    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("book");
    const chapterId = params.get("chapter");

    let selectedBook = books.find(b => b.id === bookId) || books[0];
    let selectedChapter = null;

    if (selectedBook.isCollection) {
        selectedChapter = selectedBook.chapters.find(ch => ch.id === chapterId) || selectedBook.chapters[0];
        selectedBook = books.find(b => b.id === selectedChapter.id) || books[0];
    }

    title.textContent = `${selectedBook.title} — ${selectedBook.author}`;
    frame.src = selectedBook.pdf;

    // Отображение и обработка оценки
    ratingBlock.innerHTML = `Оценка: ${renderRating(selectedBook.id)}`;

    ratingForm.onsubmit = function(e) {
        e.preventDefault();
        const value = parseInt(ratingInput.value);
        if (value >= 1 && value <= 5) {
            ratings[selectedBook.id].push(value);
            ratingBlock.innerHTML = `Оценка: ${renderRating(selectedBook.id)}`;
            ratingInput.value = "";
        }
    };
}

renderLibrary();
renderReader();
