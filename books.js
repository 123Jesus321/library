const books = [
    {
        id: "Бредни-Сумасшедшего",
        title: "Бредни Сумасшедшего",
        author: "Pierrot<3",
        pdf: ""
    },
    {
        id: "crime-and-punishment",
        title: "Преступление и наказание",
        author: "Ф. М. Достоевский",
        pdf: "https://www.gutenberg.org/files/2554/2554-pdf.pdf"
    },
    {
        id: "dead-souls",
        title: "Мертвые души",
        author: "Н. В. Гоголь",
        pdf: "https://www.gutenberg.org/files/1081/1081-pdf.pdf"
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
