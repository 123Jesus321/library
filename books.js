const books = [
    {
        id: "Бредни-Сумасшедшего",
        title: "Бредни Сумасшедшего",
        author: "Pierrot<3",
        pdf: "Бредни-Сумасшедшего.pdf"
    },
    {
        id: "Зеронтар (1)",
        title: "Зеронтар",
        author: "Конфетки Миллер",
        pdf: "Зеронтар(1).pdf"
    },
    {
        id: "Азантир и его устройство (2)",
        title: "Азантир и его устройство",
        author: "Конфетки Миллер",
        pdf: "Азантир-и-его-устройство-_2_.pdf"
    },
    {
        id: "Битва за Азантир (1)",
        title: "Битва за Азантир",
        author: "Конфетки Миллер",
        pdf: "Битва-за-Азантир-_1_.pdf"
    }
];

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

renderLibrary();
renderReader();
