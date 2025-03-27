

// Local Storage Management
const StorageManager = {
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    },

    getFromLocalStorage(key, defaultValue = []) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error(`Error retrieving ${key} from localStorage:`, error);
            return defaultValue;
        }
    }
};

// Book Search Application
class BookSearchApp {
    constructor() {
        // Initialize state with local storage
        this.favorites = StorageManager.getFromLocalStorage('favorites');
        this.searchHistory = StorageManager.getFromLocalStorage('searchHistory');

        this.initEventListeners();
        this.updateFavoritesDisplay();
        this.updateHistoryDisplay();
    }

    initEventListeners() {
        const searchForm = document.getElementById("searchForm");
        const searchInput = document.getElementById("searchInput");

        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const searchQuery = searchInput.value.trim();
            
            if (searchQuery) {
                this.saveSearchQuery(searchQuery);
                this.searchBooks(searchQuery);
            }
        });

        // Input focus effects
        searchInput.addEventListener('focus', () => {
            searchInput.style.borderColor = '#007bff';
            searchInput.style.boxShadow = '0 0 5px rgba(0, 123, 255, 0.5)';
        });

        searchInput.addEventListener('blur', () => {
            searchInput.style.borderColor = '#ccc';
            searchInput.style.boxShadow = 'none';
        });
    }

    // Improved book search function with error handling
    async searchBooks(query) {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = '<div class="loading">Loading...</div>';

        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${query}`);
            const data = await response.json();
            this.displayBooks(data.docs);
        } catch (error) {
            resultsDiv.innerHTML = `
                <div class="error">
                    <p>Error fetching data. Please try again.</p>
                    <small>${error.message}</small>
                </div>
            `;
            console.error("Search error:", error);
        }
    }

    displayBooks(books) {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";

        if (!books || books.length === 0) {
            resultsDiv.innerHTML = "<p>No books found. Try another search term.</p>";
            return;
        }

        books.slice(0, 12).forEach(book => {
            const bookElement = this.createBookElement(book);
            resultsDiv.appendChild(bookElement);
        });
    }

    createBookElement(book) {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book");

        const title = book.title || "No title available";
        const author = book.author_name ? book.author_name[0] : "Unknown author";
        
        const coverID = book.cover_i 
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/150x200?text=No+Cover";

        bookElement.innerHTML = `
            <div class="book-cover-container">
                <img src="${coverID}" alt="Book Cover" class="book-cover" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/150x200?text=Cover+Not+Found';">
            </div>
            <div class="book-content">
                <h3 class="book-title">${this.escapeHTML(title)}</h3>
                <p class="book-author">by ${this.escapeHTML(author)}</p>
                <button class="favorite-button">
                    ${this.isFavorite(title) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
            </div>
        `;

        // Favorite button event listener
        const favoriteButton = bookElement.querySelector('.favorite-button');
        favoriteButton.addEventListener('click', () => {
            this.toggleFavorite({ 
                title, 
                author, 
                cover: coverID 
            });
            
            // Update button text
            favoriteButton.textContent = this.isFavorite(title) 
                ? 'Remove from Favorites' 
                : 'Add to Favorites';
        });

        return bookElement;
    }

    // Favorite Management
    toggleFavorite(book) {
        const index = this.favorites.findIndex(fav => fav.title === book.title);
        
        if (index > -1) {
            // Remove from favorites
            this.favorites.splice(index, 1);
            this.showNotification(`${book.title} removed from favorites`);
        } else {
            // Add to favorites
            this.favorites.push(book);
            this.showNotification(`${book.title} added to favorites`);
        }

        // Update displays and local storage
        this.updateFavoritesDisplay();
        StorageManager.saveToLocalStorage('favorites', this.favorites);
    }

    isFavorite(title) {
        return this.favorites.some(fav => fav.title === title);
    }

    updateFavoritesDisplay() {
        const favoritesDiv = document.getElementById("favorites");
        favoritesDiv.innerHTML = ""; 

        if (this.favorites.length === 0) {
            favoritesDiv.innerHTML = '<p>No favorites yet</p>';
            return;
        }

        this.favorites.forEach((book, index) => {
            const favoriteElement = document.createElement("div");
            favoriteElement.classList.add("favorite-item");
            favoriteElement.innerHTML = `
                <img src="${book.cover}" alt="Book Cover" class="favorite-cover">
                <div class="favorite-details">
                    <p>${book.title}</p>
                    <p>by ${book.author}</p>
                </div>
                <button class="remove-favorite" data-index="${index}">✕</button>
            `;

            // Remove favorite button event listener
            const removeButton = favoriteElement.querySelector('.remove-favorite');
            removeButton.addEventListener('click', () => {
                this.removeFavoriteByIndex(index);
            });

            favoritesDiv.appendChild(favoriteElement);
        });
    }

    removeFavoriteByIndex(index) {
        const removedBook = this.favorites[index];
        this.favorites.splice(index, 1);
        this.updateFavoritesDisplay();
        StorageManager.saveToLocalStorage('favorites', this.favorites);
        this.showNotification(`${removedBook.title} removed from favorites`);
    }

    // Search History Management
    saveSearchQuery(query) {
        // Prevent duplicate entries and limit history
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            
            // Limit search history to last 10 queries
            this.searchHistory = this.searchHistory.slice(0, 10);
            
            // Update display and local storage
            this.updateHistoryDisplay();
            StorageManager.saveToLocalStorage('searchHistory', this.searchHistory);
        }
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById("historyList");
        historyList.innerHTML = ""; 

        if (this.searchHistory.length === 0) {
            historyList.innerHTML = '<li>No recent searches</li>';
            return;
        }

        this.searchHistory.forEach((query, index) => {
            const historyItem = document.createElement("li");
            historyItem.textContent = query;
            
            // Add click event to re-search
            historyItem.addEventListener('click', () => {
                document.getElementById("searchInput").value = query;
                this.searchBooks(query);
            });

            // Add remove button for each history item
            const removeButton = document.createElement("span");
            removeButton.textContent = "✕";
            removeButton.classList.add("remove-history");
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent re-searching
                this.removeHistoryItem(index);
            });

            historyItem.appendChild(removeButton);
            historyList.appendChild(historyItem);
        });
    }

    removeHistoryItem(index) {
        this.searchHistory.splice(index, 1);
        this.updateHistoryDisplay();
        StorageManager.saveToLocalStorage('searchHistory', this.searchHistory);
    }

    // Utility Methods
    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag));
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new BookSearchApp();
});