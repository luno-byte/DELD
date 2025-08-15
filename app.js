class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 19;
        this.isFullscreen = false;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.createNavigationDots();
        this.updateUI();
        this.loadFromURL();
    }
    
    initializeElements() {
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.currentSlideEl = document.getElementById('current-slide');
        this.totalSlidesEl = document.getElementById('total-slides');
        this.progressFill = document.getElementById('progress-fill');
        this.navigationDots = document.getElementById('navigation-dots');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.presentationContainer = document.querySelector('.presentation-container');
    }
    
    initializeEventListeners() {
        // Button navigation with proper event binding
        this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.previousSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.nextSlide();
        });
        
        this.fullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleFullscreen();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Prevent default behavior for space and arrow keys
        document.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => this.loadFromURL());
        
        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }
    
    createNavigationDots() {
        this.navigationDots.innerHTML = '';
        for (let i = 1; i <= this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'nav-dot';
            dot.setAttribute('aria-label', `Go to slide ${i}`);
            if (i === this.currentSlide) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.goToSlide(i);
            });
            this.navigationDots.appendChild(dot);
        }
    }
    
    handleKeyboard(e) {
        switch (e.code) {
            case 'ArrowLeft':
            case 'ArrowUp':
                this.previousSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case 'Space':
                this.nextSlide();
                break;
            case 'Home':
                this.goToSlide(1);
                break;
            case 'End':
                this.goToSlide(this.totalSlides);
                break;
            case 'F11':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'Escape':
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                break;
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides) return;
        
        const prevSlide = this.currentSlide;
        this.currentSlide = slideNumber;
        
        // Update slides
        this.slides.forEach((slide, index) => {
            const slideNum = index + 1;
            slide.classList.remove('active', 'prev');
            
            if (slideNum === this.currentSlide) {
                slide.classList.add('active');
            } else if (slideNum < this.currentSlide) {
                slide.classList.add('prev');
            }
        });
        
        this.updateUI();
        this.updateURL();
        
        // Announce slide change for screen readers
        this.announceSlideChange();
    }
    
    updateUI() {
        // Update slide counter
        this.currentSlideEl.textContent = this.currentSlide;
        this.totalSlidesEl.textContent = this.totalSlides;
        
        // Update progress bar
        const progressPercent = (this.currentSlide / this.totalSlides) * 100;
        this.progressFill.style.width = `${progressPercent}%`;
        
        // Update navigation dots
        const dots = this.navigationDots.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            if (index + 1 === this.currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Update button states and appearance - but keep them clickable
        if (this.currentSlide === 1) {
            this.prevBtn.style.opacity = '0.5';
            this.prevBtn.setAttribute('aria-disabled', 'true');
        } else {
            this.prevBtn.style.opacity = '1';
            this.prevBtn.removeAttribute('aria-disabled');
        }
        
        if (this.currentSlide === this.totalSlides) {
            this.nextBtn.textContent = 'Finish';
            this.nextBtn.style.opacity = '0.5';
            this.nextBtn.setAttribute('aria-disabled', 'true');
        } else {
            this.nextBtn.textContent = 'Next →';
            this.nextBtn.style.opacity = '1';
            this.nextBtn.removeAttribute('aria-disabled');
        }
    }
    
    updateURL() {
        const url = new URL(window.location);
        url.hash = `slide-${this.currentSlide}`;
        history.replaceState(null, '', url);
    }
    
    loadFromURL() {
        const hash = window.location.hash;
        if (hash.startsWith('#slide-')) {
            const slideNumber = parseInt(hash.replace('#slide-', ''));
            if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
                this.goToSlide(slideNumber);
                return;
            }
        }
        // Default to slide 1 if no valid hash
        this.goToSlide(1);
    }
    
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    enterFullscreen() {
        const element = this.presentationContainer;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    handleFullscreenChange() {
        const isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        
        this.isFullscreen = isFullscreen;
        
        if (isFullscreen) {
            this.presentationContainer.classList.add('fullscreen');
            this.fullscreenBtn.innerHTML = '⛶ Exit Full Screen';
        } else {
            this.presentationContainer.classList.remove('fullscreen');
            this.fullscreenBtn.innerHTML = '⛶ Full Screen';
        }
    }
    
    announceSlideChange() {
        // Create or update live region for screen readers
        let liveRegion = document.getElementById('slide-announce');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'slide-announce';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
        
        const slideElement = this.slides[this.currentSlide - 1];
        const slideTitle = slideElement.querySelector('h1, h2');
        const title = slideTitle ? slideTitle.textContent : `Slide ${this.currentSlide}`;
        
        liveRegion.textContent = `${title}. Slide ${this.currentSlide} of ${this.totalSlides}`;
    }
    
    // Touch/Swipe support for mobile
    initializeTouchSupport() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        const slidesContainer = document.querySelector('.slides-container');
        
        slidesContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });
        
        slidesContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Only handle horizontal swipes that are longer than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
    
    // Auto-advance functionality (optional)
    startAutoAdvance(intervalSeconds = 30) {
        this.stopAutoAdvance(); // Clear any existing interval
        
        this.autoAdvanceInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.stopAutoAdvance();
            }
        }, intervalSeconds * 1000);
    }
    
    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new PresentationApp();
    
    // Initialize touch support
    app.initializeTouchSupport();
    
    // Add click handlers for video links (analytics or tracking could go here)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('video-link')) {
            // Optional: Track video clicks
            console.log('Video clicked:', e.target.href);
        }
    });
    
    // Preload next/previous slides for smoother transitions
    const preloadSlides = () => {
        const currentSlide = app.currentSlide;
        const slides = [currentSlide - 1, currentSlide, currentSlide + 1];
        
        slides.forEach(slideNum => {
            if (slideNum >= 1 && slideNum <= app.totalSlides) {
                const slide = document.querySelector(`[data-slide="${slideNum}"]`);
                if (slide) {
                    slide.style.willChange = 'transform, opacity';
                }
            }
        });
    };
    
    // Clean up will-change property for better performance
    const cleanupSlides = () => {
        document.querySelectorAll('.slide').forEach(slide => {
            slide.style.willChange = 'auto';
        });
    };
    
    // Add performance optimizations
    let preloadTimeout;
    document.addEventListener('keydown', () => {
        clearTimeout(preloadTimeout);
        preloadSlides();
        preloadTimeout = setTimeout(cleanupSlides, 1000);
    });
    
    // Expose app instance globally for debugging
    window.presentationApp = app;
});