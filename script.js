document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const countryInput = document.getElementById('country-input');
    const resultsContainer = document.getElementById('results-container');
    
    // Initialize with welcome message
    showEmptyState();
    
    // Handle form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = countryInput.value.trim();
        
        if (searchTerm) {
            searchCountry(searchTerm);
        }
    });
    
    // Handle quick search tags
    document.querySelectorAll('.country-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const country = this.getAttribute('data-country');
            countryInput.value = country;
            searchCountry(country);
        });
    });

    async function searchCountry(countryName) {
        try {
            // Show loading state
            resultsContainer.innerHTML = `
                <div class="loading">
                    <i class="fas fa-globe fa-spin"></i>
                    <p>Searching for information about ${countryName}...</p>
                </div>`;
            
            // Fetch data from the API
            const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
            
            if (!response.ok) {
                throw new Error('Country not found or network problem');
            }
            
            const data = await response.json();
            displayResults(data);
            
            // Scroll to results
            resultsContainer.scrollIntoView({behavior: 'smooth'});
            
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>${error.message}</p>
                    <p>Please try another country name.</p>
                </div>
            `;
        }
    }

    function displayResults(countries) {
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        countries.forEach(country => {
            // Extract required data
            const name = country.name.common;
            const officialName = country.name.official;
            const capital = country.capital ? country.capital[0] : 'Not Available';
            const flag = country.flags.svg || country.flags.png;
            
            // Extract currency (if available)
            let currencyInfo = 'Not Available';
            if (country.currencies) {
                const currencyCode = Object.keys(country.currencies)[0];
                const currency = country.currencies[currencyCode];
                currencyInfo = `${currency.name} (${currency.symbol || currencyCode})`;
            }
            
            // Extract additional information
            const population = country.population ? country.population.toLocaleString() : 'Not Available';
            const region = country.region || 'Not Available';
            const subregion = country.subregion || 'Not Available';
            const languages = country.languages ? Object.values(country.languages).join(', ') : 'Not Available';
            const area = country.area ? `${country.area.toLocaleString()} km²` : 'Not Available';
            
            // Create country card
            const countryCard = document.createElement('div');
            countryCard.className = 'country-card';
            
            countryCard.innerHTML = `
                <div class="flag-container">
                    <img src="${flag}" alt="${name} flag">
                </div>
                <div class="country-details">
                    <h2 class="country-name">${name}</h2>
                    <div class="info-item">
                        <span class="info-label">Official:</span> ${officialName}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Capital:</span> ${capital}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Currency:</span> ${currencyInfo}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Population:</span> ${population}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Region:</span> ${region}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Subregion:</span> ${subregion}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Languages:</span> ${languages}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Area:</span> ${area}
                    </div>
                </div>
            `;
            
            resultsContainer.appendChild(countryCard);
        });
    }
    
    function showEmptyState() {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-globe-americas"></i>
                <h2>Welcome to World Explorer</h2>
                <p>Enter a country name or click on one of the popular searches above to get started.</p>
            </div>
        `;
    }
});