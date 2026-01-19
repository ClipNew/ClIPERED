window.addEventListener("load", async () => {
    // --- CONFIGURATION ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzoTqmvHZ9x1_ByIVANrW9aWf8TLb2iqkJIjDvXw8yTlaeTMlpEb3Z4FUpLQk9H-b3omg/exec";

    // --- INITIALIZE ALL PAGE FUNCTIONS ---
    await loadComponents(); // Wait for components to load before running other scripts

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
    initMainContactForm();

    // Hide preloader
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('loaded');

    function initMobileNav() {
        // This function now only handles the full-screen overlay menu
        const fullMenu = document.querySelector('.full-menu-overlay');
        const toggleButtons = document.querySelectorAll('.mobile-nav-toggle');

        if (!fullMenu || !toggleButtons.length) return;

        // --- Open/Close Full Screen Menu ---
        const toggleMenu = () => {
            const isOpen = fullMenu.classList.toggle('open');
            toggleButtons.forEach(btn => btn.setAttribute('aria-expanded', isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        };

        toggleButtons.forEach(btn => btn.addEventListener('click', toggleMenu));

        // Close menu if a link inside it is clicked
        fullMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                // Check if it's a link that navigates away or a hash link
                const href = e.target.getAttribute('href');
                if (href && href.startsWith('#')) {
                    toggleMenu();
                }
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && fullMenu.classList.contains('open')) closeMenu();
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
            iframe.src = ""; // Stop the video from playing in the background
        };

        // Consolidated close events
        [closeButton, videoModal].forEach(el => el.addEventListener('click', (e) => {
            if (e.target === videoModal || e.target === closeButton) closeVideoModal();
        }));
    }

    function initContactModal() {
        const contactModal = document.getElementById('contact-modal');
        if (!contactModal) return;

        const openButtons = document.querySelectorAll('.open-contact-modal');
        const closeButton = contactModal.querySelector('.modal-close-btn');

        openButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                contactModal.removeAttribute('aria-hidden');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeModal = () => {
            contactModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        [closeButton, contactModal].forEach(el => el.addEventListener('click', (e) => {
            if (e.target === contactModal || e.target.matches('.modal-close-btn')) closeModal();
        }));
    }

    function initSmoothScroll() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    function initActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href*="#"]');

        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    // Remove active class from all links
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                    });

                    // Add active class to the matching link
                    const activeLink = document.querySelector(`.nav-links a[href$="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, {
            rootMargin: '-50% 0px -50% 0px' // Triggers when the section is in the middle of the viewport
        });

        sections.forEach(section => observer.observe(section));
    }

    function initBackToTopButton() {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) return;

        // Show or hide the button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Show button after scrolling 300px
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        // Smooth scroll to top on click
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    function initFooter() {
        const yearSpan = document.getElementById('copyright-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate');
        if (!animatedElements.length) return;

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
        const slides = Array.from(slidesContainer.children);
        const nextButton = carousel.querySelector('.carousel-btn.next');
        const prevButton = carousel.querySelector('.carousel-btn.prev');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        let currentIndex = 0;

        if (slides.length <= 1) {
            nextButton.style.display = 'none';
            prevButton.style.display = 'none';
            return;
        }

        // Create dots
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(dotsContainer.children);

        const goToSlide = (index) => {
            // Clamp index
            if (index < 0) {
                index = slides.length - 1;
            } else if (index >= slides.length) {
                index = 0;
            }

            slidesContainer.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            updateDots();
        };

        const updateDots = () => {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        };

        nextButton.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });

        prevButton.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });

    }

    function initFaqAnimation() {
        const faqItems = document.querySelectorAll('.faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(item => {
            const summary = item.querySelector('summary');
            const answer = item.querySelector('.faq-answer');
            const content = answer.querySelector('p'); // The actual content inside

            summary.addEventListener('click', (e) => {
                // Prevent the default open/close to manage it manually
                e.preventDefault();

                if (item.open) {
                    // Closing animation
                    const openAnimation = answer.animate({ height: [`${answer.offsetHeight}px`, '0px'] }, {
                        duration: 300,
                        easing: 'ease-in-out',
                    });
                    openAnimation.onfinish = () => item.removeAttribute('open');
                } else {
                    // Opening animation
                    item.setAttribute('open', '');
                    answer.animate({ height: ['0px', `${content.offsetHeight}px`] }, {
                        duration: 300,
                        easing: 'ease-in-out',
                    });
                }
            });
        });
    }

    function initMainContactForm() {
        const form = document.getElementById('contact-form-main');
        if (!form) return;
        form.addEventListener('submit', handleFormSubmit);
    }

    // --- FORM HANDLING ---
    function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const statusEl = form.querySelector('.form-status');
        const formData = new FormData(form);

        statusEl.textContent = 'Submitting...';
        statusEl.className = 'form-status';
        submitBtn.disabled = true;

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Use 'no-cors' for Google Apps Script to avoid CORS errors
            body: formData
            })
            .then(() => {
                statusEl.textContent = 'Success! We will be in touch shortly.';
                statusEl.classList.add('success');
                form.reset();
            })
            .catch(error => {
                statusEl.textContent = 'An error occurred. Please check your connection and try again.';
                statusEl.classList.add('error');
                console.error('Error!', error.message);
            })
            .finally(() => {
                submitBtn.disabled = false;
            });
    }

    async function loadComponents() {
        const containers = document.querySelectorAll('[data-component-container]');
        const fetchPromises = Array.from(containers).map(async (container) => {
            const componentName = container.dataset.componentContainer;
            const path = `components/${componentName}.html`;
            try {
                // Use a relative path, which works both locally and on GitHub Pages
                const response = await fetch(path);

                if (!response.ok) {
                    throw new Error(`Component '${componentName}' not found at path: ${path}`);
                }
                const html = await response.text();
                container.innerHTML = html;
            } catch (error) {
                container.innerHTML = `<p style="color: red; text-align: center; padding: 1rem;">Error: ${error.message}</p>`;
                console.error(error);
            }
        });
        await Promise.all(fetchPromises);
    }

});