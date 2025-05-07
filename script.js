document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const countryInput = document.getElementById('country-input');
    const resultsContainer = document.getElementById('results-container');
    
    // Initialize with welcome message
    showEmptyState();
    
    // Create orbit elements
    createOrbitElements();
    
    // Create particles
    createParticles();
    
    // Create scroll indicator
    createScrollIndicator();
    
    // Add animation delay to popular search tags
    document.querySelectorAll('.country-tag').forEach((tag, index) => {
        tag.style.setProperty('--i', index);
        
        // Add hover sound effect
        tag.addEventListener('mouseenter', playHoverSound);
    });
    
    // Add typing animation to search input
    countryInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
        playTypingSound();
    });
    
    countryInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
    
    // Add interactive hover effect for search input
    const searchInputContainer = document.querySelector('.search-input-container');
    searchInputContainer.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element
        
        // Create a subtle gradient effect that follows the mouse
        this.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(76, 223, 255, 0.2) 0%, var(--bg-light) 70%)`;
    });
    
    searchInputContainer.addEventListener('mouseleave', function() {
        this.style.background = 'var(--bg-light)';
    });
    
    // Add interactive glow effects for search button
    const exploreButton = document.querySelector('button[type="submit"]');
    exploreButton.addEventListener('mouseover', function() {
        const globeIcon = this.querySelector('i');
        globeIcon.style.animation = 'spin 2s linear infinite';
        this.style.boxShadow = '0 7px 20px rgba(76, 223, 255, 0.4), 0 0 20px rgba(76, 223, 255, 0.2)';
    });
    
    exploreButton.addEventListener('mouseout', function() {
        const globeIcon = this.querySelector('i');
        globeIcon.style.animation = '';
        this.style.boxShadow = '';
    });
    
    // Add interactive glow effects for country tags
    document.querySelectorAll('.country-tag').forEach(tag => {
        tag.addEventListener('mouseover', function() {
            this.style.boxShadow = '0 5px 15px rgba(76, 223, 255, 0.3), 0 0 20px rgba(76, 223, 255, 0.2)';
            this.style.borderColor = 'rgba(76, 223, 255, 0.5)';
        });
        
        tag.addEventListener('mouseout', function() {
            this.style.boxShadow = '';
            this.style.borderColor = '';
        });
    });
    
    // Typing sounds for immersion
    countryInput.addEventListener('keydown', function(e) {
        if (e.key.length === 1 || e.key === 'Backspace') {
            playTypingSound();
        }
    });
    
    // Handle form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = countryInput.value.trim();
        
        if (searchTerm) {
            playSearchSound();
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
            playSearchSound();
            
            setTimeout(() => {
                this.classList.remove('pulse-animation');
                searchCountry(country);
            }, 300);
        });
    });
    
    // Sound effects for interactivity
    function playTypingSound() {
        // This is a comment - no actual sound is played to avoid annoyance
        // In a real implementation you could uncomment this code:
        // const audio = new Audio('typing-sound.mp3');
        // audio.volume = 0.2;
        // audio.play();
    }
    
    function playSearchSound() {
        // This is a comment - no actual sound is played to avoid annoyance
        // const audio = new Audio('search-sound.mp3');
        // audio.volume = 0.4;
        // audio.play();
    }
    
    function playHoverSound() {
        // This is a comment - no actual sound is played to avoid annoyance
        // const audio = new Audio('hover-sound.mp3');
        // audio.volume = 0.1;
        // audio.play();
    }

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
                
                // Show scroll indicator after results are displayed
                document.querySelector('.scroll-indicator').classList.add('visible');
                
                // Hide scroll indicator after 3 seconds
                setTimeout(() => {
                    document.querySelector('.scroll-indicator').classList.remove('visible');
                }, 3000);
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
        
        // Staggered animation for cards
        countryCards.forEach((card, index) => {
            // Set progressive animation delay
            card.style.animationDelay = `${0.1 * index}s`;
            
            // Add 3D tilt effect based on mouse position
            card.addEventListener('mousemove', handleCardTilt);
            card.addEventListener('mouseleave', resetCardTilt);
            
            // Add parallax effect to flag images
            const flagImg = card.querySelector('.flag-container img');
            card.addEventListener('mousemove', (e) => {
                const { left, top, width, height } = card.getBoundingClientRect();
                const x = (e.clientX - left) / width - 0.5;
                const y = (e.clientY - top) / height - 0.5;
                
                flagImg.style.transform = `scale(1.1) translateX(${x * 10}px) translateY(${y * 10}px)`;
            });
        });
    }
    
    function handleCardTilt(e) {
        const card = this;
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        const angleY = -(e.clientX - cardCenterX) / 25;
        const angleX = (e.clientY - cardCenterY) / 25;
        const glareX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
        const glareY = ((e.clientY - cardRect.top) / cardRect.height) * 100;
        
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(10px)`;
        
        // Add dynamic highlight effect based on mouse position
        const flagContainer = card.querySelector('.flag-container');
        if (flagContainer) {
            flagContainer.style.backgroundImage = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, transparent 50%)`;
        }
    }
    
    function resetCardTilt() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        const flagContainer = this.querySelector('.flag-container');
        if (flagContainer) {
            flagContainer.style.backgroundImage = '';
        }
        
        // Reset flag image position
        const flagImg = this.querySelector('.flag-container img');
        if (flagImg) {
            flagImg.style.transform = '';
        }
    }
    
    function showEmptyState() {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="globe-3d-container">
                    <div class="globe-3d"></div>
                </div>
                <h2>Welcome to World Explorer</h2>
                <p>Enter a country name or click on one of the popular searches above to get started.</p>
                <div class="pulse-ring"></div>
            </div>
        `;
    }
    
    function createScrollIndicator() {
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        document.body.appendChild(scrollIndicator);
        
        // Show/hide scroll indicator based on page scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollIndicator.classList.add('visible');
                
                // Auto-hide after 2 seconds
                setTimeout(() => {
                    scrollIndicator.classList.remove('visible');
                }, 2000);
            }
        });
    }
    
    // Add animated background elements
    function addBackgroundElements() {
        const bgElements = document.createElement('div');
        bgElements.className = 'background-elements';
        
        for (let i = 0; i < 20; i++) {
            const element = document.createElement('div');
            element.className = 'bg-element';
            element.style.left = `${Math.random() * 100}%`;
            element.style.top = `${Math.random() * 100}%`;
            element.style.width = `${30 + Math.random() * 100}px`;
            element.style.height = element.style.width;
            element.style.animationDuration = `${10 + Math.random() * 20}s`;
            element.style.animationDelay = `${Math.random() * 5}s`;
            bgElements.appendChild(element);
        }
        
        document.body.appendChild(bgElements);
    }
    
    function createOrbitElements() {
        const orbitContainer = document.createElement('div');
        orbitContainer.className = 'orbit-container';
        
        for (let i = 0; i < 3; i++) {
            const orbit = document.createElement('div');
            orbit.className = 'orbit-element';
            orbitContainer.appendChild(orbit);
        }
        
        document.body.appendChild(orbitContainer);
    }
    
    function createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size between 3px and 8px
            const size = 3 + Math.random() * 5;
            particle.style.setProperty('--size', `${size}px`);
            
            // Random position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Random movement
            particle.style.setProperty('--tx', `${-50 + Math.random() * 100}px`);
            particle.style.setProperty('--ty', `${-50 + Math.random() * 100}px`);
            particle.style.setProperty('--r', `${-180 + Math.random() * 360}deg`);
            
            // Random duration and delay
            const duration = 5 + Math.random() * 10;
            particle.style.setProperty('--duration', `${duration}s`);
            particle.style.setProperty('--delay', `${Math.random() * 5}s`);
            
            particlesContainer.appendChild(particle);
        }
        
        document.body.appendChild(particlesContainer);
    }
    
    // Initialize visual effects
    addBackgroundElements();
    createOrbitElements();
    createParticles();
    createScrollIndicator();
    
    // Add parallax scrolling effect
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        // Parallax effect for background elements
        document.querySelectorAll('.bg-element').forEach((el, index) => {
            const speed = 0.05 + (index % 5) * 0.01;
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
        
        // Parallax effect for orbit elements
        document.querySelectorAll('.orbit-element').forEach((el, index) => {
            const speed = 0.02 + (index % 3) * 0.01;
            el.style.opacity = Math.max(0, 0.3 - scrollY * 0.0005);
        });
    });
});