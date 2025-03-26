// Initialize arrays for favorites and search history
let favorites = [];
let searchHistory = [];

// Event listener for the search form submission
document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const searchQuery = document.getElementById("searchInput").value.trim();
    if (searchQuery) {
        saveSearchQuery(searchQuery); // Save the search query
        searchBooks(searchQuery);
    }
});

// Function to search for books using the Open Library API
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

// Function to display the fetched books
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
        
        // Cover image handling
        const coverID = book.cover_i 
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/150x200?text=No+Cover";

        bookElement.innerHTML = `
            <div class="book-cover-container">
                <img src="${coverID}" alt="Book Cover" class="book-cover" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/150x200?text=Cover+Not+Found';">
            </div>
            <h3>${escapeHTML(title)}</h3>
            <p>by ${escapeHTML(author)}</p>
            <button class="favorite-button">Add to Favorites</button>
        `;

        // Add event listener for the favorite button
        bookElement.querySelector('.favorite-button').addEventListener('click', () => {
            toggleFavorite({ title, author, cover: coverID });
        });

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

// Function to escape HTML to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
}

// Function to toggle favorites
function toggleFavorite(book) {
    const index = favorites.findIndex(fav => fav.title === book.title);
    if (index > -1) {
        favorites.splice(index, 1); // Remove from favorites
        alert(`${book.title} has been removed from favorites.`);
    } else {
        favorites.push(book); // Add to favorites
        alert(`${book.title} has been added to favorites!`);
    }
    updateFavoritesDisplay();
}

// Function to update the favorites display
function updateFavoritesDisplay() {
    const favoritesDiv = document.getElementById("favorites");
    favoritesDiv.innerHTML = ""; // Clear previous favorites
    favorites.forEach(book => {
        const favoriteElement = document.createElement("div");
        favoriteElement.innerHTML = `
            <div class="favorite-item">
                <img src="${book.cover}" alt="Book Cover" class="favorite-cover">
                <div class="favorite-details">
                    <p>${book.title}</p>
                    <p>by ${book.author}</p>
                </div>
            </div>
        `;
        favoritesDiv.appendChild(favoriteElement);
    });
}

// Function to save search queries
function saveSearchQuery(query) {
    if (!searchHistory.includes(query)) {
        searchHistory.push(query);
        updateHistoryDisplay();
    }
}

// Function to update the search history display
function updateHistoryDisplay() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = ""; // Clear previous history
    searchHistory.forEach(query => {
        const historyItem = document.createElement("li");
        historyItem.textContent = query;
        historyItem.addEventListener('click', () => {
            document.getElementById("searchInput").value = query;
            searchBooks(query); // Trigger search on click
        });
        historyList.appendChild(historyItem);
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