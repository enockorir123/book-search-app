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
        
        // Improved cover image handling
        let coverURL;
        if (book.cover_i) {
            coverURL = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
        } else if (book.isbn && book.isbn.length > 0) {
            // Try to get cover by ISBN
            coverURL = `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
        } else {
            // Generic placeholder with book title
            coverURL = `https://via.placeholder.com/150x200.png?text=${encodeURIComponent(title.substring(0, 20))}`;
        }

        bookElement.innerHTML = `
            <img src="${coverURL}" alt="Cover for ${title}" onerror="this.onerror=null; this.src='https://via.placeholder.com/150x200.png?text=No+Cover';">
            <h3>${title}</h3>
            <p>by ${author}</p>
        `;

        // Hover event listeners
        bookElement.addEventListener('mouseenter', () => {
            bookElement.style.transform = 'scale(1.05)';
            bookElement.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
        });

        bookElement.addEventListener('mouseleave', () => {
            bookElement.style.transform = 'scale(1)';
            bookElement.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        });

        resultsDiv.appendChild(bookElement);
    });
}