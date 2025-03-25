document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const searchQuery = document.getElementById("searchInput").value.trim();
    if (searchQuery) {
        searchBooks(searchQuery);
    }
});

function searchBooks(query) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Loading...</p>"; // Show loading text

    const apiUrl = `https://openlibrary.org/search.json?q=${query}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayBooks(data.docs))
        .catch(error => {
            resultsDiv.innerHTML = "<p>Error fetching data. Please try again.</p>";
            console.error("Error fetching data:", error);
        });
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
        
        // cover image handling
        const coverID = book.cover_i 
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/150x200?text=No+Cover";

        bookElement.innerHTML = `
            <img src="${coverID}" alt="Book Cover">
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

// Add DOMContentLoaded event listener for input focus effects
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById("searchInput");
    
    searchInput.addEventListener('focus', () => {
        searchInput.style.borderColor = '#007bff';
        searchInput.style.boxShadow = '0 0 5px rgba(0, 123, 255, 0.5)';
    });

    searchInput.addEventListener('blur', () => {
        searchInput.style.borderColor = '#ccc';
        searchInput.style.boxShadow = 'none';
    });
});