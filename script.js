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
    initMainContactForm();

    // Hide preloader
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('loaded');

    // --- COMPONENT LOADER ---
    async function loadComponents() {
        const containers = document.querySelectorAll('[data-component-container]');
        
        // Use './' to ensure it looks in the folder relative to index.html
        // GitHub Pages requires lowercase 'components' if that is your folder name
        const componentBasePath = './components/'; 

        const fetchPromises = Array.from(containers).map(async (container) => {
            const componentName = container.dataset.componentContainer;
            const path = `${componentBasePath}${componentName}.html`;

            try {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`Component '${componentName}' not found at path: ${path}`);
                }
                const html = await response.text();
                container.innerHTML = html;
            } catch (error) {
                container.innerHTML = `<p style="color: red; text-align: center; padding: 1rem;">Error loading component: ${error.message}</p>`;
                console.error(error);
            }
        });
        await Promise.all(fetchPromises);
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
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
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
        const slidesContainer = document.querySelector('.testimonial-slides');
        const nextButton = document.querySelector('.carousel-btn.next');
        const prevButton = document.querySelector('.carousel-btn.prev');
        if (!slidesContainer || !nextButton || !prevButton) return;

        let index = 0;
        const slides = slidesContainer.children.length;

        nextButton.addEventListener('click', () => {
            index = (index + 1) % slides;
            slidesContainer.style.transform = `translateX(-${index * 100}%)`;
        });

        prevButton.addEventListener('click', () => {
            index = (index - 1 + slides) % slides;
            slidesContainer.style.transform = `translateX(-${index * 100}%)`;
        });
    }

    function initFaqAnimation() {
        // Handled by HTML <details> tag natively
    }

    function initMainContactForm() {
        const form = document.querySelector('#contact-form');
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