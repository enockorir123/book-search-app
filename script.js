document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const searchQuery = document.getElementById("searchInput").value.trim();
    if (searchQuery) {
        searchBooks(searchQuery);
    }
});

function searchBooks(query) {
    const apiUrl = `https://openlibrary.org/search.json?q=${query}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayBooks(data.docs))
        .catch(error => console.error("Error fetching data:", error));
}

function displayBooks(books) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (books.length === 0) {
        resultsDiv.innerHTML = "<p>No books found. Try another search term.</p>";
        return;
    }

    books.slice(0, 10).forEach(book => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book");

        const title = book.title || "No title available";
        const author = book.author_name ? book.author_name[0] : "Unknown author";
        const coverID = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "placeholder.jpg";

        bookElement.innerHTML = `
            <img src="${coverID}" alt="Book Cover">
            <h3>${title}</h3>
            <p>by ${author}</p>
        `;

        resultsDiv.appendChild(bookElement);
    });
}
