document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const countryInput = document.getElementById('country-input');
    const resultsContainer = document.getElementById('results-container');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = countryInput.value.trim();
        
        if (searchTerm) {
            searchCountry(searchTerm);
        }
    });

    async function searchCountry(countryName) {
        try {
            // Show loading state
            resultsContainer.innerHTML = '<div class="loading">Searching for country information...</div>';
            
            // Fetch data from the API
            const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
            
            if (!response.ok) {
                throw new Error('Country not found or network problem');
            }
            
            const data = await response.json();
            displayResults(data);
            
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error: ${error.message}</p>
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
            const capital = country.capital ? country.capital[0] : 'Not Available';
            const flag = country.flags.svg || country.flags.png;
            
            // Extract currency (if available)
            let currencyInfo = 'Not Available';
            if (country.currencies) {
                const currencyCode = Object.keys(country.currencies)[0];
                const currency = country.currencies[currencyCode];
                currencyInfo = `${currency.name} (${currency.symbol || currencyCode})`;
            }
            
            // Extract 3 additional pieces of information
            const population = country.population ? country.population.toLocaleString() : 'Not Available';
            const region = country.region || 'Not Available';
            const languages = country.languages ? Object.values(country.languages).join(', ') : 'Not Available';
            
            // Create country card
            const countryCard = document.createElement('div');
            countryCard.className = 'country-card';
            
            countryCard.innerHTML = `
                <div class="flag-container">
                    <img src="${flag}" alt="${name} flag">
                </div>
                <div class="country-details">
                    <h2 class="country-name">${name}</h2>
                    <div class="info-item"><span class="info-label">Capital:</span> ${capital}</div>
                    <div class="info-item"><span class="info-label">Currency:</span> ${currencyInfo}</div>
                    <div class="info-item"><span class="info-label">Population:</span> ${population}</div>
                    <div class="info-item"><span class="info-label">Region:</span> ${region}</div>
                    <div class="info-item"><span class="info-label">Languages:</span> ${languages}</div>
                </div>
            `;
            
            resultsContainer.appendChild(countryCard);
        });
    }
});