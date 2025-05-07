document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const countryInput = document.getElementById('country-input');
    const resultsContainer = document.getElementById('results-container');
    
    // Initialize with welcome message
    showEmptyState();
    
    // Add animation delay to popular search tags
    document.querySelectorAll('.country-tag').forEach((tag, index) => {
        tag.style.setProperty('--i', index);
    });
    
    // Add typing animation to search input
    countryInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    countryInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
    
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
            
            // Add pulse animation
            this.classList.add('pulse-animation');
            setTimeout(() => {
                this.classList.remove('pulse-animation');
                searchCountry(country);
            }, 300);
        });
    });

    async function searchCountry(countryName) {
        try {
            // Show loading state with animation
            resultsContainer.innerHTML = `
                <div class="loading">
                    <i class="fas fa-globe fa-spin"></i>
                    <p>Searching for information about <strong>${countryName}</strong>...</p>
                    <div class="loading-bar"><div class="loading-progress"></div></div>
                </div>`;
                
            const loadingProgress = document.querySelector('.loading-progress');
            let width = 0;
            const loadingInterval = setInterval(() => {
                if (width >= 70) clearInterval(loadingInterval);
                width += 5;
                loadingProgress.style.width = width + '%';
            }, 100);
            
            // Fetch data from the API
            const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
            
            if (!response.ok) {
                clearInterval(loadingInterval);
                throw new Error('Country not found or network problem');
            }
            
            const data = await response.json();
            
            // Complete loading animation
            clearInterval(loadingInterval);
            loadingProgress.style.width = '100%';
            
            // Display results after a short delay for smooth animation
            setTimeout(() => {
                displayResults(data);
                // Scroll to results
                resultsContainer.scrollIntoView({behavior: 'smooth', block: 'start'});
            }, 500);
            
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>${error.message}</p>
                    <p>Please try another country name.</p>
                    <button onclick="window.location.reload()" class="retry-btn">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        }
    }

    function displayResults(countries) {
        // Prepare HTML for all country cards
        let cardsHTML = '';
        
        countries.forEach((country, index) => {
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
            
            // Generate HTML for this country card
            cardsHTML += `
                <div class="country-card" style="--i: ${index}">
                    <div class="flag-container">
                        <img src="${flag}" alt="${name} flag" loading="lazy">
                    </div>
                    <div class="country-details">
                        <h2 class="country-name">${name}</h2>
                        <div class="info-item">
                            <span class="info-label">Official</span> ${officialName}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Capital</span> ${capital}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Currency</span> ${currencyInfo}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Population</span> ${population}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Region</span> ${region}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Subregion</span> ${subregion}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Languages</span> ${languages}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Area</span> ${area}
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Clear and add all cards at once
        resultsContainer.innerHTML = cardsHTML;
        
        // Add hover effects and interactive elements
        const countryCards = document.querySelectorAll('.country-card');
        countryCards.forEach(card => {
            // Add 3D tilt effect
            card.addEventListener('mousemove', function(e) {
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const cardCenterY = cardRect.top + cardRect.height / 2;
                const angleX = (e.clientY - cardCenterY) / 25;
                const angleY = -(e.clientX - cardCenterX) / 25;
                
                card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(10px)`;
            });
            
            // Reset on mouse out
            card.addEventListener('mouseleave', function() {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }
    
    function showEmptyState() {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-globe-americas"></i>
                <h2>Welcome to World Explorer</h2>
                <p>Enter a country name or click on one of the popular searches above to get started.</p>
                <div class="pulse-ring"></div>
            </div>
        `;
    }
    
    // Add animated background elements
    addBackgroundElements();
    
    function addBackgroundElements() {
        const bgElements = document.createElement('div');
        bgElements.className = 'background-elements';
        
        for (let i = 0; i < 20; i++) {
            const element = document.createElement('div');
            element.className = 'bg-element';
            element.style.left = `${Math.random() * 100}%`;
            element.style.top = `${Math.random() * 100}%`;
            element.style.animationDuration = `${10 + Math.random() * 20}s`;
            element.style.animationDelay = `${Math.random() * 5}s`;
            bgElements.appendChild(element);
        }
        
        document.body.appendChild(bgElements);
    }
});