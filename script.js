window.addEventListener("load", async () => {
    // --- CONFIGURATION ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzoTqmvHZ9x1_ByIVANrW9aWf8TLb2iqkJIjDvXw8yTlaeTMlpEb3Z4FUpLQk9H-b3omg/exec";

    // --- INITIALIZE ALL PAGE FUNCTIONS ---
    // 1. Load the HTML fragments first
    await loadComponents(); 
    
    // 2. Initialize interactive features AFTER components are in the DOM
    initMobileNav();
    initVideoModal();
    initContactModal();
    initSmoothScroll();
    initActiveNavOnScroll();
    initFooter();
    initBackToTopButton();
    initScrollAnimations();
    initTestimonialCarousel();
    initFaqAnimation();
    initMoreInsights();
    initMainContactForm();

    // Hide preloader
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('loaded');

    // --- COMPONENT LOADER ---
    async function loadComponents() {
        const containers = document.querySelectorAll("[data-component-container]");
        const isSubPage = isCurrentPageInSubdirectory();
        const componentBasePath = isSubPage ? "../components/" : "components/";

        const fetchPromises = Array.from(containers).map(async (container) => {
            const componentName = container.dataset.componentContainer;
            const path = `${componentBasePath}${componentName}.html`;
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`Component '${componentName}' not found at path: ${path}. Check if the file exists and the name is correct.`);
                }
                const html = await response.text();
                container.innerHTML = html;
            } catch (error) {
                container.innerHTML = `<p style="color: red; text-align: center; padding: 1rem;">${error.message}</p>`;
                console.error(error);
            }
        });
        await Promise.all(fetchPromises);

        // After loading, fix asset paths if on a sub-page
        if (isSubPage) {
            fixComponentAssetPaths();
        }
    }

    function isCurrentPageInSubdirectory() {
        // A simple check: if the path contains '/components/', it's a sub-page.
        return window.location.pathname.includes('/components/');
    }

    function fixComponentAssetPaths() {
        const components = document.querySelectorAll('[data-component-container]');
        components.forEach(component => {
            // Fix image paths
            const images = component.querySelectorAll('img[src]');
            images.forEach(img => {
                const src = img.getAttribute('src');
                if (src && src.startsWith('images/')) {
                    img.setAttribute('src', `../${src}`);
                }
            });

            // Fix anchor links
            const links = component.querySelectorAll('a[href]');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('components/')) {
                    link.setAttribute('href', `../${href}`);
                }
            });
        });
    }

    // --- NAVIGATION & UI FUNCTIONS ---
    function initMobileNav() {
        const fullMenu = document.querySelector('.full-menu-overlay');
        const toggleButtons = document.querySelectorAll('.mobile-nav-toggle');

        if (!fullMenu || !toggleButtons.length) return;

        const toggleMenu = () => {
            const isOpen = fullMenu.classList.toggle('open');
            toggleButtons.forEach(btn => btn.setAttribute('aria-expanded', isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        };

        toggleButtons.forEach(btn => btn.addEventListener('click', toggleMenu));

        fullMenu.addEventListener('click', (e) => {
            if (e.target.closest('a[href^="#"]')) {
                fullMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    function initVideoModal() {
        const videoModal = document.getElementById('video-modal');
        if (!videoModal) return;

        const openButtons = document.querySelectorAll('.open-video-btn');
        const closeButton = videoModal.querySelector('.modal-close-btn');
        const iframe = videoModal.querySelector('iframe');

        openButtons.forEach(button => {
            button.addEventListener('click', () => {
                const videoSrc = button.dataset.videoSrc;
                if (videoSrc) {
                    iframe.src = videoSrc;
                    videoModal.removeAttribute('aria-hidden');
                }
            });
        });

        const closeVideoModal = () => {
            videoModal.setAttribute('aria-hidden', 'true');
            iframe.src = ""; 
        };

        [closeButton, videoModal].forEach(el => el.addEventListener('click', (e) => {
            if (e.target === videoModal || e.target.closest('.modal-close-btn')) closeVideoModal();
        }));
    }

    function initContactModal() {
        const contactModal = document.getElementById('contact-modal');
        if (!contactModal) return;

        const openButtons = document.querySelectorAll('.open-contact-modal');
        const closeButton = contactModal.querySelector('.modal-close-btn');

        openButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                contactModal.removeAttribute('aria-hidden');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeModal = () => {
            contactModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        [closeButton, contactModal].forEach(el => el.addEventListener('click', (e) => {
            if (e.target === contactModal || e.target.closest('.modal-close-btn')) closeModal();
        }));
    }

    function initSmoothScroll() {
        // Only target links with the 'page-scroll' class for smooth scrolling
        document.querySelectorAll('a.page-scroll').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const url = new URL(href, window.location.href);
                const currentUrl = new URL(window.location.href);

                // If the link points to a different page, let the browser navigate.
                // The browser will handle going to the new page and jumping to the hash.
                if (url.pathname !== currentUrl.pathname) {
                    return;
                }

                // If it's an on-page link, prevent default and scroll smoothly.
                e.preventDefault();
                const targetId = url.hash;
                const targetElement = targetId ? document.querySelector(targetId) : null;

                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    function initActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href*="#"]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href').includes(id));
                    });
                }
            });
        }, { rootMargin: '-50% 0px -50% 0px' });

        sections.forEach(section => observer.observe(section));
    }

    function initBackToTopButton() {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) return;

        window.addEventListener('scroll', () => {
            backToTopButton.classList.toggle('show', window.scrollY > 300);
        });

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initFooter() {
        const yearSpan = document.getElementById('copyright-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }

    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    }

    function initTestimonialCarousel() {
        const carousel = document.querySelector('.testimonial-carousel');
        if (!carousel) return;

        const slidesContainer = carousel.querySelector('.testimonial-slides');
        const nextButton = carousel.querySelector('.carousel-btn.next');
        const prevButton = carousel.querySelector('.carousel-btn.prev');
        const dotsContainer = carousel.querySelector('.carousel-dots');

        if (!slidesContainer || !nextButton || !prevButton || !dotsContainer) {
            console.warn("Testimonial carousel is missing required elements.");
            return;
        }

        const slidesCount = slidesContainer.children.length;
        let index = 0;
        const slides = slidesContainer.children.length;

        nextButton.addEventListener('click', () => {
            index = (index + 1) % slides;
            slidesContainer.style.transform = `translateX(-${index * 100}%)`;
            updateDots();
        });

        prevButton.addEventListener('click', () => {
            index = (index - 1 + slides) % slides;
            slidesContainer.style.transform = `translateX(-${index * 100}%)`;
            updateDots();
        });

        // Create dots
        for (let i = 0; i < slidesCount; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dotsContainer.appendChild(dot);
        }

        const dots = dotsContainer.querySelectorAll('.carousel-dot');

        const updateDots = () => {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
        };

        dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('carousel-dot')) {
                index = parseInt(e.target.dataset.index);
                slidesContainer.style.transform = `translateX(-${index * 100}%)`;
                updateDots();
            }
        });
    }

    function initFaqAnimation() {
        // This can be enhanced, but native <details> is a good start.
    }

    function initMoreInsights() {
        const moreInsightsSection = document.querySelector('.more-insights-section');
        if (!moreInsightsSection) return;

        // Get the filename of the current page (e.g., "story-1.html")
        const currentPageFilename = window.location.pathname.split('/').pop();

        // Find all insight cards within the "More Insights" section
        const insightCards = moreInsightsSection.querySelectorAll('.insight-card');

        insightCards.forEach(card => {
            // If the card's link matches the current page, hide it
            if (card.getAttribute('href') && card.getAttribute('href').endsWith(currentPageFilename)) {
                card.style.display = 'none';
            }
        });
    }

    function initMainContactForm() {
        const form = document.querySelector('#contact-form-main');
        if (form) form.addEventListener('submit', handleFormSubmit);
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const statusEl = form.querySelector('.form-status');
        const formData = new FormData(form);

        statusEl.textContent = 'Submitting...';
        submitBtn.disabled = true;

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        })
        .then(() => {
            statusEl.textContent = 'Success! We will be in touch shortly.';
            statusEl.className = 'form-status success';
            form.reset();
        })
        .catch(() => {
            statusEl.textContent = 'Error sending message. Please try again.';
            statusEl.className = 'form-status error';
        })
        .finally(() => {
            submitBtn.disabled = false;
        });
    }
});